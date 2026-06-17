// /api/admin/proposals/[id]/route.ts
// GET: single proposal with full details

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerAdminClient()
    const { id } = params

    const { data: proposal, error } = await supabase
      .from('proposals')
      .select(`
        *,
        clients!inner (*),
        proposal_packages (*),
        client_responses (*)
      `)
      .eq('id', id)
      .single()

    if (error || !proposal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const responses = proposal.client_responses ?? []
    const latestResponse = responses.length > 0
      ? responses.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : null

    const { count: eventCount } = await supabase
      .from('proposal_events')
      .select('id', { count: 'exact', head: true })
      .eq('proposal_id', id)

    return NextResponse.json({
      proposal: {
        ...proposal,
        client: proposal.clients,
        packages: proposal.proposal_packages?.sort((a: any, b: any) => a.sort_order - b.sort_order),
        latest_response: latestResponse,
        event_count: eventCount ?? 0,
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/proposals/[id]]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
