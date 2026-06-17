// ============================================================
// EC Creative Studios Proposal OS
// TypeScript Types
// ============================================================

// ---- Enums ------------------------------------------------

export type SessionType =
  | 'maternity'
  | 'family'
  | 'newborn'
  | 'branding'
  | 'elopement'
  | 'event'

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'follow_up_needed'
  | 'accepted'
  | 'invoice_needed'
  | 'invoice_sent'
  | 'deposit_paid'
  | 'booked'
  | 'declined'
  | 'expired'

export type EventType =
  | 'proposal_created'
  | 'email_sent'
  | 'proposal_viewed'
  | 'package_viewed'
  | 'package_selected'
  | 'question_submitted'
  | 'client_not_ready'
  | 'pixieset_quote_clicked'
  | 'pixieset_invoice_clicked'
  | 'status_changed'

export type ResponseType = 'accepted' | 'question' | 'not_ready'

export type EmailType = 'proposal' | 'invoice_ready' | 'follow_up'

export type EmailStatus =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed'

// ---- Database Row Types ----------------------------------

export interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  instagram_handle: string | null
  created_at: string
  updated_at: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface ProposalTemplate {
  id: string
  name: string
  slug: string
  session_type: SessionType
  hero_headline: string | null
  hero_subtext: string | null
  faq: FAQ[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  client_id: string
  template_id: string
  slug: string
  status: ProposalStatus
  session_type: SessionType
  preferred_date: string | null
  personal_note: string | null
  studio_rental_note: string | null
  pixieset_quote_link: string | null
  pixieset_invoice_link: string | null
  expiration_date: string | null
  sent_at: string | null
  viewed_at: string | null
  created_at: string
  updated_at: string
}

export interface ProposalPackage {
  id: string
  proposal_id: string
  package_name: string
  price: number
  description: string | null
  deliverables: string[]
  recommended: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProposalEvent {
  id: string
  proposal_id: string
  client_id: string | null
  event_type: EventType
  metadata: Record<string, unknown>
  created_at: string
}

export interface ClientResponse {
  id: string
  proposal_id: string
  selected_package_id: string | null
  response_type: ResponseType
  message: string | null
  invoice_needed: boolean
  created_at: string
}

export interface EmailLog {
  id: string
  proposal_id: string
  resend_email_id: string | null
  to_email: string
  subject: string
  email_type: EmailType
  status: EmailStatus
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
  created_at: string
}

// ---- Composite / Joined Types ----------------------------

export interface ProposalWithDetails extends Proposal {
  client: Client
  template: ProposalTemplate
  packages: ProposalPackage[]
  latest_response?: ClientResponse | null
}

export interface DashboardProposal {
  id: string
  slug: string
  status: ProposalStatus
  session_type: SessionType
  expiration_date: string | null
  sent_at: string | null
  viewed_at: string | null
  created_at: string
  client: {
    first_name: string
    last_name: string
    email: string
  }
  selected_package?: string | null
  invoice_needed: boolean
}

// ---- Form / Payload Types --------------------------------

export interface CreateClientPayload {
  first_name: string
  last_name: string
  email: string
  phone?: string
  instagram_handle?: string
}

export interface CreateProposalPayload {
  client: CreateClientPayload
  template_id: string
  slug: string
  session_type: SessionType
  preferred_date?: string
  personal_note?: string
  studio_rental_note?: string
  pixieset_quote_link?: string
  expiration_date?: string
  packages: CreatePackagePayload[]
}

export interface CreatePackagePayload {
  package_name: string
  price: number
  description?: string
  deliverables: string[]
  recommended: boolean
  sort_order: number
}

export interface UpdateProposalStatusPayload {
  status: ProposalStatus
  pixieset_invoice_link?: string
}

// ---- Public Proposal Page Type --------------------------

export interface PublicProposalData {
  proposal: {
    id: string
    slug: string
    status: ProposalStatus
    session_type: SessionType
    preferred_date: string | null
    personal_note: string | null
    studio_rental_note: string | null
    pixieset_quote_link: string | null
    pixieset_invoice_link: string | null
    expiration_date: string | null
  }
  client: {
    first_name: string
  }
  template: {
    hero_headline: string | null
    hero_subtext: string | null
    faq: FAQ[]
  }
  packages: ProposalPackage[]
}

// ---- API Response Wrappers ------------------------------

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
