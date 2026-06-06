// Minimal Resend helper placeholder
import Resend from 'resend'

export const resendClient = new Resend(process.env.RESEND_API_KEY || '')

export const sendOtpEmail = async (to: string, code: string) => {
  // placeholder - implement templates in Phase 2
  return resendClient.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'no-reply@chronolux.example',
    to,
    subject: 'Your ChronoLux verification code',
    html: `<p>Your verification code is <strong>${code}</strong></p>`,
  })
}
