'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardProposal {
  id: string
  slug: string
  status: string
  session_type: string
  expiration_date: string | null
  sent_at: string | null
  viewed_at: string | null
  created_at: string
  client: {
    first_name: string
    last_name: string
    email: string
  }
  invoice_needed: boolean
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:            { label: 'Draft',           color: '#9C8C7E' },
  sent:             { label: 'Sent',            color: '#7B8FA1' },
  viewed:           { label: 'Viewed',          color: '#5B8A6B' },
  follow_up_needed: { label: 'Follow-up',       color: '#C8822A' },
  accepted:         { label: 'Accepted',        color: '#3A7A50' },
  invoice_needed:   { label: 'Invoice Needed',  color: '#B85C38' },
  invoice_sent:     { label: 'Invoice Sent',    color: '#7B8FA1' },
  deposit_paid:     { label: 'Deposit Paid',    color: '#3A7A50' },
  booked:           { label: 'Booked',          color: '#2C6E49' },
  declined:         { label: 'Declined',        color: '#9B2B2B' },
  expired:          { label: 'Expired',         color: '#B0A090' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: '#9C8C7E' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '2px',
      fontSize: '11px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: s.color,
      border: `1px solid ${s.color}`,
      background: `${s.color}15`,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminDashboard() {
  const [proposals, setProposals] = useState<DashboardProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/proposals')
      .then(r => r.json())
      .then(d => { setProposals(d.proposals ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const copyLink = async (proposal: DashboardProposal) => {
    const url = `${window.location.origin}/proposal/${proposal.session_type}/${proposal.slug}`
    await navigator.clipboard.writeText(url)
    setCopiedId(proposal.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #FAF7F2;
          --parchment: #F2EDE4;
          --border: #E2D9CC;
          --gold: #8B7355;
          --text: #2C2420;
          --muted: #6B5B4E;
          --serif: 'Georgia', 'Times New Roman', serif;
          --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        body {
          background: var(--cream);
          color: var(--text);
          font-family: var(--sans);
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 220px;
          background: #2C2420;
          padding: 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        .sidebar-brand {
          font-family: var(--serif);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(242,237,228,0.1);
          margin-bottom: 1.5rem;
        }
        .sidebar-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(242,237,228,0.3);
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
        }
        .sidebar-link {
          display: block;
          padding: 0.5rem 0.75rem;
          border-radius: 2px;
          color: rgba(242,237,228,0.65);
          text-decoration: none;
          font-size: 13px;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-link:hover, .sidebar-link.active {
          background: rgba(242,237,228,0.08);
          color: #FAF7F2;
        }

        /* Main content */
        .admin-main {
          flex: 1;
          padding: 2rem;
          overflow-x: auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .page-title {
          font-family: var(--serif);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text);
        }
        .page-sub {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Buttons */
        .btn {
          display: inline-block;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 16px;
          border-radius: 2px;
          border: 1px solid;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.12s;
        }
        .btn--dark {
          background: var(--text);
          color: var(--cream);
          border-color: var(--text);
        }
        .btn--dark:hover { background: #1a1210; }
        .btn--ghost {
          background: transparent;
          color: var(--muted);
          border-color: var(--border);
          font-size: 11px;
          padding: 5px 10px;
        }
        .btn--ghost:hover {
          background: var(--parchment);
          color: var(--text);
        }

        /* Proposals table */
        .proposals-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid var(--border);
          border-radius: 3px;
          overflow: hidden;
        }
        .proposals-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          background: var(--parchment);
        }
        .proposals-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .proposals-table tr:last-child td {
          border-bottom: none;
        }
        .proposals-table tr:hover td {
          background: #FDFAF6;
        }

        .client-name {
          font-weight: 500;
          color: var(--text);
          margin-bottom: 1px;
        }
        .client-email {
          font-size: 12px;
          color: var(--muted);
        }
        .session-type {
          font-size: 12px;
          color: var(--muted);
          text-transform: capitalize;
        }

        .actions-cell {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }

        .alert-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #B85C38;
          display: inline-block;
          margin-right: 4px;
          vertical-align: middle;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--muted);
        }
        .empty-state h2 {
          font-family: var(--serif);
          font-weight: 400;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .empty-state p {
          font-size: 13px;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .admin-main { padding: 1.25rem; }
        }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-brand">EC Creative</div>
          <span className="sidebar-label">Proposals</span>
          <Link href="/admin/proposals" className="sidebar-link active">All Proposals</Link>
          <Link href="/admin/proposals/new" className="sidebar-link">New Proposal</Link>
          <span className="sidebar-label">System</span>
          <Link href="/admin/clients" className="sidebar-link">Clients</Link>
          <Link href="/admin/templates" className="sidebar-link">Templates</Link>
        </nav>

        {/* Main */}
        <main className="admin-main">
          <div className="page-header">
            <div>
              <h1 className="page-title">Proposals</h1>
              <p className="page-sub">{proposals.length} total</p>
            </div>
            <Link href="/admin/proposals/new" className="btn btn--dark">
              + New Proposal
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading...</p>
          ) : proposals.length === 0 ? (
            <div className="empty-state">
              <h2>No proposals yet.</h2>
              <p>Create your first one to get started.</p>
              <Link href="/admin/proposals/new" className="btn btn--dark">Create Proposal</Link>
            </div>
          ) : (
            <table className="proposals-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Session</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Viewed</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="client-name">
                        {p.invoice_needed && <span className="alert-dot" title="Invoice needed" />}
                        {p.client.first_name} {p.client.last_name}
                      </div>
                      <div className="client-email">{p.client.email}</div>
                    </td>
                    <td className="session-type">{p.session_type}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(p.sent_at)}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(p.viewed_at)}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatDate(p.expiration_date)}</td>
                    <td>
                      <div className="actions-cell">
                        <Link href={`/admin/proposals/${p.id}`} className="btn btn--ghost">
                          Edit
                        </Link>
                        <Link href={`/proposal/${p.session_type}/${p.slug}`} target="_blank" className="btn btn--ghost">
                          Preview
                        </Link>
                        <button className="btn btn--ghost" onClick={() => copyLink(p)}>
                          {copiedId === p.id ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </>
  )
}
