# Opportunity OS Automation Design

Opportunity OS should not rely on users manually adding opportunities.

## Pipeline

Trusted Sources  
→ AI Extraction  
→ Verification Engine  
→ Supabase Database  
→ Mobile Matching Engine  
→ User Dashboard

## Trusted Sources

- Google Summer of Code
- Devpost
- MLH
- National Scholarship Portal
- AICTE
- Startup India
- MyGov
- DAAD
- MITACS
- UNESCO
- Fulbright
- Chevening
- Erasmus Mundus
- GitHub Campus Experts
- Microsoft Learn Student Ambassadors
- Y Combinator Startup School

## Production Design

A backend scheduled job should run daily.

The job should:

1. Read active sources from `opportunity_sources`.
2. Fetch official source pages or APIs.
3. Extract opportunity title, provider, deadline, eligibility, benefits, and official URL.
4. Verify source domain.
5. Reject records with missing official URLs.
6. Reject low-trust or incomplete opportunities.
7. Insert or update verified opportunities in Supabase.
8. Log results in `opportunity_sync_logs`.

## Important Rule

The mobile app must only read verified opportunities.

Normal users must not manually create opportunity records from the app.