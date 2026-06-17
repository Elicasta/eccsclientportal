# EC Creative Studios Proposal OS
## Setup Guide

---

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Name it `ec-proposal-os` (or anything you prefer).
3. Once created, go to **SQL Editor**.
4. Run `supabase/migrations/001_initial_schema.sql` — this creates all tables, indexes, triggers, and RLS policies.
5. Run `supabase/seed/001_maternity_seed.sql` — this loads the maternity template and a sample Carolina Lacque House proposal for testing.
6. Go to **Settings > API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Resend Setup

1. Go to [resend.com](https://resend.com) and create an account.
2. Add and verify your sending domain (`eccreativestudios.com`).
3. Create an API key. Copy it → `RESEND_API_KEY`.
4. In `src/lib/resend/emails.ts`, update the `FROM_EMAIL` constant:
   ```
   const FROM_EMAIL = 'Emily at EC Creative <emily@eccreativestudios.com>'
   ```
   Replace with the exact verified address.

---

### 3. Local Development

```bash
# Clone or place the project files
cd ec-proposal-os

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Fill in .env.local with your Supabase and Resend keys

# Run locally
npm run dev
```

Visit:
- `http://localhost:3000/proposal/maternity/carolina-lacque-house` — client proposal (seed data)
- `http://localhost:3000/admin/proposals` — admin dashboard

---

### 4. Vercel Deployment

1. Push the project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Set framework to **Next.js** (auto-detected).
4. Add all environment variables from `.env.example` in Vercel's dashboard under **Settings > Environment Variables**.
5. Deploy.

The public URL for the first proposal will be:
```
https://yourdomain.com/proposal/maternity/carolina-lacque-house
```

---

### 5. Creating a Real Proposal

1. Go to `/admin/proposals/new`.
2. Fill in:
   - Client name, email, phone
   - Template (Maternity)
   - Slug (auto-fills from name, can be edited)
   - Personal note
   - Studio rental note if applicable
   - Pixieset quote link if you already have it
   - Expiration date (defaults to 14 days)
   - Package pricing (pre-filled with defaults, fully editable)
3. Click **Save Proposal**.
4. On the proposal detail page, click **Send Proposal Email**.
5. Client receives a branded email and clicks through to their proposal page.
6. When they click "I want this package," the status auto-updates to `invoice_needed`.
7. Paste the Pixieset invoice link in the admin, then send the invoice email.

---

### 6. Status Flow

```
draft → sent → viewed → accepted / follow_up_needed / declined
accepted → invoice_needed
invoice_needed → invoice_sent (after pasting Pixieset link + sending email)
invoice_sent → deposit_paid (mark manually)
deposit_paid → booked
```

---

### 7. Adding a New Session Template

1. Insert a row into `proposal_templates` with your new `session_type` and `slug`.
2. The new template will appear in the admin "New Proposal" dropdown.
3. The public proposal page at `/proposal/[sessionType]/[slug]` works for any session type.

No code changes needed to add Family, Newborn, Branding, etc.

---

### 8. Folder Structure

```
src/
  app/
    layout.tsx                          Root layout
    admin/
      page.tsx                          Redirects to /admin/proposals
      proposals/
        page.tsx                        Dashboard list
        new/page.tsx                    Create form
        [id]/page.tsx                   Detail + actions
    api/
      admin/
        proposals/
          route.ts                      GET list, POST create
          [id]/
            route.ts                    GET single
            status/route.ts             PATCH status
            email/route.ts              POST send email
        templates/route.ts              GET templates
      proposal/
        track/route.ts                  POST event tracking
        respond/route.ts                POST client response
    proposal/
      [sessionType]/[slug]/page.tsx     Public client proposal
  components/
    proposal/
      ProposalPageClient.tsx            Full client-side proposal UI
  lib/
    supabase/client.ts                  Supabase client factories
    resend/emails.ts                    Email send functions
    tracking/events.ts                  Server-side event helpers
  types/index.ts                        All TypeScript types
supabase/
  migrations/001_initial_schema.sql     Full schema
  seed/001_maternity_seed.sql           Test data
```

---

### 9. What Pixieset Still Handles

- Invoices
- Contracts
- Payment processing
- Deposit collection
- Receipt delivery
- Gallery delivery

This system sends a branded link to the Pixieset invoice. That is the handoff point.

---

### 10. Production Checklist

- [ ] Supabase project created, schema and seed SQL run
- [ ] Resend domain verified
- [ ] `FROM_EMAIL` in `emails.ts` updated to verified address
- [ ] `.env.local` filled in (locally) and env vars set on Vercel
- [ ] Test proposal sent from admin and received in inbox
- [ ] Client proposal page loads correctly at `/proposal/maternity/carolina-lacque-house`
- [ ] Client response triggers `invoice_needed` status in admin
- [ ] Invoice link can be pasted and invoice email sent
