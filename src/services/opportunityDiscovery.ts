import { supabase } from '../lib/supabase';
import { verifyOpportunity } from './verification';

type DiscoveredOpportunity = {
  title: string;
  provider: string;
  category: string;
  country?: string;
  deadline?: string;
  official_url: string;
  source_domain: string;
  description?: string;
  benefits?: string[];
  documents_required?: string[];
  skills?: string[];
  interests?: string[];
};

export async function syncOpportunities() {
  /**
   * MVP stub.
   *
   * In production, this should run on a backend scheduler, not inside the mobile app.
   * Flow:
   * Trusted Sources → Extraction → Verification → Supabase opportunities table
   */

  const discovered: DiscoveredOpportunity[] = [];

  let foundCount = discovered.length;
  let verifiedCount = 0;
  let rejectedCount = 0;

  for (const item of discovered) {
    const verification = verifyOpportunity(item);

    if (!verification.verified) {
      rejectedCount++;
      continue;
    }

    const { error } = await supabase.from('opportunities').upsert(
      {
        ...item,
        trust_score: verification.trustScore,
        verification_status: 'verified',
        verification_notes: verification.notes,
        status: 'active',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'title' }
    );

    if (error) {
      rejectedCount++;
    } else {
      verifiedCount++;
    }
  }

  return {
    status: 'completed',
    foundCount,
    verifiedCount,
    rejectedCount
  };
}