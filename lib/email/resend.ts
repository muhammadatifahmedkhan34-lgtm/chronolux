import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

export async function sendOtpEmail(email: string, otp: string) {
  if (process.env.NODE_ENV !== 'production') {
    return { success: true }
  }

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is missing')
    return { success: false, error: 'Email service not configured' }
  }

  const resend = new Resend(resendApiKey)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your ChronoLux OTP Code',
      html: `Your ChronoLux verification code is ${otp}`,
    })

    return { success: true }
  } catch (error) {
    console.error('Resend OTP email failed:', error)
    return { success: false, error: 'OTP email could not be sent' }
  }
}

export default sendOtpEmail
