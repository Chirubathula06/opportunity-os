import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { discoverMLH } from './adapters/mlh.ts';
import { discoverGSOC } from './adapters/gsoc.ts';
import { discoverDevpost } from './adapters/devpost.ts';
type OpportunitySource = {
  id: string;
  name: string;
  base_url: string;
  source_domain: string;
  category: string;
  trust_level: number;
};

type ExtractedOpportunity = {
  title: string;
  provider: string;
  category: string;
  country: string | null;
  states: string[] | null;
  eligible_roles: string[] | null;
  eligible_education: string[] | null;
  eligible_fields: string[] | null;
  eligible_years: string[] | null;
  eligible_gender: string | null;
  eligible_category: string | null;
  eligible_income_range: string | null;
  skills: string[] | null;
  interests: string[] | null;
  deadline: string | null;
  status: 'active' | 'upcoming' | 'expired';
  official_url: string;
  source_domain: string;
  description: string | null;
  benefits: string[] | null;
  documents_required: string[] | null;
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const DISCOVERY_SECRET = Deno.env.get('DISCOVERY_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async req => {
  try {
    const authHeader = req.headers.get('authorization');
    const incomingSecret = authHeader?.replace('Bearer ', '');

    if (!DISCOVERY_SECRET || incomingSecret !== DISCOVERY_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // ===========================
    // PHASE 3C ADAPTERS START
    // ===========================

    const adapterResults = [
     // ...(await discoverMLH()),
      ...(await discoverGSOC()),
      //...(await discoverDevpost())
    ];

    // Process adapter opportunities
    for (const item of adapterResults) {
      await processAdapterOpportunity(item);
    }

    // ===========================
    // PHASE 3C ADAPTERS END
    // ===========================

    const { data: sources, error } = await supabase
      .from('opportunity_sources')
      .select('*')
      .eq('active', true)
      .order('trust_level', { ascending: false })
      .limit(5);

    if (error) return json({ error: error.message }, 500);

    let totalFound = 0;
    let totalVerified = 0;
    let totalRejected = 0;
    const inserted: string[] = [];
    const rejected: string[] = [];

    for (const source of (sources ?? []) as OpportunitySource[]) {
  try {
    const result = await processSource(source);

    totalFound += result.found;
    totalVerified += result.verified;
    totalRejected += result.rejected;

    inserted.push(...result.insertedTitles);
    rejected.push(...result.rejectedReasons);

    await supabase.from('opportunity_sync_logs').insert({
      source_id: source.id,
      status: 'completed',
      found_count: result.found,
      verified_count: result.verified,
      rejected_count: result.rejected,
      notes: [
        `Inserted: ${result.insertedTitles.join(', ') || 'none'}`,
        `Rejected: ${result.rejectedReasons.join(' | ') || 'none'}`
      ].join('\n')
    });
  } catch (err) {
    console.error(source.name, err);

    totalRejected++;

    await supabase.from('opportunity_sync_logs').insert({
      source_id: source.id,
      status: 'failed',
      found_count: 0,
      verified_count: 0,
      rejected_count: 1,
      notes:
        err instanceof Error
          ? err.message
          : 'Unknown source failure'
    });
  }
}

    return json({
      status: 'completed',
      found: totalFound,
      verified: totalVerified,
      rejected: totalRejected,
      inserted,
      rejected_reasons: rejected
    });

  } catch (error) {
    return json(
      {
        error: error instanceof Error
          ? error.message
          : 'Unknown error'
      },
      500
    );
  }
});

async function processSource(source: OpportunitySource) {
  let found = 0;
  let verified = 0;
  let rejected = 0;
  const insertedTitles: string[] = [];
  const rejectedReasons: string[] = [];

  const sourceCheck = await verifyUrl(source.base_url);

  if (!sourceCheck.ok) {
    return {
      found: 0,
      verified: 0,
      rejected: 1,
      insertedTitles: [],
      rejectedReasons: [`${source.name}: source URL unavailable`]
    };
  }

  const html = await fetchHtml(source.base_url);
  if (!html) {
  return {
    found: 0,
    verified: 0,
    rejected: 1,
    insertedTitles: [],
    rejectedReasons: [
      `${source.name}: page unavailable`
    ]
  };
}
  const discoveredLinks = extractLinks(
    html,
    source.base_url,
    source.source_domain
  );

  const readableText = htmlToReadableText(html).slice(0, 35000);
  const extracted = await extractWithAI(source, readableText, discoveredLinks);

  found = extracted.length;

  for (const opportunity of extracted) {
    const verification = await verifyExtractedOpportunity(opportunity, source);
    if (isBadOpportunityTitle(opportunity.title)) {
  rejected++;
  rejectedReasons.push(`${opportunity.title}: rejected as article/news content`);
  continue;
}
    if (!verification.ok) {
      rejected++;
      rejectedReasons.push(
        `${opportunity.title || 'Unknown'}: ${verification.notes.join(', ')}`
      );
      continue;
    }

    const deadlineDate = parseDeadlineDate(opportunity.deadline);
    const finalStatus = getOpportunityStatus(opportunity.deadline);

    if (finalStatus === 'expired') {
      rejected++;
      rejectedReasons.push(`${opportunity.title}: deadline already expired`);
      continue;
    }

    const qualityScore = calculateQualityScore({
      trustScore: verification.trustScore,
      hasDeadline: !!opportunity.deadline,
      hasDeadlineDate: !!deadlineDate,
      hasDescription: !!opportunity.description,
      hasBenefits: !!opportunity.benefits?.length,
      hasDocuments: !!opportunity.documents_required?.length,
      linkHealthy: verification.linkHealth === 'healthy'
    });
    const normalizedTitle = normalizeTitle(opportunity.title);
const dedupeKey = createDedupeKey(opportunity.title, opportunity.provider);
const urgencyLabel = getUrgencyLabel(deadlineDate);
const existing = await supabase
  .from('opportunities')
  .select('id')
  .eq('dedupe_key', dedupeKey)
  .maybeSingle();

if (existing.data) {
  continue;
}
    const { error } = await supabase.from('opportunities').upsert(
      {
        title: opportunity.title,
        provider: opportunity.provider,
        category: opportunity.category || source.category,
        country: opportunity.country,
        states: opportunity.states,
        eligible_roles: opportunity.eligible_roles,
        eligible_education: opportunity.eligible_education,
        eligible_fields: opportunity.eligible_fields,
        eligible_years: opportunity.eligible_years,
        eligible_gender: opportunity.eligible_gender,
        eligible_category: opportunity.eligible_category,
        eligible_income_range: opportunity.eligible_income_range,
        skills: opportunity.skills,
        interests: opportunity.interests,
        deadline: opportunity.deadline,
        deadline_date: deadlineDate,
        status: finalStatus,
        official_url: verification.finalUrl,
        source_domain: opportunity.source_domain || source.source_domain,
        trust_score: verification.trustScore,
        link_status: verification.linkStatus,
        link_health: verification.linkHealth,
        quality_score: qualityScore,
        normalized_title: normalizedTitle,
dedupe_key: dedupeKey,
freshness_label: 'new',
urgency_label: urgencyLabel,
        last_verified_at: new Date().toISOString(),
        verification_status: 'verified',
        verification_notes: verification.notes,
        description: opportunity.description,
        benefits: opportunity.benefits,
        documents_required: opportunity.documents_required,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'title' }
    );

    if (error) {
      rejected++;
      rejectedReasons.push(
        `${opportunity.title}: database upsert failed: ${error.message}`
      );
    } else {
      verified++;
      insertedTitles.push(opportunity.title);
    }
  }

  return {
    found,
    verified,
    rejected,
    insertedTitles,
    rejectedReasons
  };
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'OpportunityOSBot/1.0 verified-opportunity-discovery'
    }
  });

  if (!response.ok) {
  return '';
}

  return await response.text();
}

