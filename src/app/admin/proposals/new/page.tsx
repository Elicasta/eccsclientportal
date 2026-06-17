'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  slug: string
  session_type: string
}

interface PackageInput {
  package_name: string
  price: string
  description: string
  deliverables: string
  recommended: boolean
  sort_order: number
}

const DEFAULT_PACKAGES: PackageInput[] = [
  {
    package_name: 'The Essential',
    price: '395',
    description: 'A focused session built around one location and one look.',
    deliverables: '1-hour session\n1 location\n1 outfit\n25 edited digital images\nPrivate Pixieset gallery\nPrint release included',
    recommended: false,
    sort_order: 1,
  },
  {
    package_name: 'The Signature',
    price: '595',
    description: 'More time, more looks, more images. The full experience.',
    deliverables: '2-hour session\n1-2 locations\n2 outfit changes\n50 edited digital images\nPrivate Pixieset gallery\nPrint release included\n1 complimentary 5x7 print',
    recommended: true,
    sort_order: 2,
  },
  {
    package_name: 'The Full Story',
    price: '895',
    description: 'For the client who wants everything documented.',
    deliverables: '3-hour session\nUp to 3 locations\n3 outfit changes\n80+ edited digital images\nPrivate Pixieset gallery\nPrint release included\n3 complimentary prints (up to 8x10)\n15% off any add-on products',
    recommended: false,
    sort_order: 3,
  },
]

