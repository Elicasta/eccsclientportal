'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface ProposalDetail {
  id: string
  slug: string
  status: string
  session_type: string
  preferred_date: string | null
  personal_note: string | null
  studio_rental_note: string | null
  pixieset_quote_link: string | null
  pixieset_invoice_link: string | null
  expiration_date: string | null
  sent_at: string | null
  viewed_at: string | null
  client: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
    instagram_handle: string | null
  }
  packages: Array<{
    id: string
    package_name: string
    price: number
    recommended: boolean
  }>
  latest_response?: {
    response_type: string
    selected_package_id: string | null
    message: string | null
    invoice_needed: boolean
    created_at: string
  } | null
  event_count: number
}

const STATUS_FLOW: Record<string, string[]> = {
  draft:            ['sent'],
  sent:             ['viewed', 'follow_up_needed', 'declined'],
  viewed:           ['follow_up_needed', 'accepted', 'invoice_needed', 'declined'],
  follow_up_needed: ['invoice_needed', 'declined'],
  accepted:         ['invoice_needed'],
  invoice_needed:   ['invoice_sent'],
  invoice_sent:     ['deposit_paid'],
  deposit_paid:     ['booked'],
  booked:           [],
  declined:         [],
  expired:          [],
}

export default function ProposalDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [proposal, setProposal] = useState<ProposalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [invoiceLink, setInvoiceLink] = useState('')
  const [showInvoiceInput, setShowInvoiceInput] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadProposal = () => {
    fetch(`/api/admin/proposals/${id}`)
      .then(r => r.json())
      .then(d => { setProposal(d.proposal); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadProposal() }, [id])

  const sendEmail = async (type: 'proposal' | 'invoice_ready') => {
    setActionLoading(type)
    try {
      const res = await fetch(`/api/admin/proposals/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      showToast(type === 'proposal' ? 'Proposal email sent.' : 'Invoice email sent.')
      loadProposal()
    } catch (e: any) {
      showToast(`Error: ${e.message}`)
    } finally {
      setActionLoading('')
    }
  }

  const updateStatus = async (newStatus: string) => {
    setActionLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/proposals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast(`Status updated to ${newStatus}.`)
      loadProposal()
    } catch {
      showToast('Could not update status.')
    } finally {
      setActionLoading('')
    }
  }

  const saveInvoiceLink = async () => {
    if (!invoiceLink.trim()) return
    setActionLoading('invoice_link')
    try {
      const res = await fetch(`/api/admin/proposals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invoice_sent', pixieset_invoice_link: invoiceLink }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Invoice link saved.')
      setShowInvoiceInput(false)
      setInvoiceLink('')
      loadProposal()
    } catch {
      showToast('Could not save invoice link.')
    } finally {
      setActionLoading('')
    }
  }

  const copyLink = async () => {
    if (!proposal) return
    const url = `${window.location.origin}/proposal/${proposal.session_type}/${proposal.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#6B5B4E' }}>Loading...</div>
  if (!proposal) return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Proposal not found.</div>

  const nextStatuses = STATUS_FLOW[proposal.status] ?? []

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --cream:#FAF7F2;--parchment:#F2EDE4;--border:#E2D9CC;--gold:#8B7355;--text:#2C2420;--muted:#6B5B4E;--serif:'Georgia',serif;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
        body { background:var(--cream);color:var(--text);font-family:var(--sans);font-size:14px;-webkit-font-smoothing:antialiased; }

        .page { max-width:760px;margin:0 auto;padding:2rem 1.25rem 4rem; }
        .back-link { display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);text-decoration:none;margin-bottom:1.5rem; }
        .back-link:hover { color:var(--text); }
        .page-header { display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:2rem;flex-wrap:wrap; }
        .page-title { font-family:var(--serif);font-size:1.5rem;font-weight:400; }
        .page-sub { font-size:12px;color:var(--muted);margin-top:3px; }

        .card { background:white;border:1px solid var(--border);border-radius:3px;padding:1.25rem;margin-bottom:1rem; }
        .card-title { font-family:var(--serif);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem; }

        .meta-grid { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
        @media (max-width:560px) { .meta-grid { grid-template-columns:1fr; } }
        .meta-item label { font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:2px; }
        .meta-item p { font-size:13px;color:var(--text); }

        .actions-row { display:flex;flex-wrap:wrap;gap:0.6rem;margin-bottom:1rem; }
        .btn { display:inline-block;font-family:var(--sans);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;padding:8px 14px;border-radius:2px;border:1px solid;cursor:pointer;transition:background 0.12s;text-decoration:none;white-space:nowrap; }
        .btn--dark { background:var(--text);color:var(--cream);border-color:var(--text); }
        .btn--dark:hover:not(:disabled) { background:#1a1210; }
        .btn--ghost { background:transparent;color:var(--muted);border-color:var(--border); }
        .btn--ghost:hover { background:var(--parchment);color:var(--text); }
        .btn--accent { background:#C8522A;color:#FAF7F2;border-color:#C8522A; }
        .btn--accent:hover:not(:disabled) { background:#A8401C; }
        .btn:disabled { opacity:0.5;cursor:not-allowed; }

        .badge { display:inline-block;padding:3px 10px;border-radius:2px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase; }

        .invoice-input-row { display:flex;gap:0.5rem;margin-top:0.75rem; }
        .invoice-input-row input { flex:1;border:1px solid var(--border);border-radius:2px;padding:8px 10px;font-family:var(--sans);font-size:13px;background:var(--cream); }
        .invoice-input-row input:focus { outline:none;border-color:var(--gold); }

        .response-card { border:1px solid #E8C94C;background:#FFFDE7;border-radius:3px;padding:1rem;margin-top:0.75rem; }
        .response-card h4 { font-family:var(--serif);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7A5C00;margin-bottom:0.5rem; }
        .response-card p { font-size:13px;color:#5C4A00; }

        .toast { position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--text);color:var(--cream);padding:0.6rem 1.25rem;border-radius:2px;font-size:13px;z-index:999;pointer-events:none; }

        .pkg-list { list-style:none; }
        .pkg-list li { display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:13px; }
        .pkg-list li:last-child { border-bottom:none; }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className="page">
        <Link href="/admin/proposals" className="back-link">← All proposals</Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{proposal.client.first_name} {proposal.client.last_name}</h1>
            <p className="page-sub">{proposal.session_type} &middot; /proposal/{proposal.session_type}/{proposal.slug}</p>
          </div>
          <div className="actions-row">
            <a href={`/proposal/${proposal.session_type}/${proposal.slug}`} target="_blank" className="btn btn--ghost">Preview</a>
            <button className="btn btn--ghost" onClick={copyLink}>{copied ? 'Copied!' : 'Copy Link'}</button>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="card">
          <p className="card-title">Status & Actions</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>
            Current: <strong style={{ color: 'var(--text)' }}>{proposal.status}</strong>
            {proposal.viewed_at && <span> &middot; Viewed {new Date(proposal.viewed_at).toLocaleDateString()}</span>}
          </p>

          <div className="actions-row">
            {/* Send proposal email */}
            {(proposal.status === 'draft' || proposal.status === 'sent') && (
              <button className="btn btn--dark" onClick={() => sendEmail('proposal')} disabled={actionLoading === 'proposal'}>
                {actionLoading === 'proposal' ? 'Sending...' : 'Send Proposal Email'}
              </button>
            )}

            {/* Invoice action */}
            {proposal.status === 'invoice_needed' && (
              <button className="btn btn--accent" onClick={() => setShowInvoiceInput(!showInvoiceInput)}>
                Paste Invoice Link
              </button>
            )}

            {/* Send invoice email */}
            {proposal.status === 'invoice_needed' && proposal.pixieset_invoice_link && (
              <button className="btn btn--dark" onClick={() => sendEmail('invoice_ready')} disabled={actionLoading === 'invoice_ready'}>
                {actionLoading === 'invoice_ready' ? 'Sending...' : 'Send Invoice Email'}
              </button>
            )}

            {/* Manual status buttons */}
            {nextStatuses.map(s => (
              <button key={s} className="btn btn--ghost" onClick={() => updateStatus(s)} disabled={actionLoading === s}>
                Mark {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {showInvoiceInput && (
            <div className="invoice-input-row">
              <input
                value={invoiceLink}
                onChange={e => setInvoiceLink(e.target.value)}
                placeholder="https://pixieset.com/..."
              />
              <button className="btn btn--dark" onClick={saveInvoiceLink} disabled={actionLoading === 'invoice_link'}>
                Save
              </button>
            </div>
          )}

          {/* Client response */}
          {proposal.latest_response && (
            <div className="response-card">
              <h4>Client Response: {proposal.latest_response.response_type}</h4>
              {proposal.latest_response.message && (
                <p>"{proposal.latest_response.message}"</p>
              )}
              <p style={{ fontSize: 11, marginTop: 4 }}>
                {new Date(proposal.latest_response.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Client Info */}
        <div className="card">
          <p className="card-title">Client</p>
          <div className="meta-grid">
            <div className="meta-item">
              <label>Name</label>
              <p>{proposal.client.first_name} {proposal.client.last_name}</p>
            </div>
            <div className="meta-item">
              <label>Email</label>
              <p><a href={`mailto:${proposal.client.email}`} style={{ color: 'var(--gold)' }}>{proposal.client.email}</a></p>
            </div>
            {proposal.client.phone && (
              <div className="meta-item">
                <label>Phone</label>
                <p>{proposal.client.phone}</p>
              </div>
            )}
            {proposal.client.instagram_handle && (
              <div className="meta-item">
                <label>Instagram</label>
                <p>{proposal.client.instagram_handle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Proposal Info */}
        <div className="card">
          <p className="card-title">Proposal Details</p>
          <div className="meta-grid">
            <div className="meta-item">
              <label>Preferred date</label>
              <p>{proposal.preferred_date ?? '—'}</p>
            </div>
            <div className="meta-item">
              <label>Expires</label>
              <p>{proposal.expiration_date ? new Date(proposal.expiration_date).toLocaleDateString() : '—'}</p>
            </div>
            {proposal.pixieset_quote_link && (
              <div className="meta-item">
                <label>Pixieset Quote</label>
                <p><a href={proposal.pixieset_quote_link} target="_blank" style={{ color: 'var(--gold)' }}>View link</a></p>
              </div>
            )}
            {proposal.pixieset_invoice_link && (
              <div className="meta-item">
                <label>Pixieset Invoice</label>
                <p><a href={proposal.pixieset_invoice_link} target="_blank" style={{ color: 'var(--gold)' }}>View link</a></p>
              </div>
            )}
          </div>
          {proposal.personal_note && (
            <div className="meta-item" style={{ marginTop: '0.75rem' }}>
              <label>Personal note</label>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 4 }}>{proposal.personal_note}</p>
            </div>
          )}
        </div>

        {/* Packages */}
        <div className="card">
          <p className="card-title">Packages</p>
          <ul className="pkg-list">
            {proposal.packages.map(p => (
              <li key={p.id}>
                <span>
                  {p.package_name}
                  {p.recommended && <span style={{ fontSize: 10, color: 'var(--gold)', marginLeft: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recommended</span>}
                </span>
                <span style={{ color: 'var(--muted)' }}>${Number(p.price).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