function extractLinks(html: string, baseUrl: string, trustedDomain: string) {
  const links = new Set<string>();
  const regex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const href = match[1];

    try {
      const url = new URL(href, baseUrl);
      const clean = url.toString().split('#')[0];

      if (url.hostname.includes(trustedDomain)) {
        links.add(clean);
      }
    } catch {
      // ignore invalid links
    }
  }

  return Array.from(links)
    .filter(link => {
      const lower = link.toLowerCase();

      return (
        lower.includes('apply') ||
        lower.includes('program') ||
        lower.includes('scholarship') ||
        lower.includes('fellowship') ||
        lower.includes('hackathon') ||
        lower.includes('internship') ||
        lower.includes('grant') ||
        lower.includes('student') ||
        lower.includes('season') ||
        lower.includes('opportun') ||
        lower.includes('award') ||
        lower.includes('challenge')
      );
    })
    .slice(0, 40);
}

function htmlToReadableText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractWithAI(
  source: OpportunitySource,
  pageText: string,
  discoveredLinks: string[]
): Promise<ExtractedOpportunity[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const allowedLinks = [source.base_url, ...discoveredLinks];

  const prompt = `
You are the Opportunity OS extraction engine.

Extract ONLY real ongoing or upcoming opportunities from the page text.

CRITICAL RULES:
- Do not invent opportunities.
- Do not invent official_url.
- official_url MUST be one of the allowed official_url values listed below.
- If no specific opportunity is visible, return [].
- Do not return generic website names unless they are clearly ongoing programs.
- Prefer specific opportunities with application pages.
- Reject expired opportunities.
- deadline can be "Ongoing" or "Check official source" only when exact date is not visible.
- status must be "active" or "upcoming" unless clearly expired.
- Return valid JSON only.

Source:
Name: ${source.name}
Base URL: ${source.base_url}
Trusted domain: ${source.source_domain}
Default category: ${source.category}

Allowed official_url values:
${allowedLinks.join('\n')}

Page text:
${pageText}

Return this JSON:
{
  "opportunities": [
    {
      "title": "string",
      "provider": "string",
      "category": "string",
      "country": "string or null",
      "states": ["string"] or null,
      "eligible_roles": ["Student", "Developer", "Founder", "Professional", "Researcher", "Citizen"] or null,
      "eligible_education": ["School", "Intermediate", "Diploma", "Undergraduate", "Postgraduate", "PhD", "Graduate", "Other"] or null,
      "eligible_fields": ["AI", "Computer Science", "Engineering", "Business", "Medical", "Law", "Arts", "Design", "Research", "Agriculture", "Other"] or null,
      "eligible_years": ["1st year", "2nd year", "3rd year", "4th year", "Final year", "Graduate", "Not applicable"] or null,
      "eligible_gender": "string or null",
      "eligible_category": "string or null",
      "eligible_income_range": "string or null",
      "skills": ["string"] or null,
      "interests": ["string"] or null,
      "deadline": "string or null",
      "status": "active | upcoming | expired",
      "official_url": "string",
      "source_domain": "string",
      "description": "string or null",
      "benefits": ["string"] or null,
      "documents_required": ["string"] or null
    }
  ]
}
`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = await response.json();

  const outputText =
    result.output_text ??
    result.output?.[0]?.content?.[0]?.text ??
    '';

  const parsed = safeJsonParse(outputText);

  return Array.isArray(parsed?.opportunities) ? parsed.opportunities : [];
}

