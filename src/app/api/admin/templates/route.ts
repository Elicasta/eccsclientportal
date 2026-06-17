// /api/admin/templates/route.ts
// GET: list active templates (for dropdowns)

import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServerAdminClient()

    const { data: templates, error } = await supabase
      .from('proposal_templates')
      .select('id, name, slug, session_type')
      .eq('active', true)
      .order('name')

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (err) {
    console.error('[GET /api/admin/templates]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
