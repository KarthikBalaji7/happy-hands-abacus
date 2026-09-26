import nodemailer from 'nodemailer'

/**
 * Netlify Serverless Function for Contact & Enrollment Form Submissions
 * SMTP-based email dispatch using Nodemailer.
 * 
 * Route: /.netlify/functions/contact or /api/contact (via netlify.toml redirect)
 */

interface ContactSubmission {
  name: string
  phone: string
  program: string
  intent: 'enroll' | 'demo' | string
  email?: string
  message?: string
}

const PROGRAM_LABELS: Record<string, string> = {
  pregnancy: 'Pregnancy Program (Expecting Mothers)',
  starters: 'Starters',
  movers: 'Movers',
  riders: 'Riders',
  racers: 'Racers',
  flyers: 'Flyers',
  endeavours: 'Endeavours',
  achievers: 'Achievers',
  stars: 'Stars',
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Generates an accessible, clean HTML email body
 */
function buildHtmlEmail(data: {
  name: string
  phone: string
  programLabel: string
  intentLabel: string
  email?: string
  message?: string
  submittedAt: string
}): string {
  const { name, phone, programLabel, intentLabel, email, message, submittedAt } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${intentLabel} Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #5046e5 0%, #7c3aed 100%); padding: 28px 32px; color: #ffffff; text-align: center;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Happy Hands Abacus</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">New ${intentLabel} Request</p>
    </div>
    <div style="padding: 32px;">
      <p style="margin-top: 0; font-size: 15px; line-height: 1.5; color: #475569;">
        You have received a new application via the website form:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 130px;">Request Type</td>
          <td style="padding: 10px 0; font-weight: 600; color: #5046e5;">${intentLabel}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Full Name</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Phone Number</td>
          <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${phone}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Program</td>
          <td style="padding: 10px 0; color: #0f172a;">${programLabel}</td>
        </tr>
        ${email ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Email Address</td>
          <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
        </tr>` : ''}
        ${message ? `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Message</td>
          <td style="padding: 10px 0; color: #0f172a; white-space: pre-wrap;">${message}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Date & Time</td>
          <td style="padding: 10px 0; color: #64748b;">${submittedAt}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="tel:${phone}" style="display: inline-block; background: #5046e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 8px; margin-right: 8px;">
          📞 Call Applicant
        </a>
        ${email ? `
        <a href="mailto:${email}?subject=Re:%20Happy%20Hands%20Abacus%20${encodeURIComponent(intentLabel)}" style="display: inline-block; background: #f1f5f9; color: #334155; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 8px;">
          ✉️ Reply via Email
        </a>` : ''}
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 14px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      Happy Hands Abacus Form Submission Notification
    </div>
  </div>
</body>
</html>
`
}

/**
 * Sends email notification via SMTP (Nodemailer)
 */
async function sendSmtpEmail(options: {
  subject: string
  html: string
  text: string
  senderName: string
  applicantEmail?: string
}): Promise<{ sent: boolean; error?: string }> {
  const recipientEmail =
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.RECIPIENT_EMAIL ||
    process.env.TO_EMAIL ||
    'admissions@happyhandseducation.com'

  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      '[Happy Hands Contact Form] SMTP credentials missing in environment (SMTP_HOST, SMTP_USER, SMTP_PASS).'
    )
    return { sent: false, error: 'SMTP credentials not configured.' }
  }

  try {
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // From Header: Display name shows applicant's name, sent through authenticated SMTP mailbox
    const displayName = options.senderName ? `"${options.senderName}"` : '"Happy Hands Website"'
    const fromAddress = process.env.CONTACT_FROM_EMAIL || `${displayName} <${smtpUser}>`

    // Reply-To Header: Directly addresses applicant if email was provided
    const replyToAddress = options.applicantEmail
      ? `"${options.senderName}" <${options.applicantEmail}>`
      : undefined

    await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      replyTo: replyToAddress,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log(`[Happy Hands] Notification email sent successfully via SMTP to ${recipientEmail} from ${displayName}`)
    return { sent: true }
  } catch (err: any) {
    console.error('[Happy Hands] SMTP email delivery error:', err?.message || err)
    return { sent: false, error: err?.message || 'SMTP Error' }
  }
}

export default async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return jsonResponse(
      { success: false, error: `Method ${req.method} not allowed. Please use POST.` },
      405
    )
  }

  let body: Partial<ContactSubmission> = {}

  try {
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await req.formData()
      body = {
        name: formData.get('name')?.toString(),
        phone: formData.get('phone')?.toString(),
        program: formData.get('program')?.toString(),
        intent: formData.get('intent')?.toString(),
        email: formData.get('email')?.toString(),
        message: formData.get('message')?.toString(),
      }
    } else {
      const rawText = await req.text()
      try {
        body = JSON.parse(rawText)
      } catch {
        return jsonResponse(
          { success: false, error: 'Invalid request format. Expected JSON or form data.' },
          400
        )
      }
    }
  } catch {
    return jsonResponse(
      { success: false, error: 'Could not parse request body.' },
      400
    )
  }

  const name = body.name?.trim() ?? ''
  const phone = body.phone?.trim() ?? ''
  const programKey = body.program?.trim() ?? ''
  const intent = body.intent?.trim() || 'enroll'
  const email = body.email?.trim() || ''
  const message = body.message?.trim() || ''

  // Validate required fields
  const missingFields: string[] = []
  if (!name) missingFields.push('Full Name')
  if (!phone) missingFields.push('Phone Number')
  if (!programKey) missingFields.push('Program')

  if (missingFields.length > 0) {
    return jsonResponse(
      {
        success: false,
        error: `Missing required field(s): ${missingFields.join(', ')}`,
      },
      400
    )
  }

  const programLabel = PROGRAM_LABELS[programKey] || programKey
  const intentLabel = intent === 'demo' ? 'Enquiry / Demo' : 'Enrollment'
  const submittedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: process.env.TIMEZONE || 'Indian/Maldives',
  })

  const submissionPayload = {
    name,
    phone,
    program: programLabel,
    intent: intentLabel,
    email: email || undefined,
    message: message || undefined,
    submittedAt,
  }

  console.log('[Happy Hands Contact Form] Submission received:', JSON.stringify(submissionPayload, null, 2))

  // Build subject and body content
  const emailSubject = `[Happy Hands] New ${intentLabel} Application from ${name}`
  const emailText = `
New ${intentLabel} Application
---------------------------------
Name: ${name}
Phone: ${phone}
Intent: ${intentLabel}
Program: ${programLabel}
${email ? `Email: ${email}\n` : ''}${message ? `Message: ${message}\n` : ''}Date: ${submittedAt}
  `.trim()

  const emailHtml = buildHtmlEmail({
    name,
    phone,
    programLabel,
    intentLabel,
    email: email || undefined,
    message: message || undefined,
    submittedAt,
  })

  // Send Email via SMTP
  const emailResult = await sendSmtpEmail({
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
    senderName: name,
    applicantEmail: email || undefined,
  })

  return jsonResponse({
    success: true,
    message: 'Thank you! Your request has been received. We will get back to you shortly.',
    data: {
      name,
      intent: intentLabel,
      program: programLabel,
      emailSent: emailResult.sent,
    },
  })
}