export default function NewProposalPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Client fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')

  // Proposal fields
  const [templateId, setTemplateId] = useState('')
  const [slug, setSlug] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [personalNote, setPersonalNote] = useState('')
  const [studioNote, setStudioNote] = useState('')
  const [pixiesetQuoteLink, setPixiesetQuoteLink] = useState('')
  const [expirationDate, setExpirationDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })

  // Packages
  const [packages, setPackages] = useState<PackageInput[]>(DEFAULT_PACKAGES)

  useEffect(() => {
    fetch('/api/admin/templates')
      .then(r => r.json())
      .then(d => {
        setTemplates(d.templates ?? [])
        if (d.templates?.length > 0) setTemplateId(d.templates[0].id)
      })
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (firstName || lastName) {
      const raw = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      setSlug(raw)
    }
  }, [firstName, lastName])

  const updatePackage = (i: number, field: keyof PackageInput, value: string | boolean) => {
    setPackages(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const handleSubmit = async () => {
    setError('')

    if (!firstName || !email || !templateId || !slug) {
      setError('First name, email, template, and slug are required.')
      return
    }

    setLoading(true)
    try {
      const selectedTemplate = templates.find(t => t.id === templateId)

      const payload = {
        client: { first_name: firstName, last_name: lastName, email, phone, instagram_handle: instagram },
        template_id: templateId,
        slug,
        session_type: selectedTemplate?.session_type ?? 'maternity',
        preferred_date: preferredDate || undefined,
        personal_note: personalNote || undefined,
        studio_rental_note: studioNote || undefined,
        pixieset_quote_link: pixiesetQuoteLink || undefined,
        expiration_date: expirationDate || undefined,
        packages: packages.map(p => ({
          package_name: p.package_name,
          price: parseFloat(p.price),
          description: p.description,
          deliverables: p.deliverables.split('\n').map(d => d.trim()).filter(Boolean),
          recommended: p.recommended,
          sort_order: p.sort_order,
        })),
      }

      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')

      router.push(`/admin/proposals/${data.proposal.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #FAF7F2; --parchment: #F2EDE4; --border: #E2D9CC;
          --gold: #8B7355; --text: #2C2420; --muted: #6B5B4E;
          --serif: 'Georgia', serif; --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        body { background: var(--cream); color: var(--text); font-family: var(--sans); font-size: 14px; -webkit-font-smoothing: antialiased; }

        .page { max-width: 760px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }

        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); text-decoration: none; margin-bottom: 1.5rem; }
        .back-link:hover { color: var(--text); }

        .page-title { font-family: var(--serif); font-size: 1.5rem; font-weight: 400; margin-bottom: 0.25rem; }
        .page-sub { font-size: 12px; color: var(--muted); margin-bottom: 2rem; }

        .section { background: white; border: 1px solid var(--border); border-radius: 3px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .section-title { font-family: var(--serif); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 1.25rem; }

        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 560px) { .field-grid { grid-template-columns: 1fr; } }

        .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0; }
        .field label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
        .field input, .field select, .field textarea {
          border: 1px solid var(--border); border-radius: 2px; padding: 8px 10px;
          font-family: var(--sans); font-size: 14px; color: var(--text); background: var(--cream);
        }
        .field input:focus, .field select:focus, .field textarea:focus {
          outline: none; border-color: var(--gold);
        }
        .field textarea { resize: vertical; }

        .package-card { border: 1px solid var(--border); border-radius: 3px; padding: 1.25rem; margin-bottom: 0.75rem; background: white; }
        .pkg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .pkg-num { font-family: var(--serif); font-size: 11px; color: var(--gold); letter-spacing: 0.15em; text-transform: uppercase; }
        .pkg-rec { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); cursor: pointer; }
        .pkg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
        @media (max-width: 560px) { .pkg-grid { grid-template-columns: 1fr; } }

        .error-msg { background: #FEF2F2; border: 1px solid #FECACA; color: #9B1C1C; padding: 0.75rem 1rem; border-radius: 2px; font-size: 13px; margin-bottom: 1rem; }

        .btn { display: inline-block; font-family: var(--sans); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 24px; border-radius: 2px; border: 1px solid; cursor: pointer; }
        .btn--dark { background: var(--text); color: var(--cream); border-color: var(--text); }
        .btn--dark:hover:not(:disabled) { background: #1a1210; }
        .btn--dark:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn--ghost { background: transparent; color: var(--muted); border-color: var(--border); text-decoration: none; }

        .form-actions { display: flex; gap: 0.75rem; align-items: center; margin-top: 1.5rem; }
      `}</style>

      <div className="page">
        <Link href="/admin/proposals" className="back-link">
          ← All proposals
        </Link>
        <h1 className="page-title">New Proposal</h1>
        <p className="page-sub">Fill in the client details, choose packages, and save.</p>

        {error && <div className="error-msg">{error}</div>}

        {/* Client */}
        <div className="section">
          <p className="section-title">Client</p>
          <div className="field-grid">
            <div className="field">
              <label>First name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Carolina" />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Lacque" />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="carolina@email.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0000" />
            </div>
            <div className="field">
              <label>Instagram</label>
              <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@handle" />
            </div>
          </div>
        </div>

        {/* Proposal Settings */}
        <div className="section">
          <p className="section-title">Proposal Details</p>
          <div className="field-grid" style={{ marginBottom: '1rem' }}>
            <div className="field">
              <label>Template *</label>
              <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Slug (URL) *</label>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="carolina-lacque" />
            </div>
            <div className="field">
              <label>Preferred date / timeframe</label>
              <input value={preferredDate} onChange={e => setPreferredDate(e.target.value)} placeholder="Late October" />
            </div>
            <div className="field">
              <label>Expiration date</label>
              <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Pixieset quote link</label>
              <input value={pixiesetQuoteLink} onChange={e => setPixiesetQuoteLink(e.target.value)} placeholder="https://pixieset.com/..." />
            </div>
          </div>
          <div className="field" style={{ marginBottom: '0.75rem' }}>
            <label>Personal note (shown at the top of the proposal)</label>
            <textarea value={personalNote} onChange={e => setPersonalNote(e.target.value)} rows={3} placeholder="Hi Carolina, I put this together with you in mind..." />
          </div>
          <div className="field">
            <label>Studio rental note (shown if applicable)</label>
            <textarea value={studioNote} onChange={e => setStudioNote(e.target.value)} rows={2} placeholder="Studio rental is a separate fee not included in the prices above." />
          </div>
        </div>

        {/* Packages */}
        <div className="section">
          <p className="section-title">Packages</p>
          {packages.map((pkg, i) => (
            <div key={i} className="package-card">
              <div className="pkg-header">
                <span className="pkg-num">Package {i + 1}</span>
                <label className="pkg-rec">
                  <input
                    type="checkbox"
                    checked={pkg.recommended}
                    onChange={e => {
                      // Only one can be recommended
                      setPackages(prev => prev.map((p, idx) => ({ ...p, recommended: idx === i ? e.target.checked : false })))
                    }}
                  />
                  Mark as recommended
                </label>
              </div>
              <div className="pkg-grid">
                <div className="field">
                  <label>Package name</label>
                  <input value={pkg.package_name} onChange={e => updatePackage(i, 'package_name', e.target.value)} />
                </div>
                <div className="field">
                  <label>Price ($)</label>
                  <input type="number" value={pkg.price} onChange={e => updatePackage(i, 'price', e.target.value)} />
                </div>
              </div>
              <div className="field" style={{ marginBottom: '0.75rem' }}>
                <label>Description</label>
                <input value={pkg.description} onChange={e => updatePackage(i, 'description', e.target.value)} />
              </div>
              <div className="field">
                <label>Deliverables (one per line)</label>
                <textarea value={pkg.deliverables} onChange={e => updatePackage(i, 'deliverables', e.target.value)} rows={5} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn btn--dark" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Proposal'}
          </button>
          <Link href="/admin/proposals" className="btn btn--ghost">Cancel</Link>
        </div>
      </div>
    </>
  )
}
