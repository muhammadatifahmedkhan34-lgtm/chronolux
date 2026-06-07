import nodemailer from 'nodemailer'

export async function sendOtpEmail(email: string, otp: string) {
  // In development, skip sending unless FORCE_EMAIL_SEND === 'true'
  const force = process.env.FORCE_EMAIL_SEND === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  if (!isProd && !force) {
    return { success: true, skipped: true }
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!host || !user || !pass) {
    console.error('SMTP configuration is missing')
    return { success: false, provider: 'smtp', error: 'Email service not configured' }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })

  const subject = 'Your ChronoLux verification code'
  const brandColor = '#b8860b'
  const html = `
    <!doctype html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body style="margin:0;padding:0;background:#f5f1ec;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Arial;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr><td align="center" style="padding:24px 0">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">
            <tr><td style="padding:24px 32px;border-bottom:1px solid #f0e9df;text-align:center"><h1 style="margin:0;font-family:serif;font-size:22px;color:#3b2f2f">ChronoLux</h1></td></tr>
            <tr><td style="padding:28px 32px;text-align:center">
              <p style="margin:0 0 12px;color:#5a4f4a;font-size:16px">Hello ${email},</p>
              <p style="margin:0 0 20px;color:#5a4f4a">Your ChronoLux verification code is below. It expires soon.</p>
              <div style="display:inline-block;padding:18px 28px;border-radius:8px;background:linear-gradient(180deg, #fff7e6, #fff3d6);box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                <div style="font-size:28px;letter-spacing:4px;font-weight:700;color:${brandColor}">${otp}</div>
              </div>
              <p style="margin:20px 0 0;color:#7a6b60;font-size:13px">If you did not request this, please ignore this email.</p>
            </td></tr>
            <tr><td style="padding:18px 32px;border-top:1px solid #f0e9df;text-align:center;color:#9b8f86;font-size:12px">© ChronoLux</td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
  `

  const text = `ChronoLux verification code\n\nHello ${email},\n\nYour verification code is: ${otp}\n\nThis code expires soon. If you did not request this, ignore this email.\n\n-- ChronoLux`

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      html,
      text
    })
    return { success: true, skipped: false, provider: 'smtp' }
  } catch (err:any) {
    console.error('SMTP OTP email failed:', err?.message || err)
    return { success: false, skipped: false, provider: 'smtp', error: 'OTP email could not be sent' }
  }
}

export default sendOtpEmail
