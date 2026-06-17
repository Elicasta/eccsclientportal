-- ============================================================
-- EC Creative Studios Proposal OS
-- Seed Data: Maternity Template + Carolina Lacque House Demo
-- ============================================================

-- Maternity Template
INSERT INTO proposal_templates (id, name, slug, session_type, hero_headline, hero_subtext, faq)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Maternity',
  'maternity',
  'maternity',
  'Your season deserves to be remembered.',
  'I put this together specifically for you. Each option is built around the kind of images, feeling, and experience that will matter most when you look back on this time.',
  '[
    {
      "question": "Where will the session take place?",
      "answer": "Most maternity sessions happen outdoors at a curated location, or in a private studio space if you prefer a cleaner, more editorial look. We will talk through what feels right for you after you choose your package."
    },
    {
      "question": "When should I book my maternity session?",
      "answer": "The ideal window is between 28 and 34 weeks. Your bump is beautifully full, and you still feel comfortable moving around. We can work around your schedule from there."
    },
    {
      "question": "What should I wear?",
      "answer": "I will send you a style guide after booking. Generally: flowing fabrics, solid tones, and pieces that feel like you. If you want a specific look or gown, some can be arranged through the studio."
    },
    {
      "question": "How long until I see my photos?",
      "answer": "Gallery delivery is typically 2 to 3 weeks after your session. You will receive a private Pixieset gallery link directly to your inbox."
    },
    {
      "question": "What if I need to reschedule?",
      "answer": "Life happens. We can move your session once at no charge with at least 48 hours notice. Your deposit holds your new date."
    },
    {
      "question": "Is the studio rental included?",
      "answer": "Studio rental is a separate fee and is not included in the session prices listed here. If you want a studio session, we will add that to your invoice separately so you can see the full picture."
    }
  ]'::JSONB
);

-- Client: Carolina Lacque House
INSERT INTO clients (id, first_name, last_name, email, phone, instagram_handle)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Carolina',
  'Lacque House',
  'carolina@example.com',
  '(305) 555-0192',
  '@carolinalacquehouse'
);

-- Proposal
INSERT INTO proposals (
  id,
  client_id,
  template_id,
  slug,
  status,
  session_type,
  preferred_date,
  personal_note,
  studio_rental_note,
  pixieset_quote_link,
  pixieset_invoice_link,
  expiration_date
)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'carolina-lacque-house',
  'sent',
  'maternity',
  'Late October / Early November',
  'Hi Carolina, I have been looking forward to putting this together for you. I kept your vibe in mind the whole time, and I think one of these options is going to feel exactly right. Take your time looking through it, and reach out if anything feels off.',
  'If you are drawn to the studio option, studio rental is a separate fee and will be added to your invoice. I will make sure you see the full number before anything is confirmed.',
  'https://pixieset.com/c/quote-example-link',
  NULL,
  CURRENT_DATE + INTERVAL '14 days'
);

-- Packages for Carolina's Proposal
INSERT INTO proposal_packages (proposal_id, package_name, price, description, deliverables, recommended, sort_order)
VALUES
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'The Essential',
  395.00,
  'A focused session built around one location and one look. Clean, personal, and complete.',
  '["1-hour session", "1 location", "1 outfit", "25 edited digital images", "Private Pixieset gallery", "Print release included"]'::JSONB,
  FALSE,
  1
),
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'The Signature',
  595.00,
  'More time, more looks, more images. This is the most popular option for clients who want the full experience.',
  '["2-hour session", "1-2 locations", "2 outfit changes", "50 edited digital images", "Private Pixieset gallery", "Print release included", "1 complimentary 5x7 print"]'::JSONB,
  TRUE,
  2
),
(
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'The Full Story',
  895.00,
  'For the client who wants everything documented. A longer session, multiple looks, and the kind of coverage that tells the whole story of this season.',
  '["3-hour session", "Up to 3 locations", "3 outfit changes", "80+ edited digital images", "Private Pixieset gallery", "Print release included", "3 complimentary prints (up to 8x10)", "15% off any add-on products"]'::JSONB,
  FALSE,
  3
);

-- Initial event
INSERT INTO proposal_events (proposal_id, client_id, event_type, metadata)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'proposal_created',
  '{"created_by": "admin", "session_type": "maternity"}'::JSONB
);
