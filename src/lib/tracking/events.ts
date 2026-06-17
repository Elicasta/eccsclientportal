// ============================================================
// EC Creative Studios Proposal OS
// Event Tracking
// ============================================================

import { createServerAdminClient } from '@/lib/supabase/client'
import type { EventType } from '@/types'

interface TrackEventParams {
  proposalId: string
  clientId?: string
  eventType: EventType
  metadata?: Record<string, unknown>
}

export async function trackEvent({
  proposalId,
  clientId,
  eventType,
  metadata = {},
}: TrackEventParams): Promise<void> {
  try {
    const supabase = createServerAdminClient()

    await supabase.from('proposal_events').insert({
      proposal_id: proposalId,
      client_id: clientId ?? null,
      event_type: eventType,
      metadata,
    })
  } catch (err) {
    // Non-fatal. Tracking should never break the user experience.
    console.error('[trackEvent] Failed to log event:', eventType, err)
  }
}

// Convenience wrappers

export async function trackProposalViewed(proposalId: string, clientId?: string) {
  await trackEvent({ proposalId, clientId, eventType: 'proposal_viewed' })

  // Also update the viewed_at timestamp on first view
  const supabase = createServerAdminClient()
  const { data } = await supabase
    .from('proposals')
    .select('viewed_at, status')
    .eq('id', proposalId)
    .single()

  if (data && !data.viewed_at) {
    await supabase
      .from('proposals')
      .update({
        viewed_at: new Date().toISOString(),
        status: data.status === 'sent' ? 'viewed' : data.status,
      })
      .eq('id', proposalId)
  }
}

export async function trackPackageSelected(
  proposalId: string,
  packageId: string,
  packageName: string,
  clientId?: string
) {
  await trackEvent({
    proposalId,
    clientId,
    eventType: 'package_selected',
    metadata: { package_id: packageId, package_name: packageName },
  })
}

export async function trackPixiesetClick(
  proposalId: string,
  linkType: 'quote' | 'invoice',
  clientId?: string
) {
  const eventType =
    linkType === 'quote' ? 'pixieset_quote_clicked' : 'pixieset_invoice_clicked'
  await trackEvent({ proposalId, clientId, eventType })
}

export async function trackQuestionSubmitted(proposalId: string, clientId?: string) {
  await trackEvent({ proposalId, clientId, eventType: 'question_submitted' })
}

export async function trackClientNotReady(proposalId: string, clientId?: string) {
  await trackEvent({ proposalId, clientId, eventType: 'client_not_ready' })
}

// Status change helper used by admin actions
export async function updateProposalStatus(
  proposalId: string,
  newStatus: string,
  extra?: Record<string, unknown>
) {
  const supabase = createServerAdminClient()

  const updatePayload: Record<string, unknown> = { status: newStatus, ...extra }

  const { error } = await supabase
    .from('proposals')
    .update(updatePayload)
    .eq('id', proposalId)

  if (error) throw error

  await trackEvent({
    proposalId,
    eventType: 'status_changed',
    metadata: { new_status: newStatus },
  })
}
