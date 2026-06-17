'use client'

import { useEffect, useState, useCallback } from 'react'
import type { PublicProposalData, ProposalPackage } from '@/types'

interface ProposalPageClientProps {
  data: PublicProposalData
}

// ---- Utility -------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ---- Package Card --------------------------------------

function PackageCard({
  pkg,
  onSelect,
  onViewPixieset,
  pixiesetQuoteLink,
}: {
  pkg: ProposalPackage
  onSelect: (pkg: ProposalPackage) => void
  onViewPixieset: () => void
  pixiesetQuoteLink: string | null
}) {
  return (
    <div
      className={`package-card ${pkg.recommended ? 'package-card--signature' : 'package-card--essential'}`}
    >
      {pkg.recommended && (
        <div className="pkg-badge">Most Popular</div>
      )}

      <div className="pkg-icon">
        {pkg.recommended ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        )}
      </div>

      <p className="pkg-name">{pkg.package_name}</p>
      <hr className="pkg-rule" />
      <p className="pkg-desc">{pkg.description}</p>

      <ul className="pkg-deliverables">
        {pkg.deliverables.map((item, i) => (
          <li key={i}>
            <span className="pkg-check">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="pkg-price-row">
        <span className="pkg-price">{formatPrice(pkg.price)}</span>
        <button
          className={`btn ${pkg.recommended ? 'btn--filled' : 'btn--outline'}`}
          onClick={() => onSelect(pkg)}
        >
          I want this
        </button>
      </div>
    </div>
  )
}

// ---- FAQ Item ------------------------------------------

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{question}</span>
        <span className={`faq-chevron ${open ? 'faq-chevron--open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && <p className="faq-answer">{answer}</p>}
    </div>
  )
}

// ---- Response Modal ------------------------------------

function ResponseModal({
  type,
  selectedPackage,
  proposalId,
  onClose,
}: {
  type: 'accepted' | 'question' | 'not_ready'
  selectedPackage: ProposalPackage | null
  proposalId: string
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await fetch('/api/proposal/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          responseType: type,
          selectedPackageId: selectedPackage?.id ?? null,
          message,
        }),
      })
      setSubmitted(true)
    } catch {
      // fail silently, tracking best-effort
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    accepted: `You chose ${selectedPackage?.package_name ?? 'a package'}.`,
    question: 'Send a question.',
    not_ready: 'No pressure at all.',
  }

  const descriptions = {
    accepted: "I will reach out with next steps and your invoice shortly. You don't need to do anything else right now.",
    question: 'Type your question below and I will get back to you personally.',
    not_ready: "That is completely fine. If this changes or you want to revisit later, this link stays open. Take care of yourself.",
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {submitted ? (
          <div className="modal-success">
            <p className="modal-success-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#8B7355" strokeWidth="1.5"/>
                <path d="M10 16l4 4 8-8" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </p>
            <p className="modal-title">Got it.</p>
            <p className="modal-desc">I will be in touch soon. Thank you for taking the time to look through this.</p>
            <button className="btn btn--filled" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="modal-title">{titles[type]}</p>
            <p className="modal-desc">{descriptions[type]}</p>

            {(type === 'question') && (
              <textarea
                className="modal-textarea"
                placeholder="What is on your mind?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
              />
            )}

            {type !== 'not_ready' && (
              <button className="btn btn--filled" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : type === 'accepted' ? 'Confirm' : 'Send Question'}
              </button>
            )}

            {type === 'not_ready' && (
              <button className="btn btn--outline" onClick={onClose}>
                Close
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---- Main Page -----------------------------------------

export default function ProposalPageClient({ data }: ProposalPageClientProps) {
  const { proposal, client, template, packages } = data
  const [selectedPackage, setSelectedPackage] = useState<ProposalPackage | null>(null)
  const [modalType, setModalType] = useState<'accepted' | 'question' | 'not_ready' | null>(null)
  const [tracked, setTracked] = useState(false)

  // Track page view once on mount
  useEffect(() => {
    if (tracked) return
    setTracked(true)
    fetch('/api/proposal/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: proposal.id, eventType: 'proposal_viewed' }),
    }).catch(() => {})
  }, [proposal.id, tracked])

  const handleSelectPackage = useCallback((pkg: ProposalPackage) => {
    setSelectedPackage(pkg)
    setModalType('accepted')

    fetch('/api/proposal/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: proposal.id,
        eventType: 'package_selected',
        metadata: { package_id: pkg.id, package_name: pkg.package_name },
      }),
    }).catch(() => {})
  }, [proposal.id])

  const handlePixiesetClick = useCallback((linkType: 'quote' | 'invoice') => {
    fetch('/api/proposal/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: proposal.id,
        eventType: linkType === 'quote' ? 'pixieset_quote_clicked' : 'pixieset_invoice_clicked',
      }),
    }).catch(() => {})
  }, [proposal.id])

  const isExpired = proposal.expiration_date
    ? new Date(proposal.expiration_date) < new Date()
    : false

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #FAF7F2;
          --parchment: #F2EDE4;
          --white: #FFFFFF;
          --border: #E2D9CC;
          --gold: #8B7355;
          --text: #2C2420;
          --muted: #6B5B4E;
          --light-text: #9C8C7E;
          --accent: #C8522A;
          --serif: 'Georgia', 'Times New Roman', serif;
          --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        body {
          background: var(--cream);
          color: var(--text);
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
        }

        /* ---- Brand header ---- */
        .brand-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--cream);
          border-bottom: 1px solid var(--border);
          padding: 0.85rem 1.5rem;
          text-align: center;
        }
        .brand-header span {
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
        }

        /* ---- Hero ---- */
        .hero {
          padding: 3rem 1.25rem 2.5rem;
          text-align: center;
          max-width: 660px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.25rem;
        }
        .hero-rule {
          width: 36px;
          border: none;
          border-top: 1px solid var(--gold);
          margin: 0 auto 1.5rem;
          opacity: 0.6;
        }
        .hero-headline {
          font-family: var(--serif);
          font-size: clamp(1.75rem, 5vw, 2.75rem);
          font-weight: 400;
          color: var(--text);
          line-height: 1.25;
          margin-bottom: 1.5rem;
        }
        .hero-note {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.75;
          max-width: 520px;
          margin: 0 auto;
        }

        /* ---- Content wrapper ---- */
        .content {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 1.25rem 4rem;
        }

        /* ---- Section labels ---- */
        .section-label {
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }

        /* ---- Package grid ---- */
        .packages-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 640px) {
          .packages-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }

        /* ---- Package cards ---- */
        .package-card {
          border-radius: 3px;
          padding: 1.25rem 1.1rem;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .package-card--essential {
          background: var(--cream);
          border: 1px solid var(--border);
        }

        .package-card--signature {
          background: #2C2420;
          border: 1px solid var(--accent);
          color: #F2EDE4;
        }

        .pkg-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #FAF7F2;
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 12px;
          border-radius: 2px;
          white-space: nowrap;
        }

        .pkg-icon {
          color: var(--gold);
          margin-bottom: 0.5rem;
        }
        .package-card--signature .pkg-icon {
          color: var(--accent);
        }

        .pkg-name {
          font-family: var(--serif);
          font-size: 1.1rem;
          font-weight: 400;
          margin-bottom: 0.3rem;
        }
        .package-card--signature .pkg-name {
          color: #FAF7F2;
        }

        .pkg-rule {
          border: none;
          border-top: 1px solid var(--border);
          margin-bottom: 0.55rem;
        }
        .package-card--signature .pkg-rule {
          border-top-color: rgba(242,237,228,0.2);
        }

        .pkg-desc {
          font-size: 13px;
          line-height: 1.6;
          color: var(--muted);
          margin-bottom: 0.55rem;
          flex-grow: 0;
        }
        .package-card--signature .pkg-desc {
          color: #C5B9AD;
        }

        .pkg-deliverables {
          list-style: none;
          margin: 0 0 1rem;
          flex-grow: 1;
        }
        .pkg-deliverables li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 6px;
        }
        .package-card--signature .pkg-deliverables li {
          color: #C5B9AD;
        }
        .pkg-check {
          color: var(--gold);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .package-card--signature .pkg-check {
          color: var(--accent);
        }

        /* Price row: always side-by-side */
        .pkg-price-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          margin-top: auto;
        }

        .pkg-price {
          font-family: var(--serif);
          font-size: 1.4rem;
          color: var(--text);
          font-weight: 400;
        }
        .package-card--signature .pkg-price {
          color: #FAF7F2;
        }

        /* ---- Buttons ---- */
        .btn {
          display: inline-block;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 9px 18px;
          border-radius: 2px;
          border: 1px solid var(--text);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn--filled {
          background: var(--cream);
          color: var(--text);
          border-color: var(--cream);
        }
        .btn--filled:hover {
          background: #F0EBE2;
        }

        .btn--outline {
          background: transparent;
          color: var(--text);
          border-color: var(--border);
        }
        .btn--outline:hover {
          background: var(--parchment);
        }

        .package-card--signature .btn--filled {
          background: var(--cream);
          color: var(--text);
          border-color: var(--cream);
        }

        /* ---- Studio note ---- */
        .studio-note {
          background: var(--parchment);
          border-left: 2px solid var(--gold);
          padding: 1rem 1.25rem;
          border-radius: 0 2px 2px 0;
          margin-bottom: 2.5rem;
        }
        .studio-note p {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.65;
        }
        .studio-note strong {
          display: block;
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.4rem;
        }

        /* ---- CTA section ---- */
        .cta-section {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid var(--border);
          margin-bottom: 2.5rem;
        }
        .cta-headline {
          font-family: var(--serif);
          font-size: 1.3rem;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .cta-sub {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 1.5rem;
        }
        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }

        .btn--dark {
          background: var(--text);
          color: var(--cream);
          border-color: var(--text);
        }
        .btn--dark:hover {
          background: #1a1210;
        }

        /* ---- FAQ ---- */
        .faq-section {
          margin-bottom: 3rem;
        }
        .faq-item {
          border-bottom: 1px solid var(--border);
        }
        .faq-question {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          font-family: var(--serif);
          font-size: 15px;
          color: var(--text);
          text-align: left;
          gap: 1rem;
        }
        .faq-chevron {
          color: var(--gold);
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .faq-chevron--open {
          transform: rotate(180deg);
        }
        .faq-answer {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          padding-bottom: 1rem;
        }

        /* ---- Collage ---- */
        .collage {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 6px;
          margin-bottom: 2.5rem;
          border-radius: 3px;
          overflow: hidden;
        }
        .c-main {
          grid-row: 1 / 3;
          background: #D4C9BB;
          min-height: 260px;
        }
        .c-top {
          background: #E2D9CC;
          min-height: 130px;
        }
        .c-bot {
          background: #C8BDB0;
          min-height: 130px;
        }

        @media (max-width: 480px) {
          .collage {
            grid-template-columns: 1fr;
            grid-template-rows: 260px 180px 140px;
          }
          .c-main { grid-row: 1; }
          .c-top, .c-bot { grid-row: auto; }
        }

        /* ---- Expiry notice ---- */
        .expiry-banner {
          background: #FFF3CD;
          border: 1px solid #E8C94C;
          border-radius: 2px;
          padding: 0.75rem 1rem;
          text-align: center;
          font-size: 13px;
          color: #5C4A00;
          margin-bottom: 1.5rem;
        }

        /* ---- Pixieset quote CTA ---- */
        .quote-link-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .quote-link-section p {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        /* ---- Modal ---- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(44,36,32,0.5);
          backdrop-filter: blur(2px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          background: var(--white);
          border-radius: 4px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          position: relative;
          border: 1px solid var(--border);
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 4px;
        }
        .modal-close:hover { color: var(--text); }

        .modal-title {
          font-family: var(--serif);
          font-size: 1.25rem;
          color: var(--text);
          margin-bottom: 0.75rem;
        }
        .modal-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .modal-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 0.75rem;
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text);
          background: var(--cream);
          resize: vertical;
          margin-bottom: 1rem;
        }
        .modal-textarea:focus {
          outline: none;
          border-color: var(--gold);
        }
        .modal-success {
          text-align: center;
        }
        .modal-success-icon {
          margin-bottom: 1rem;
          color: var(--gold);
        }

        /* ---- Footer ---- */
        .proposal-footer {
          border-top: 1px solid var(--border);
          padding: 2rem 0 0;
          text-align: center;
        }
        .proposal-footer p {
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--light-text);
        }
      `}</style>

      {/* Brand Header */}
      <header className="brand-header">
        <span>EC Creative Studios</span>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <p className="hero-eyebrow">
            {proposal.session_type.charAt(0).toUpperCase() + proposal.session_type.slice(1)} Session Proposal
          </p>
          <hr className="hero-rule" />
          <h1 className="hero-headline">
            {template.hero_headline ?? 'Your season deserves to be remembered.'}
          </h1>
          {proposal.personal_note && (
            <p className="hero-note">{proposal.personal_note}</p>
          )}
        </section>

        <div className="content">

          {/* Expiry warning */}
          {isExpired && (
            <div className="expiry-banner">
              This proposal expired on {new Date(proposal.expiration_date!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Reach out to get a fresh one.
            </div>
          )}

          {/* Mood collage placeholder */}
          <div className="collage" aria-hidden="true">
            <div className="c-main" />
            <div className="c-top" />
            <div className="c-bot" />
          </div>

          {/* Packages */}
          <p className="section-label">Your options</p>
          <div className="packages-grid">
            {packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={handleSelectPackage}
                onViewPixieset={handlePixiesetClick.bind(null, 'quote')}
                pixiesetQuoteLink={proposal.pixieset_quote_link}
              />
            ))}
          </div>

          {/* Studio rental note */}
          {proposal.studio_rental_note && (
            <div className="studio-note">
              <strong>Studio Rental</strong>
              <p>{proposal.studio_rental_note}</p>
            </div>
          )}

          {/* Pixieset quote link */}
          {proposal.pixieset_quote_link && (
            <div className="quote-link-section">
              <p>Want to review the full pricing and details before deciding?</p>
              <a
                href={proposal.pixieset_quote_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline"
                onClick={() => handlePixiesetClick('quote')}
              >
                View Full Quote on Pixieset
              </a>
            </div>
          )}

          {/* Pixieset invoice link */}
          {proposal.pixieset_invoice_link && (
            <div className="quote-link-section">
              <p>Your invoice is ready. Submit your deposit to lock in your date.</p>
              <a
                href={proposal.pixieset_invoice_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--dark"
                onClick={() => handlePixiesetClick('invoice')}
              >
                View Invoice and Pay Deposit
              </a>
            </div>
          )}

          {/* CTA section */}
          <div className="cta-section">
            <p className="cta-headline">Ready to move forward?</p>
            <p className="cta-sub">
              No pressure. Pick what feels right, or send a question if something is unclear.
            </p>
            <div className="cta-buttons">
              <button
                className="btn btn--dark"
                onClick={() => {
                  setSelectedPackage(packages.find(p => p.recommended) ?? packages[0] ?? null)
                  setModalType('accepted')
                }}
              >
                I want a package
              </button>
              <button
                className="btn btn--outline"
                onClick={() => setModalType('question')}
              >
                I have a question
              </button>
              <button
                className="btn btn--outline"
                onClick={() => {
                  setModalType('not_ready')
                  fetch('/api/proposal/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ proposalId: proposal.id, eventType: 'client_not_ready' }),
                  }).catch(() => {})
                }}
              >
                Not ready yet
              </button>
            </div>
          </div>

          {/* FAQ */}
          {template.faq.length > 0 && (
            <div className="faq-section">
              <p className="section-label">Common questions</p>
              {template.faq.map((item, i) => (
                <FaqItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="proposal-footer">
            <p>EC Creative Studios &middot; Florida City, FL</p>
          </footer>
        </div>
      </main>

      {/* Modals */}
      {modalType && (
        <ResponseModal
          type={modalType}
          selectedPackage={selectedPackage}
          proposalId={proposal.id}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  )
}
