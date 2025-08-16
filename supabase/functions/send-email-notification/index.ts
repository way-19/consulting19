import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailNotificationRequest {
  user_id: string;
  notification_type: string;
  data: any;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { user_id, notification_type, data }: EmailNotificationRequest = await req.json()

    if (!user_id || !notification_type) {
      throw new Error('Missing required parameters')
    }

    // Get user profile and email preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name, language_preference')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    // Check if user has email notifications enabled
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('preferences')
      .eq('user_id', user_id)
      .maybeSingle()

    const userPrefs = preferences?.preferences || { email_enabled: true }
    
    if (!userPrefs.email_enabled) {
      console.log('Email notifications disabled for user:', user_id)
      return new Response(
        JSON.stringify({ success: true, message: 'Email notifications disabled for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate email content based on notification type
    const emailContent = generateEmailContent(notification_type, data, profile.language_preference || 'en')
    
    if (!emailContent) {
      throw new Error('No email template found for notification type: ' + notification_type)
    }

    // Send email using your preferred email service
    // For demo purposes, we'll simulate sending
    console.log('Sending email to:', profile.email)
    console.log('Subject:', emailContent.subject)
    console.log('Content:', emailContent.text)

    // In production, you would integrate with:
    // - SendGrid: await sendWithSendGrid(profile.email, emailContent)
    // - Resend: await sendWithResend(profile.email, emailContent)
    // - AWS SES: await sendWithSES(profile.email, emailContent)
    // - Mailgun: await sendWithMailgun(profile.email, emailContent)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Log email sent
    await supabase
      .from('audit_logs')
      .insert([{
        user_id: user_id,
        action: 'EMAIL_NOTIFICATION_SENT',
        target_table: 'notifications',
        new_values: {
          notification_type,
          recipient: profile.email,
          subject: emailContent.subject
        }
      }])

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification sent successfully',
        recipient: profile.email,
        subject: emailContent.subject
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Email notification error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email notification'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function generateEmailContent(type: string, data: any, language: string = 'en'): EmailTemplate | null {
  const templates: Record<string, (data: any) => EmailTemplate> = {
    document_uploaded: (data) => ({
      subject: `New Document: ${data.document_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">📄 New Document Uploaded</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Document Details</h2>
            <ul style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <li><strong>Document:</strong> ${data.document_name}</li>
              <li><strong>Client:</strong> ${data.client_name}</li>
              <li><strong>Type:</strong> ${data.document_type}</li>
              <li><strong>Uploaded:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Please review the document in your consultant dashboard.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://consulting19.com'}/consultant/documents" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Document
              </a>
            </div>
          </div>
        </div>
      `,
      text: `New document uploaded: ${data.document_name} by ${data.client_name}. Please review in your dashboard.`
    }),

    document_approved: (data) => ({
      subject: `Document Approved: ${data.document_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Document Approved</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Great News!</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78;">
              <p>Your document <strong>${data.document_name}</strong> has been approved by ${data.consultant_name}.</p>
              <p>You can now proceed with the next steps in your business process.</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://consulting19.com'}/client/documents" 
                 style="background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Documents
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Your document "${data.document_name}" has been approved by ${data.consultant_name}.`
    }),

    payment_received: (data) => ({
      subject: `Payment Received: ${data.amount} ${data.currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">💰 Payment Received</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Payment Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78;">
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                <li style="margin-bottom: 10px;"><strong>Client:</strong> ${data.client_name}</li>
                <li style="margin-bottom: 10px;"><strong>Service:</strong> ${data.service_name}</li>
                <li style="margin-bottom: 10px;"><strong>Your Commission:</strong> ${data.commission_amount} ${data.currency}</li>
              </ul>
            </div>
            <p>The payment has been processed and will be reflected in your next payout.</p>
          </div>
        </div>
      `,
      text: `Payment received: ${data.amount} ${data.currency} from ${data.client_name}. Commission: ${data.commission_amount} ${data.currency}`
    }),

    welcome_client: (data) => ({
      subject: 'Welcome to Consulting19 - Your Business Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Consulting19!</h1>
            <p style="color: #e2e8f0; margin-top: 10px; font-size: 18px;">The World's First AI-Enhanced Business Consulting Platform</p>
          </div>
          <div style="padding: 40px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333;">Dear ${data.client_name},</p>
            <p>Welcome to the future of international business consulting!</p>
            
            <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">👨‍💼 Your Assigned Consultant</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><strong>Name:</strong> ${data.consultant_name}</li>
                <li style="margin-bottom: 8px;"><strong>Email:</strong> ${data.consultant_email}</li>
                <li style="margin-bottom: 8px;"><strong>Specialization:</strong> ${data.consultant_country} Expert</li>
                <li style="margin-bottom: 8px;"><strong>Rating:</strong> ⭐ 4.9/5 (1,200+ clients served)</li>
              </ul>
            </div>
            
            <h3 style="color: #333;">🚀 What's Next?</h3>
            <ul style="background: white; padding: 20px; border-radius: 8px;">
              <li style="margin-bottom: 10px;">✅ Your consultant will contact you within 24 hours</li>
              <li style="margin-bottom: 10px;">📋 Complete your business profile in the dashboard</li>
              <li style="margin-bottom: 10px;">📄 Upload any required documents</li>
              <li style="margin-bottom: 10px;">🌟 Start your business formation journey</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('FRONTEND_URL') || 'https://consulting19.com'}/client-accounting" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Access Your Dashboard
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #666;">If you have any questions, don't hesitate to reach out through our platform.</p>
            <p style="color: #666;">Best regards,<br><strong>The Consulting19 Team</strong></p>
          </div>
        </div>
      `,
      text: `Welcome to Consulting19! Your consultant ${data.consultant_name} (${data.consultant_email}) will contact you soon. Access your dashboard at ${Deno.env.get('FRONTEND_URL') || 'https://consulting19.com'}/client-accounting`
    })
  };

  const template = templates[type];
  return template ? template(data) : null;
}

// Email service integrations (choose one based on your preference)

// SendGrid Integration
async function sendWithSendGrid(to: string, content: EmailTemplate) {
  const apiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!apiKey) throw new Error('SendGrid API key not configured')

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@consulting19.com', name: 'Consulting19' },
      subject: content.subject,
      content: [
        { type: 'text/plain', value: content.text },
        { type: 'text/html', value: content.html }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`SendGrid error: ${response.status}`)
  }
}

// Resend Integration
async function sendWithResend(to: string, content: EmailTemplate) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) throw new Error('Resend API key not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Consulting19 <noreply@consulting19.com>',
      to: [to],
      subject: content.subject,
      html: content.html,
      text: content.text
    })
  })

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status}`)
  }
}

// SMTP Integration (using Deno's built-in SMTP)
async function sendWithSMTP(to: string, content: EmailTemplate) {
  // This would require additional SMTP configuration
  // For now, we'll just log the email
  console.log('SMTP Email would be sent to:', to)
  console.log('Subject:', content.subject)
  console.log('Content:', content.text)
}