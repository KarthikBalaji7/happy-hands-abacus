/**
 * Netlify Serverless Function for handling Contact & Enrollment Form Submissions
 * 
 * Supports Netlify Functions v2 (Web standard Request / Response API).
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
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
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
      // Fallback parse attempt
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
  } catch (err) {
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

  const submissionPayload = {
    name,
    phone,
    program: programLabel,
    intent: intentLabel,
    email: email || undefined,
    message: message || undefined,
    submittedAt: new Date().toISOString(),
  }

  console.log('[Happy Hands Contact Form] New Submission received:', JSON.stringify(submissionPayload, null, 2))

  /**
   * Optional Provider Integrations:
   * 1. Resend / SendGrid / Nodemailer email notification
   * 2. Slack / Discord / Telegram Webhook
   * 3. CRM / Database (Supabase, Airtable, Notion, etc.)
   * 
   * Example: Resend API integration
   * If RESEND_API_KEY & CONTACT_RECIPIENT_EMAIL are defined in Netlify environment variables:
   */
  const resendApiKey = process.env.RESEND_API_KEY
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'admissions@happyhandseducation.com'

  if (resendApiKey) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #6C5CE7; margin-bottom: 16px;">New ${intentLabel} Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Intent:</td><td>${intentLabel}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Program:</td><td>${programLabel}</td></tr>
            ${email ? `<tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>` : ''}
            ${message ? `<tr><td style="padding: 8px 0; font-weight: bold;">Message:</td><td>${message}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; font-weight: bold;">Submitted:</td><td>${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Happy Hands <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: email || undefined,
          subject: `[Happy Hands] New ${intentLabel} from ${name}`,
          html: emailHtml,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('[Happy Hands Contact Form] Resend API error:', errorText)
      }
    } catch (err) {
      console.error('[Happy Hands Contact Form] Failed sending email via Resend:', err)
    }
  }

  // Optional Webhook notification (Discord / Slack)
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📬 **New ${intentLabel} Application**\n**Name:** ${name}\n**Phone:** ${phone}\n**Program:** ${programLabel}${email ? `\n**Email:** ${email}` : ''}`,
        }),
      })
    } catch (err) {
      console.error('[Happy Hands Contact Form] Webhook failed:', err)
    }
  }

  return jsonResponse({
    success: true,
    message: 'Thank you! Your request has been received. We will get back to you shortly.',
    data: {
      name,
      intent: intentLabel,
      program: programLabel,
    },
  })
}
