// /api/proposal/track/route.ts
// Public endpoint. Clients call this to log events.

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'
import type { EventType } from '@/types'

const VALID_EVENT_TYPES: EventType[] = [
  'proposal_viewed',
  'package_viewed',
  'package_selected',
  'question_submitted',
  'client_not_ready',
  'pixieset_quote_clicked',
  'pixieset_invoice_clicked',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { proposalId, eventType, metadata } = body

    if (!proposalId || !eventType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Only allow client-safe event types
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    const supabase = createServerAdminClient()

    // Verify the proposal exists
    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, client_id, status, viewed_at')
      .eq('id', proposalId)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Insert event
    await supabase.from('proposal_events').insert({
      proposal_id: proposalId,
      client_id: proposal.client_id,
      event_type: eventType,
      metadata: metadata ?? {},
    })

    // Update proposal on first view
    if (eventType === 'proposal_viewed' && !proposal.viewed_at) {
      await supabase
        .from('proposals')
        .update({
          viewed_at: new Date().toISOString(),
          status: proposal.status === 'sent' ? 'viewed' : proposal.status,
        })
        .eq('id', proposalId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
