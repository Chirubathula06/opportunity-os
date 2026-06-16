import { MatchResult, Opportunity, Profile } from '../types';

export type RankedOpportunity = {
  opportunity: Opportunity;
  match: MatchResult;
};

const norm = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const overlap = (a?: string[] | null, b?: string[] | null) => {
  const aa = a ?? [];
  const bb = b ?? [];
  return aa.filter(x => bb.map(norm).includes(norm(x)));
};

export function calculateMatch(
  profile: Profile,
  opportunity: Opportunity
): MatchResult {
  let score = 0;
  const reasons: string[] = [];
  const missingRequirements: string[] = [];

  if (opportunity.eligible_roles?.includes(profile.role ?? '')) {
    score += 18;
    reasons.push('Your role matches this opportunity.');
  }

  if (
    !opportunity.country ||
    norm(opportunity.country) === 'global' ||
    norm(opportunity.country) === norm(profile.country)
  ) {
    score += 12;
    reasons.push('This opportunity is available in your country.');
  }

  if (opportunity.eligible_education?.includes(profile.education_level ?? '')) {
    score += 12;
    reasons.push('Your education level matches the eligibility.');
  }

  if (opportunity.eligible_fields?.includes(profile.field_of_study ?? '')) {
    score += 10;
    reasons.push('Your field matches this opportunity.');
  }

  if (opportunity.eligible_years?.includes(profile.current_year ?? '')) {
    score += 8;
    reasons.push('Your current year matches the requirement.');
  }

  const skillHits = overlap(profile.skills, opportunity.skills);
  if (skillHits.length) {
    score += Math.min(16, skillHits.length * 4);
    reasons.push(`Your skills match: ${skillHits.join(', ')}.`);
  }

  const interestHits = overlap(profile.interests, opportunity.interests);
  if (interestHits.length) {
    score += Math.min(16, interestHits.length * 4);
    reasons.push(`Your interests match: ${interestHits.join(', ')}.`);
  }

  if (
    opportunity.eligible_gender &&
    norm(opportunity.eligible_gender) !== norm(profile.gender)
  ) {
    score -= 12;
    missingRequirements.push(
      `This opportunity requires: ${opportunity.eligible_gender}.`
    );
  }

  if (
    opportunity.eligible_category &&
    norm(opportunity.eligible_category) !== norm(profile.category)
  ) {
    score -= 8;
    missingRequirements.push(
      `This opportunity may require category verification: ${opportunity.eligible_category}.`
    );
  }

  if (
    opportunity.eligible_income_range &&
    norm(opportunity.eligible_income_range) !== norm(profile.income_range)
  ) {
    score -= 8;
    missingRequirements.push(
      `This opportunity may require income verification: ${opportunity.eligible_income_range}.`
    );
  }

  if (opportunity.status === 'active' || opportunity.status === 'upcoming') {
    score += 8;
  }

  score += Math.min(10, Math.round(opportunity.trust_score / 10));

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    reasons,
    missingRequirements,
    recommendedAction:
      finalScore >= 80
        ? 'Strong match. Review documents and apply from the official source.'
        : finalScore >= 55
          ? 'Good potential match. Check eligibility details before applying.'
          : 'Review missing requirements before spending time on this opportunity.'
  };
}

export function rankOpportunities(
  profile: Profile,
  opportunities: Opportunity[]
): RankedOpportunity[] {
  return opportunities
    .map(opportunity => ({
      opportunity,
      match: calculateMatch(profile, opportunity)
    }))
    .sort(
      (a, b) =>
        b.match.score - a.match.score ||
        b.opportunity.trust_score - a.opportunity.trust_score
    );
}