async function verifyExtractedOpportunity(
  opportunity: ExtractedOpportunity,
  source: OpportunitySource
) {
  const notes: string[] = [];

  if (!opportunity.title || opportunity.title.length < 3) {
    return fail('Missing title.');
  }

  if (!opportunity.provider) {
    return fail('Missing provider.');
  }

  if (!opportunity.official_url) {
    return fail('Missing official URL.');
  }

  if (opportunity.status === 'expired') {
    return fail('Opportunity marked expired.');
  }

  let url: URL;

  try {
    url = new URL(opportunity.official_url);
  } catch {
    return fail('Invalid official URL.');
  }

  if (!url.hostname.includes(source.source_domain)) {
    return fail(
      `URL domain ${url.hostname} does not match trusted domain ${source.source_domain}.`
    );
  }

  const urlCheck = await verifyUrl(opportunity.official_url);

  if (!urlCheck.ok) {
    return fail(`Official URL failed verification: HTTP ${urlCheck.status}.`);
  }

  let trustScore = Math.max(80, source.trust_level);

  trustScore += 8;
  notes.push('Official URL is live and matches trusted source domain.');

  if (opportunity.description && opportunity.description.length > 30) {
    trustScore += 3;
    notes.push('Description extracted.');
  }

  if (opportunity.deadline) {
    trustScore += 2;
    notes.push('Deadline/status information extracted.');
  }

  trustScore = Math.min(100, trustScore);

  return {
    ok: true,
    trustScore,
    finalUrl: urlCheck.finalUrl ?? opportunity.official_url,
    linkStatus: urlCheck.status,
    linkHealth: 'healthy',
    notes
  };
}

