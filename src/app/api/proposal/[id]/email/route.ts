// /api/admin/proposals/[id]/email/route.ts
// POST: send proposal or invoice-ready email

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'
import { sendProposalEmail, sendInvoiceReadyEmail } from '@/lib/resend/emails'
import type { ProposalWithDetails } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await req.json()
    const { id } = params

    if (!['proposal', 'invoice_ready'].includes(type)) {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const supabase = createServerAdminClient()

    const { data, error } = await supabase
      .from('proposals')
      .select(`*, clients!inner(*), proposal_packages(*), proposal_templates!inner(*)`)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const raw = data as any

    const proposal: ProposalWithDetails = {
      id: raw.id,
      client_id: raw.client_id,
      template_id: raw.template_id,
      slug: raw.slug,
      status: raw.status,
      session_type: raw.session_type,
      preferred_date: raw.preferred_date,
      personal_note: raw.personal_note,
      studio_rental_note: raw.studio_rental_note,
      pixieset_quote_link: raw.pixieset_quote_link,
      pixieset_invoice_link: raw.pixieset_invoice_link,
      expiration_date: raw.expiration_date,
      sent_at: raw.sent_at,
      viewed_at: raw.viewed_at,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      client: raw.clients,
      template: raw.proposal_templates,
      packages: (raw.proposal_packages ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }

    let emailId: string

    if (type === 'proposal') {
      emailId = await sendProposalEmail(proposal)
      await supabase.from('proposal_events').insert({
        proposal_id: id,
        client_id: proposal.client_id,
        event_type: 'email_sent',
        metadata: { type: 'proposal', resend_id: emailId },
      })
    } else {
      emailId = await sendInvoiceReadyEmail(proposal)
      await supabase.from('proposal_events').insert({
        proposal_id: id,
        client_id: proposal.client_id,
        event_type: 'email_sent',
        metadata: { type: 'invoice_ready', resend_id: emailId },
      })
    }

    return NextResponse.json({ ok: true, emailId })
  } catch (err: any) {
    console.error('[POST /api/admin/proposals/[id]/email]', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
