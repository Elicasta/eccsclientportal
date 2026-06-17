// /api/admin/proposals/route.ts
// GET: list all proposals
// POST: create new proposal

import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'
import type { CreateProposalPayload } from '@/types'

export async function GET() {
  try {
    const supabase = createServerAdminClient()

    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        id, slug, status, session_type, expiration_date,
        sent_at, viewed_at, created_at,
        clients!inner (
          first_name, last_name, email
        ),
        client_responses (
          response_type, invoice_needed, selected_package_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formatted = proposals.map(p => {
      const latestResponse = p.client_responses?.[p.client_responses.length - 1]
      return {
        id: p.id,
        slug: p.slug,
        status: p.status,
        session_type: p.session_type,
        expiration_date: p.expiration_date,
        sent_at: p.sent_at,
        viewed_at: p.viewed_at,
        created_at: p.created_at,
        client: {
          first_name: (p.clients as any).first_name,
          last_name: (p.clients as any).last_name,
          email: (p.clients as any).email,
        },
        invoice_needed: latestResponse?.invoice_needed ?? false,
      }
    })

    return NextResponse.json({ proposals: formatted })
  } catch (err) {
    console.error('[GET /api/admin/proposals]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateProposalPayload = await req.json()
    const supabase = createServerAdminClient()

    // 1. Upsert client by email
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .upsert(
        {
          first_name: body.client.first_name,
          last_name: body.client.last_name ?? '',
          email: body.client.email,
          phone: body.client.phone ?? null,
          instagram_handle: body.client.instagram_handle ?? null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (clientErr) throw clientErr

    // 2. Create proposal
    const { data: proposal, error: propErr } = await supabase
      .from('proposals')
      .insert({
        client_id: client.id,
        template_id: body.template_id,
        slug: body.slug,
        status: 'draft',
        session_type: body.session_type,
        preferred_date: body.preferred_date ?? null,
        personal_note: body.personal_note ?? null,
        studio_rental_note: body.studio_rental_note ?? null,
        pixieset_quote_link: body.pixieset_quote_link ?? null,
        expiration_date: body.expiration_date ?? null,
      })
      .select()
      .single()

    if (propErr) throw propErr

    // 3. Create packages
    if (body.packages?.length) {
      const { error: pkgErr } = await (supabase.from('proposal_packages') as any).insert(
        body.packages.map(p => ({
          proposal_id: proposal.id,
          package_name: p.package_name,
          price: p.price,
          description: p.description ?? null,
          deliverables: p.deliverables,
          recommended: p.recommended,
          sort_order: p.sort_order,
        }))
      )
      if (pkgErr) throw pkgErr
    }

    // 4. Log creation event
    await (supabase.from('proposal_events') as any).insert({
      proposal_id: proposal.id,
      client_id: client.id,
      event_type: 'proposal_created',
      metadata: { session_type: body.session_type },
    })

    return NextResponse.json({ proposal }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/admin/proposals]', err)
    if (err.code === '23505') {
      return NextResponse.json({ error: 'A proposal with that slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
