import nodemailer from 'nodemailer'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

type SendEmailResult = {
  success: boolean
  skipped?: boolean
  provider: 'smtp'
  error?: string
  messageId?: string
}

function shouldSendEmail() {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_EMAIL_SEND === 'true'
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = process.env.SMTP_SECURE !== 'false'
  const requireTLS = process.env.SMTP_REQUIRE_TLS === 'true'
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 60000)
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 60000)
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 60000)
  const family = Number(process.env.SMTP_FAMILY || 4)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || process.env.SMTP_USER

  return {
    host,
    port,
    secure,
    requireTLS,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    family,
    user,
    pass,
    from,
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<SendEmailResult> {
  if (!shouldSendEmail()) {
    return {
      success: true,
      skipped: true,
      provider: 'smtp',
    }
  }

  const config = getSmtpConfig()

  if (!config.host || !config.user || !config.pass || !config.from) {
    console.error(
      'SMTP configuration is missing. Check SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM.'
    )

    return {
      success: false,
      skipped: false,
      provider: 'smtp',
      error: 'Email service is not configured',
    }
  }

  try {
    console.log('SMTP config check', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: config.requireTLS,
      userExists: Boolean(config.user),
      passExists: Boolean(config.pass),
      fromExists: Boolean(config.from),
    })
  } catch {
    // Logging should never break email sending
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    connectionTimeout: config.connectionTimeout,
    greetingTimeout: config.greetingTimeout,
    socketTimeout: config.socketTimeout,
    family: config.family,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  } as any)

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
      text,
    })

    return {
      success: true,
      skipped: false,
      provider: 'smtp',
      messageId: info.messageId,
    }
  } catch (err: any) {
    console.error('SMTP email failed:', err?.message || err)

    return {
      success: false,
      skipped: false,
      provider: 'smtp',
      error: err?.message || 'Email could not be sent',
    }
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  const safeEmail = escapeHtml(email)
  const safeOtp = escapeHtml(otp)

  const subject = 'Your ChronoLux verification code'
  const brandColor = '#b8860b'

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head>
    <body style="margin:0;padding:0;background:#f5f1ec;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:24px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding:24px 32px;border-bottom:1px solid #f0e9df;text-align:center">
                  <h1 style="margin:0;font-family:serif;font-size:22px;color:#3b2f2f">ChronoLux</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;text-align:center">
                  <p style="margin:0 0 12px;color:#5a4f4a;font-size:16px">Hello ${safeEmail},</p>
                  <p style="margin:0 0 20px;color:#5a4f4a">Your ChronoLux verification code is below. It expires in 15 minutes.</p>
                  <div style="display:inline-block;padding:18px 28px;border-radius:8px;background:linear-gradient(180deg,#fff7e6,#fff3d6);box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                    <div style="font-size:28px;letter-spacing:4px;font-weight:700;color:${brandColor}">
                      ${safeOtp}
                    </div>
                  </div>
                  <p style="margin:20px 0 0;color:#7a6b60;font-size:13px">
                    If you did not request this, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px;border-top:1px solid #f0e9df;text-align:center;color:#9b8f86;font-size:12px">
                  © ChronoLux
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `ChronoLux verification code

Hello ${email},

Your verification code is: ${otp}

This code expires in 15 minutes. If you did not request this, ignore this email.

-- ChronoLux`

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const safeEmail = escapeHtml(email)
  const safeResetUrl = escapeHtml(resetUrl)

  const subject = 'Reset your ChronoLux password'

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head>
    <body style="margin:0;padding:0;background:#f5f1ec;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:24px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding:24px 32px;border-bottom:1px solid #f0e9df;text-align:center">
                  <h1 style="margin:0;font-family:serif;font-size:22px;color:#3b2f2f">
                    ChronoLux
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;text-align:center">
                  <p style="margin:0 0 12px;color:#5a4f4a;font-size:16px">
                    Hello ${safeEmail},
                  </p>

                  <p style="margin:0 0 20px;color:#5a4f4a">
                    We received a request to reset your ChronoLux password. This link expires in 30 minutes.
                  </p>

                  <a href="${safeResetUrl}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#3b2f2f;color:#ffffff;text-decoration:none;font-weight:600">
                    Reset password
                  </a>

                  <p style="margin:20px 0 0;color:#7a6b60;font-size:13px">
                    If the button does not work, copy and paste this link into your browser:
                  </p>

                  <p style="word-break:break-all;color:#7a6b60;font-size:13px">
                    ${safeResetUrl}
                  </p>

                  <p style="margin:20px 0 0;color:#7a6b60;font-size:13px">
                    If you did not request this, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px;border-top:1px solid #f0e9df;text-align:center;color:#9b8f86;font-size:12px">
                  © ChronoLux
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `ChronoLux password reset

Hello ${email},

Reset your password using this link:
${resetUrl}

This link expires in 30 minutes. If you did not request this, ignore this email.

-- ChronoLux`

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}

export default sendOtpEmail