async function verifyUrl(url: string) {
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'user-agent': 'OpportunityOSBot/1.0'
      }
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'user-agent': 'OpportunityOSBot/1.0'
        }
      });
    }

    const ok =
      response.status >= 200 &&
      response.status < 400 &&
      !response.url.toLowerCase().includes('404') &&
      !response.url.toLowerCase().includes('not-found');

    return {
      ok,
      status: response.status,
      finalUrl: response.url
    };
  } catch {
    return {
      ok: false,
      status: 0,
      finalUrl: null
    };
  }
}

function parseDeadlineDate(deadline: string | null) {
  if (!deadline) return null;

  const lower = deadline.toLowerCase();

  if (
    lower.includes('ongoing') ||
    lower.includes('check official') ||
    lower.includes('rolling') ||
    lower.includes('varies') ||
    lower.includes('not specified')
  ) {
    return null;
  }

  const parsed = new Date(deadline);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function getOpportunityStatus(deadline: string | null) {
  const date = parseDeadlineDate(deadline);

  if (!date) return 'active';

  const today = new Date();
  const deadlineDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  if (deadlineDate < today) return 'expired';

  return 'active';
}

function calculateQualityScore(input: {
  trustScore: number;
  hasDeadline: boolean;
  hasDeadlineDate: boolean;
  hasDescription: boolean;
  hasBenefits: boolean;
  hasDocuments: boolean;
  linkHealthy: boolean;
}) {
  let score = 0;

  score += Math.round(input.trustScore * 0.45);

  if (input.linkHealthy) score += 20;
  if (input.hasDeadline) score += 8;
  if (input.hasDeadlineDate) score += 8;
  if (input.hasDescription) score += 8;
  if (input.hasBenefits) score += 6;
  if (input.hasDocuments) score += 5;

  return Math.min(100, score);
}

function fail(note: string) {
  return {
    ok: false,
    trustScore: 0,
    finalUrl: null,
    linkStatus: 0,
    linkHealth: 'broken',
    notes: [note]
  };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
async function processAdapterOpportunity(item: any) {
  if (!item?.official_url) return;

  const check = await verifyUrl(item.official_url);

  if (!check.ok) {
    return;
  }

  const deadlineDate = null;

  const qualityScore = calculateQualityScore({
    trustScore: 95,
    hasDeadline: false,
    hasDeadlineDate: false,
    hasDescription: true,
    hasBenefits: false,
    hasDocuments: false,
    linkHealthy: true
  });

  const normalizedTitle = normalizeTitle(item.title);

  const dedupeKey = createDedupeKey(
    item.title,
    item.provider
  );

  await supabase
    .from('opportunities')
    .upsert(
      {
        title: item.title,
        provider: item.provider,
        category: item.category,

        official_url: check.finalUrl,

        source_domain: new URL(
          check.finalUrl
        ).hostname,

        status: 'active',

        trust_score: 95,

        quality_score: qualityScore,

        link_status: check.status,

        link_health: 'healthy',

        normalized_title: normalizedTitle,

        dedupe_key: dedupeKey,

        freshness_label: 'new',

        urgency_label: 'open',

        last_verified_at:
          new Date().toISOString(),

        verification_status: 'verified',

        verification_notes: [
          'Inserted by source adapter'
        ],

        description:
          item.title +
          ' discovered from trusted adapter source.',

        deadline_date: deadlineDate,

        updated_at:
          new Date().toISOString()
      },
      {
        onConflict: 'title'
      }
    );
}
function isBadOpportunityTitle(title: string) {
  const lower = title.toLowerCase();

  const badPhrases = [
    'supporting',
    'strengthening',
    'lighting up',
    'turning destinations',
    'news',
    'story',
    'report',
    'press release',
    'blog',
    'article'
  ];

  return badPhrases.some(phrase => lower.includes(phrase));
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}
function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(program|application|apply|official|portal|opportunity)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createDedupeKey(title: string, provider: string) {
  return `${normalizeTitle(provider)}::${normalizeTitle(title)}`;
}

function getFreshnessLabel(createdAt?: string | null) {
  if (!createdAt) return 'new';

  const created = new Date(createdAt);
  const now = new Date();
  const ageDays = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (ageDays <= 7) return 'new';
  if (ageDays <= 30) return 'recent';

  return 'existing';
}

function getUrgencyLabel(deadlineDate: string | null) {
  if (!deadlineDate) return 'open';

  const today = new Date();
  const deadline = new Date(deadlineDate);

  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'closing_soon';
  if (diffDays <= 30) return 'deadline_soon';

  return 'open';
}