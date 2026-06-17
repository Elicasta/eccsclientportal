-- ============================================================
-- EC Creative Studios Proposal OS
-- Initial Schema v1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  instagram_handle TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPOSAL TEMPLATES
-- ============================================================
CREATE TABLE proposal_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  session_type  TEXT NOT NULL, -- maternity | family | newborn | branding | elopement | event
  hero_headline TEXT,
  hero_subtext  TEXT,
  faq           JSONB DEFAULT '[]'::JSONB,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPOSALS
-- ============================================================
CREATE TABLE proposals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id             UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id           UUID NOT NULL REFERENCES proposal_templates(id),
  slug                  TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN (
                            'draft','sent','viewed','follow_up_needed',
                            'accepted','invoice_needed','invoice_sent',
                            'deposit_paid','booked','declined','expired'
                          )),
  session_type          TEXT NOT NULL,
  preferred_date        TEXT,
  personal_note         TEXT,
  studio_rental_note    TEXT,
  pixieset_quote_link   TEXT,
  pixieset_invoice_link TEXT,
  expiration_date       DATE,
  sent_at               TIMESTAMPTZ,
  viewed_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPOSAL PACKAGES
-- ============================================================
CREATE TABLE proposal_packages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id   UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  package_name  TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  description   TEXT,
  deliverables  JSONB DEFAULT '[]'::JSONB, -- array of strings
  recommended   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPOSAL EVENTS (activity log)
-- ============================================================
CREATE TABLE proposal_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id   UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL
                  CHECK (event_type IN (
                    'proposal_created','email_sent','proposal_viewed',
                    'package_viewed','package_selected','question_submitted',
                    'client_not_ready','pixieset_quote_clicked',
                    'pixieset_invoice_clicked','status_changed'
                  )),
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLIENT RESPONSES
-- ============================================================
CREATE TABLE client_responses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id         UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  selected_package_id UUID REFERENCES proposal_packages(id) ON DELETE SET NULL,
  response_type       TEXT NOT NULL
                        CHECK (response_type IN ('accepted','question','not_ready')),
  message             TEXT,
  invoice_needed      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE email_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  resend_email_id TEXT,
  to_email        TEXT NOT NULL,
  subject         TEXT NOT NULL,
  email_type      TEXT NOT NULL CHECK (email_type IN ('proposal','invoice_ready','follow_up')),
  status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent','delivered','opened','clicked','bounced','failed')),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_slug ON proposals(slug);
CREATE INDEX idx_proposal_packages_proposal_id ON proposal_packages(proposal_id);
CREATE INDEX idx_proposal_events_proposal_id ON proposal_events(proposal_id);
CREATE INDEX idx_proposal_events_type ON proposal_events(event_type);
CREATE INDEX idx_client_responses_proposal_id ON client_responses(proposal_id);
CREATE INDEX idx_email_logs_proposal_id ON email_logs(proposal_id);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_proposal_packages_updated_at
  BEFORE UPDATE ON proposal_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_proposal_templates_updated_at
  BEFORE UPDATE ON proposal_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Public proposal page reads proposals by slug (no auth needed)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all RLS (used by server-side Next.js)
-- Anon can only read active proposals by slug + packages
CREATE POLICY "anon_read_proposals_by_slug"
  ON proposals FOR SELECT TO anon
  USING (status != 'draft');

CREATE POLICY "anon_read_packages"
  ON proposal_packages FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_read_templates"
  ON proposal_templates FOR SELECT TO anon
  USING (active = true);

-- Anon can insert events and responses (tracking)
CREATE POLICY "anon_insert_events"
  ON proposal_events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_responses"
  ON client_responses FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated admin has full access
CREATE POLICY "admin_all_proposals"
  ON proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_packages"
  ON proposal_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_clients"
  ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_events"
  ON proposal_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_responses"
  ON client_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_email_logs"
  ON email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_templates"
  ON proposal_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
