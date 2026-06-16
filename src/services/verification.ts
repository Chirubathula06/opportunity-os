import { Opportunity } from '../types';

export function verifyOpportunity(opportunity: Partial<Opportunity>) {
  const notes: string[] = [];

  if (!opportunity.official_url) {
    return { verified: false, trustScore: 0, notes: ['Missing official URL.'] };
  }

  if (!opportunity.source_domain) {
    return { verified: false, trustScore: 0, notes: ['Missing source domain.'] };
  }

  if (!opportunity.title || !opportunity.provider || !opportunity.category) {
    return { verified: false, trustScore: 0, notes: ['Missing required opportunity metadata.'] };
  }

  let trustScore = 80;

  if (opportunity.official_url.includes(opportunity.source_domain)) {
    trustScore += 10;
    notes.push('Official URL matches source domain.');
  }

  if (opportunity.description) {
    trustScore += 5;
    notes.push('Description is available.');
  }

  if (opportunity.benefits?.length) {
    trustScore += 3;
    notes.push('Benefits are listed.');
  }

  if (opportunity.documents_required?.length) {
    trustScore += 2;
    notes.push('Document requirements are listed.');
  }

  trustScore = Math.min(100, trustScore);

  return {
    verified: trustScore >= 80,
    trustScore,
    notes
  };
}