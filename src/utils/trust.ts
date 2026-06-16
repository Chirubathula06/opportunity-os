import { Opportunity } from '../types';

export function isTrustedOpportunity(opportunity: Opportunity) {
  return (
    !!opportunity.official_url &&
    !!opportunity.source_domain &&
    opportunity.verification_status === 'verified' &&
    opportunity.trust_score >= 80 &&
    ['active', 'upcoming'].includes(opportunity.status)
  );
}

export function getTrustExplanation(opportunity: Opportunity) {
  if (!opportunity.official_url) return 'Missing official URL.';
  if (!opportunity.source_domain) return 'Missing source domain.';
  if (opportunity.verification_status !== 'verified') {
    return 'This opportunity has not been verified yet.';
  }
  if (opportunity.trust_score < 80) {
    return 'Trust score is below the visibility threshold.';
  }

  return `Verified opportunity from ${opportunity.source_domain} with trust score ${opportunity.trust_score}.`;
}