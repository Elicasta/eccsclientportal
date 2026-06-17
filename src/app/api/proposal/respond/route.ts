// /api/proposal/respond/route.ts
// Handles client responses: accepted, question, not_ready

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { proposalId, responseType, selectedPackageId, message } = body

    if (!proposalId || !responseType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const validTypes = ['accepted', 'question', 'not_ready']
    if (!validTypes.includes(responseType)) {
      return NextResponse.json({ error: 'Invalid response type' }, { status: 400 })
    }

    const supabase = createServerAdminClient()

    // Verify proposal exists
    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, client_id, status')
      .eq('id', proposalId)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Insert client response
    await supabase.from('client_responses').insert({
      proposal_id: proposalId,
      selected_package_id: selectedPackageId ?? null,
      response_type: responseType,
      message: message ?? null,
      invoice_needed: responseType === 'accepted',
    })

    // Update proposal status based on response
    let newStatus = proposal.status
    if (responseType === 'accepted') {
      newStatus = 'invoice_needed'
    } else if (responseType === 'question') {
      newStatus = 'follow_up_needed'
    }

    if (newStatus !== proposal.status) {
      await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId)

      await supabase.from('proposal_events').insert({
        proposal_id: proposalId,
        client_id: proposal.client_id,
        event_type: 'status_changed',
        metadata: { new_status: newStatus, triggered_by: responseType },
      })
    }

    // Log the specific event
    const eventTypeMap: Record<string, string> = {
      accepted: 'package_selected',
      question: 'question_submitted',
      not_ready: 'client_not_ready',
    }

    await supabase.from('proposal_events').insert({
      proposal_id: proposalId,
      client_id: proposal.client_id,
      event_type: eventTypeMap[responseType],
      metadata: {
        selected_package_id: selectedPackageId,
        message_provided: !!message,
      },
    })

    return NextResponse.json({ ok: true, status: newStatus })
  } catch (err) {
    console.error('[respond] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
