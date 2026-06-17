// ============================================================
// EC Creative Studios Proposal OS
// Resend Email Functions
// ============================================================

import { Resend } from 'resend'
import { createServerAdminClient } from '@/lib/supabase/client'
import type { ProposalWithDetails } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Emily at EC Creative <emily@eccreativestudios.com>'
const REPLY_TO = process.env.OUTLOOK_REPLY_TO ?? 'emily@eccreativestudios.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://eccreativestudios.com'

// ---- Proposal Email HTML ---------------------------------

function buildProposalEmailHtml(proposal: ProposalWithDetails): string {
  const firstName = proposal.client.first_name
  const proposalUrl = `${BASE_URL}/proposal/${proposal.session_type}/${proposal.slug}`
  const sessionLabel =
    proposal.session_type.charAt(0).toUpperCase() + proposal.session_type.slice(1)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your EC Creative Studios Proposal</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Logo / Brand Header -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <p style="margin:0;font-family:'Georgia',serif;font-size:13px;letter-spacing:0.18em;color:#8B7355;text-transform:uppercase;">EC Creative Studios</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border:1px solid #E8E0D4;border-radius:4px;padding:48px 48px 40px;">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-family:'Georgia',serif;font-size:26px;color:#2C2420;line-height:1.3;">
                Hi ${firstName},
              </p>

              <!-- Body -->
              <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#4A4035;line-height:1.7;">
                Your <strong>${sessionLabel} Session Proposal</strong> is ready.
              </p>

              <p style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#4A4035;line-height:1.7;">
                I put together a few options that I think will work really well for you. Take your time looking through it. There is no rush, and I am here if anything feels off or you have questions.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#2C2420;border-radius:2px;text-align:center;">
                    <a href="${proposalUrl}" style="display:inline-block;padding:14px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#FAF7F2;text-decoration:none;">
                      View Your Proposal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #E8E0D4;margin:0 0 24px;" />

              <!-- Closing -->
              <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:14px;color:#4A4035;line-height:1.6;">
                With warmth,
              </p>
              <p style="margin:0;font-family:'Georgia',serif;font-size:14px;color:#2C2420;font-style:italic;">
                Emily
              </p>
              <p style="margin:4px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#8B7355;">
                EC Creative Studios
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:#B0A090;line-height:1.6;">
                You are receiving this because we are in conversation about a photography session.<br/>
                Reply directly to this email with any questions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// ---- Invoice Ready Email HTML ----------------------------

function buildInvoiceEmailHtml(proposal: ProposalWithDetails): string {
  const firstName = proposal.client.first_name
  const invoiceUrl = proposal.pixieset_invoice_link ?? ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Invoice is Ready</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <p style="margin:0;font-family:'Georgia',serif;font-size:13px;letter-spacing:0.18em;color:#8B7355;text-transform:uppercase;">EC Creative Studios</p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;border:1px solid #E8E0D4;border-radius:4px;padding:48px 48px 40px;">

              <p style="margin:0 0 24px;font-family:'Georgia',serif;font-size:26px;color:#2C2420;line-height:1.3;">
                Hi ${firstName}, your invoice is ready.
              </p>

              <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#4A4035;line-height:1.7;">
                Excited to make this happen. Your invoice is ready through Pixieset. You can review the details and submit your deposit to officially lock in your date.
              </p>

              <p style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#4A4035;line-height:1.7;">
                Once your deposit is received, I will send over your contract and a style guide to get you prepped.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#2C2420;border-radius:2px;text-align:center;">
                    <a href="${invoiceUrl}" style="display:inline-block;padding:14px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#FAF7F2;text-decoration:none;">
                      View Invoice &amp; Pay Deposit
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #E8E0D4;margin:0 0 24px;" />

              <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:14px;color:#4A4035;line-height:1.6;">
                Talk soon,
              </p>
              <p style="margin:0;font-family:'Georgia',serif;font-size:14px;color:#2C2420;font-style:italic;">
                Emily
              </p>
              <p style="margin:4px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#8B7355;">
                EC Creative Studios
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:#B0A090;line-height:1.6;">
                Reply directly to this email with any questions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// ---- Send Functions -------------------------------------

export async function sendProposalEmail(proposal: ProposalWithDetails): Promise<string> {
  const supabase = createServerAdminClient()
  const subject = `Your ${proposal.session_type} session proposal is ready, ${proposal.client.first_name}.`

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    reply_to: REPLY_TO,
    to: proposal.client.email,
    subject,
    html: buildProposalEmailHtml(proposal),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)

  // Log the email
  await (supabase.from('email_logs') as any).insert({
    proposal_id: proposal.id,
    resend_email_id: data?.id ?? null,
    to_email: proposal.client.email,
    subject,
    email_type: 'proposal',
    status: 'sent',
    sent_at: new Date().toISOString(),
  })

  // Update proposal sent_at
  await supabase
    .from('proposals')
    .update({ sent_at: new Date().toISOString(), status: 'sent' })
    .eq('id', proposal.id)

  return data?.id ?? ''
}

export async function sendInvoiceReadyEmail(proposal: ProposalWithDetails): Promise<string> {
  const supabase = createServerAdminClient()

  if (!proposal.pixieset_invoice_link) {
    throw new Error('No Pixieset invoice link on this proposal.')
  }

  const subject = `Your invoice is ready, ${proposal.client.first_name}.`

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    reply_to: REPLY_TO,
    to: proposal.client.email,
    subject,
    html: buildInvoiceEmailHtml(proposal),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)

  await (supabase.from('email_logs') as any).insert({
    proposal_id: proposal.id,
    resend_email_id: data?.id ?? null,
    to_email: proposal.client.email,
    subject,
    email_type: 'invoice_ready',
    status: 'sent',
    sent_at: new Date().toISOString(),
  })

  await supabase
    .from('proposals')
    .update({ status: 'invoice_sent' })
    .eq('id', proposal.id)

  return data?.id ?? ''
}
