import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const DISCOVERY_SECRET = Deno.env.get('DISCOVERY_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async req => {
  const authHeader = req.headers.get('authorization');
  const incomingSecret = authHeader?.replace('Bearer ', '');

  if (!DISCOVERY_SECRET || incomingSecret !== DISCOVERY_SECRET) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { data, error } = await supabase
    .from('opportunities')
    .select('id,title,official_url,deadline')
    .eq('verification_status', 'verified')
    .limit(100);

  if (error) return json({ error: error.message }, 500);

  let healthy = 0;
  let broken = 0;
  let expired = 0;

  for (const item of data ?? []) {
    const link = await verifyUrl(item.official_url);
    const deadlineStatus = getOpportunityStatus(item.deadline);

    const update: Record<string, unknown> = {
      link_status: link.status,
      link_health: link.ok ? 'healthy' : 'broken',
      last_verified_at: new Date().toISOString(),
      status: deadlineStatus
    };

    if (!link.ok) broken++;
    else healthy++;

    if (deadlineStatus === 'expired') expired++;

    await supabase
      .from('opportunities')
      .update(update)
      .eq('id', item.id);
  }

  return json({
    status: 'completed',
    checked: data?.length ?? 0,
    healthy,
    broken,
    expired
  });
});

async function verifyUrl(url: string) {
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'user-agent': 'OpportunityOSBot/1.0' }
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'user-agent': 'OpportunityOSBot/1.0' }
      });
    }

    return {
      ok:
        response.status >= 200 &&
        response.status < 400 &&
        !response.url.toLowerCase().includes('404'),
      status: response.status
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

function parseDeadlineDate(deadline: string | null) {
  if (!deadline) return null;

  const lower = deadline.toLowerCase();

  if (
    lower.includes('ongoing') ||
    lower.includes('check official') ||
    lower.includes('rolling') ||
    lower.includes('varies')
  ) {
    return null;
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

function getOpportunityStatus(deadline: string | null) {
  const date = parseDeadlineDate(deadline);

  if (!date) return 'active';

  const today = new Date();
  const deadlineDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return deadlineDate < today ? 'expired' : 'active';
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}