// Auto-generated Supabase database types
// This is a permissive stub. Replace with generated types from:
// npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          instagram_handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          instagram_handle?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      proposal_templates: {
        Row: {
          id: string
          name: string
          slug: string
          session_type: string
          hero_headline: string | null
          hero_subtext: string | null
          faq: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          session_type: string
          hero_headline?: string | null
          hero_subtext?: string | null
          faq?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['proposal_templates']['Insert']>
      }
      proposals: {
        Row: {
          id: string
          client_id: string
          template_id: string
          slug: string
          status: string
          session_type: string
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
        Insert: {
          id?: string
          client_id: string
          template_id: string
          slug: string
          status?: string
          session_type: string
          preferred_date?: string | null
          personal_note?: string | null
          studio_rental_note?: string | null
          pixieset_quote_link?: string | null
          pixieset_invoice_link?: string | null
          expiration_date?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['proposals']['Insert']>
      }
      proposal_packages: {
        Row: {
          id: string
          proposal_id: string
          package_name: string
          price: number
          description: string | null
          deliverables: Json
          recommended: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          package_name: string
          price: number
          description?: string | null
          deliverables?: Json
          recommended?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['proposal_packages']['Insert']>
      }
      proposal_events: {
        Row: {
          id: string
          proposal_id: string
          client_id: string | null
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          client_id?: string | null
          event_type: string
          metadata?: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['proposal_events']['Insert']>
      }
      client_responses: {
        Row: {
          id: string
          proposal_id: string
          selected_package_id: string | null
          response_type: string
          message: string | null
          invoice_needed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          selected_package_id?: string | null
          response_type: string
          message?: string | null
          invoice_needed?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['client_responses']['Insert']>
      }
      email_logs: {
        Row: {
          id: string
          proposal_id: string
          resend_email_id: string | null
          to_email: string
          subject: string
          email_type: string
          status: string
          sent_at: string
          opened_at: string | null
          clicked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          resend_email_id?: string | null
          to_email: string
          subject: string
          email_type: string
          status?: string
          sent_at?: string
          opened_at?: string | null
          clicked_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['email_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
