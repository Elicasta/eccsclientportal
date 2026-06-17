// /proposal/[sessionType]/[slug]/page.tsx
// Server component. Fetches proposal data and renders the client component.

import { notFound } from 'next/navigation'
import { createServerPublicClient } from '@/lib/supabase/client'
import ProposalPageClient from '@/components/proposal/ProposalPageClient'
import type { PublicProposalData } from '@/types'
import type { Metadata } from 'next'

interface ProposalPageProps {
  params: {
    sessionType: string
    slug: string
  }
}

async function getProposalData(slug: string): Promise<PublicProposalData | null> {
  const supabase = createServerPublicClient()

  // Fetch proposal
  const { data: proposal, error: pErr } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'draft')
    .single()

  if (pErr || !proposal) return null

  // Fetch client
  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('first_name')
    .eq('id', proposal.client_id)
    .single()

  if (cErr || !client) return null

  // Fetch template
  const { data: template, error: tErr } = await supabase
    .from('proposal_templates')
    .select('hero_headline, hero_subtext, faq')
    .eq('id', proposal.template_id)
    .single()

  if (tErr || !template) return null

  // Fetch packages
  const { data: packages, error: pkgErr } = await supabase
    .from('proposal_packages')
    .select('*')
    .eq('proposal_id', proposal.id)
    .order('sort_order', { ascending: true })

  if (pkgErr) return null

  return {
    proposal: {
      id: proposal.id,
      slug: proposal.slug,
      status: proposal.status,
      session_type: proposal.session_type,
      preferred_date: proposal.preferred_date,
      personal_note: proposal.personal_note,
      studio_rental_note: proposal.studio_rental_note,
      pixieset_quote_link: proposal.pixieset_quote_link,
      pixieset_invoice_link: proposal.pixieset_invoice_link,
      expiration_date: proposal.expiration_date,
    },
    client: {
      first_name: client.first_name,
    },
    template: {
      hero_headline: template.hero_headline,
      hero_subtext: template.hero_subtext,
      faq: template.faq ?? [],
    },
    packages: packages ?? [],
  }
}

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  return {
    title: 'Your Session Proposal | EC Creative Studios',
    description: 'A personalized photography proposal prepared just for you by EC Creative Studios.',
    robots: { index: false, follow: false },
  }
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const data = await getProposalData(params.slug)

  if (!data) return notFound()

  // Verify sessionType matches (URL integrity)
  if (data.proposal.session_type !== params.sessionType) return notFound()

  return <ProposalPageClient data={data} />
}
