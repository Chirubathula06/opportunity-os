export type UserRole =
  | 'Student'
  | 'Developer'
  | 'Founder'
  | 'Professional'
  | 'Researcher'
  | 'Citizen';

export type OpportunityStatus = 'active' | 'upcoming' | 'expired';

export type SavedStatus =
  | 'saved'
  | 'planning'
  | 'applied'
  | 'selected'
  | 'rejected'
  | 'expired';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole | null;
  country: string | null;
  state: string | null;
  city: string | null;
  education_level: string | null;
  field_of_study: string | null;
  current_year: string | null;
  gender: string | null;
  category: string | null;
  income_range: string | null;
  skills: string[] | null;
  interests: string[] | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Opportunity = {
  id: string;
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
  deadline_date: string | null;
  status: OpportunityStatus;
  official_url: string;
  source_domain: string;
  trust_score: number;
  link_status: number | null;
  link_health: string | null;
  quality_score: number | null;
  normalized_title: string | null;
  dedupe_key: string | null;
  freshness_label: string | null;
  urgency_label: string | null;
  last_verified_at: string | null;
  verification_status: string;
  verification_notes: string[] | null;
  description: string | null;
  benefits: string[] | null;
  documents_required: string[] | null;
  created_at: string;
  updated_at: string;
};

export type SavedOpportunity = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: SavedStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
};

export type MatchResult = {
  score: number;
  reasons: string[];
  missingRequirements: string[];
  recommendedAction: string;
};