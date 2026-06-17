// /api/admin/proposals/[id]/status/route.ts
// PATCH: update proposal status and optional fields

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'

const VALID_STATUSES = [
  'draft','sent','viewed','follow_up_needed','accepted',
  'invoice_needed','invoice_sent','deposit_paid','booked','declined','expired',
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { status, pixieset_invoice_link } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServerAdminClient()

    const updatePayload: Record<string, unknown> = { status }
    if (pixieset_invoice_link) updatePayload.pixieset_invoice_link = pixieset_invoice_link

    const { error } = await supabase
      .from('proposals')
      .update(updatePayload)
      .eq('id', id)

    if (error) throw error

    await (supabase.from('proposal_events') as any).insert({
      proposal_id: id,
      event_type: 'status_changed',
      metadata: { new_status: status, updated_by: 'admin' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/admin/proposals/[id]/status]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
