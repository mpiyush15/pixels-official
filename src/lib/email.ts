import { Resend } from 'resend';
// @ts-ignore - Type declaration issue with zeptomail package
import { SendMailClient } from 'zeptomail';

// Initialize Zeptomail client with correct endpoint and mail agent alias
const zeptomailClient = process.env.ZEPTOMAIL_API_TOKEN 
  ? new SendMailClient({
      url: 'https://api.zeptomail.in/v1.1/email',
      token: process.env.ZEPTOMAIL_API_TOKEN,
      // Mail Agent Alias for routing
      mailAgentAlias: process.env.ZEPTOMAIL_MAIL_AGENT_ALIAS || '7ba3f22116c7e67b'
    })
  : null;

// Initialize Resend (optional - as backup)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@pixelsdigital.tech';
const FROM_NAME = 'Pixels Digital';
const COMPANY_NAME = 'Pixels Digital Solutions';
const SUPPORT_EMAIL = 'info@pixelsdigital.tech';
const LOGO_URL = 'https://pixels-official.s3.ap-south-1.amazonaws.com/images/logo.png';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Zeptomail SDK (primary) or Resend (backup)
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Check if any email service is configured
    if (!zeptomailClient && !resend) {
      console.warn('No email service configured. Email would have been sent to:', options.to);
      return { success: false, error: 'Email service not configured' };
    }

    // Priority 1: Use Zeptomail SDK if client is initialized
    if (zeptomailClient) {
      try {
        console.log('📧 Attempting to send email via Zeptomail to:', options.to);
        console.log('  From:', FROM_EMAIL);
        
        const toAddresses = Array.isArray(options.to) 
          ? options.to.map(email => ({
              email_address: {
                address: email,
                name: email.split('@')[0]
              }
            }))
          : [{
              email_address: {
                address: options.to,
                name: options.to.split('@')[0]
              }
            }];

        const mailResponse = await zeptomailClient.sendMail({
          from: {
            address: FROM_EMAIL,
            name: FROM_NAME
          },
          to: toAddresses,
          subject: options.subject,
          htmlbody: options.html,
          textbody: options.text || stripHtml(options.html),
        });

        console.log('📧 Email sent successfully via Zeptomail');
        console.log('  From:', `${FROM_NAME} <${FROM_EMAIL}>`);
        console.log('  To:', Array.isArray(options.to) ? options.to.join(', ') : options.to);
        console.log('  Subject:', options.subject);
        console.log('  Request ID:', mailResponse?.request_id || mailResponse?.id || 'Unknown');
        return { success: true, messageId: mailResponse?.request_id || mailResponse?.id || 'sent' };
      } catch (zeptomailError: any) {
        const errorMessage = zeptomailError?.message || 'Failed to send email';
        const errorDetails = zeptomailError?.response || zeptomailError;
        
        console.error('❌ Zeptomail Error:', {
          message: errorMessage,
          details: errorDetails,
          status: zeptomailError?.status || 'Unknown'
        });
        
        // If Resend is available, fall back to it
        if (resend) {
          console.log('⚠️  Zeptomail failed, falling back to Resend...');
        } else {
          return { 
            success: false, 
            error: `Zeptomail Error: ${errorMessage}` 
          };
        }
      }
    }

    // Priority 2: Use Resend if Zeptomail failed or not configured
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent via Resend:', data?.id);
      return { success: true, messageId: data?.id };
    }

    return { success: false, error: 'No email provider configured' };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Email Templates
 */

// Welcome Email for New Clients
export async function sendWelcomeEmail(to: string, clientName: string, loginUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${COMPANY_NAME}! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>Welcome to ${COMPANY_NAME}! We're excited to have you on board.</p>
          <p>Your client portal account has been created. You can now access your projects, invoices, and payments anytime.</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Access Your Portal</a>
          </p>
          <p>If you have any questions, feel free to reach out to us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${COMPANY_NAME}!`,
    html,
  });
}

// Login Alert Email
export async function sendLoginAlertEmail(to: string, clientName: string, ipAddress: string, timestamp: Date) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 New Login Detected</h2>
        </div>
        <div class="content">
          <h3>Hi ${clientName},</h3>
          <p>We detected a new login to your ${COMPANY_NAME} account.</p>
          <div class="info-box">
            <p><strong>Time:</strong> ${timestamp.toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
          </div>
          <p>If this was you, you can safely ignore this email.</p>
          <p>If you didn't log in, please contact us immediately at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'New Login to Your Account',
    html,
  });
}

// Password Reset Email
export async function sendPasswordResetEmail(to: string, clientName: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔑 Password Reset Request</h2>
        </div>
        <div class="content">
          <h3>Hi ${clientName},</h3>
          <p>We received a request to reset your password for your ${COMPANY_NAME} account.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Your Password</a>
          </p>
          <p><small>Or copy and paste this link into your browser:<br>${resetUrl}</small></p>
          <div class="warning">
            <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.</p>
          </div>
          <p>If you didn't request this password reset, please ignore this email or contact us if you have concerns.</p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Password Reset Request',
    html,
  });
}

// Payment Confirmation Email
export async function sendPaymentConfirmationEmail(
  to: string,
  clientName: string,
  amount: number,
  transactionId: string,
  paymentDate: Date
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .amount { font-size: 36px; font-weight: bold; color: #11998e; text-align: center; margin: 20px 0; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Received!</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>Thank you for your payment! We've received your payment successfully.</p>
          <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
          <div class="info-box">
            <div class="info-row">
              <span><strong>Transaction ID:</strong></span>
              <span>${transactionId}</span>
            </div>
            <div class="info-row">
              <span><strong>Date:</strong></span>
              <span>${paymentDate.toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span><strong>Status:</strong></span>
              <span style="color: #11998e;">Successful</span>
            </div>
          </div>
          <p>You can view your payment details and download receipts from your client portal.</p>
          <p>If you have any questions, contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Payment Confirmation',
    html,
  });
}

// Payment Reminder Email
export async function sendPaymentReminderEmail(
  to: string,
  clientName: string,
  amount: number,
  dueDate: Date,
  invoiceNumber: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .amount { font-size: 36px; font-weight: bold; color: #f44336; text-align: center; margin: 20px 0; }
        .info-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Payment Reminder</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>This is a friendly reminder about your upcoming payment.</p>
          <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
          <div class="info-box">
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/payments" class="button">Make Payment</a>
          </p>
          <p>If you've already made this payment, please disregard this reminder.</p>
          <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Reminder - Invoice ${invoiceNumber}`,
    html,
  });
}

// Invoice Email
export async function sendInvoiceEmail(
  to: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: Date,
  items: Array<{ description: string; amount: number }>,
  invoiceUrl?: string // S3 presigned URL
) {
  const itemsHtml = items.map(item => `
    <div class="info-row">
      <span>${item.description}</span>
      <span>₹${item.amount.toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  const downloadButton = invoiceUrl ? `
    <p style="text-align: center; margin-top: 30px;">
      <a href="${invoiceUrl}" class="button" style="background: #10b981;">📥 Download Invoice PDF</a>
    </p>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .total { font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 New Invoice</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>We've generated a new invoice for you.</p>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          <div class="info-box">
            <h3>Invoice Details</h3>
            ${itemsHtml}
            <div class="total">Total: ₹${amount.toLocaleString('en-IN')}</div>
          </div>
          ${downloadButton}
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/invoices" class="button">View in Portal</a>
          </p>
          <p>If you have any questions, contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `New Invoice ${invoiceNumber}`,
    html,
  });
}

// Project Update Email
export async function sendProjectUpdateEmail(
  to: string,
  clientName: string,
  projectName: string,
  updateMessage: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .update-box { background: #e8eaf6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Project Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>There's a new update on your project: <strong>${projectName}</strong></p>
          <div class="update-box">
            <p>${updateMessage}</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/projects" class="button">View Project</a>
          </p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Project Update: ${projectName}`,
    html,
  });
}

// Contract Acceptance Email
export async function sendContractAcceptanceEmail(
  to: string,
  clientName: string,
  projectName: string,
  projectType: string
) {
  const acceptanceDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client-portal/projects`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .success-badge { background: #d1fae5; color: #065f46; padding: 15px 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #10b981; }
        .project-info { background: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .status-change { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #fbbf24; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .next-steps { background: #eff6ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .next-steps ol { margin: 10px 0; padding-left: 20px; }
        .next-steps li { margin: 8px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Contract Accepted!</h1>
          <p>Your project is ready to begin</p>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>Thank you for accepting the contract. We're excited to work with you on this project!</p>
          
          <div class="success-badge">
            <strong>Contract Accepted on ${acceptanceDate}</strong>
          </div>

          <div class="project-info">
            <h3 style="margin-top: 0; color: #059669;">Project Details</h3>
            <div class="info-row">
              <span><strong>Project Name:</strong></span>
              <span>${projectName}</span>
            </div>
            <div class="info-row">
              <span><strong>Project Type:</strong></span>
              <span>${projectType}</span>
            </div>
            <div class="info-row">
              <span><strong>Acceptance Date:</strong></span>
              <span>${acceptanceDate}</span>
            </div>
          </div>

          <div class="status-change">
            <strong>📊 Status Update:</strong>
            <p style="margin: 10px 0 0 0;">Your project status has been updated to <strong>"In Progress"</strong>. We'll begin work according to the agreed timeline.</p>
          </div>

          <div class="next-steps">
            <h3 style="margin-top: 0; color: #1e40af;">What's Next?</h3>
            <ol>
              <li>Monitor project progress in your dashboard</li>
              <li>Review work submissions and provide feedback</li>
              <li>Chat with our team anytime for updates</li>
              <li>Track milestones and deliverables</li>
            </ol>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="button">View Your Project</a>
          </p>

          <p><strong>Questions or need help?</strong></p>
          <p>Reach out to our support team at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. We're here to help!</p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Contract Accepted: ${projectName} - Project Started ✅`,
    html,
  });
}

// Send Login Credentials Email
export async function sendLoginCredentialsEmail(
  to: string,
  clientName: string,
  email: string,
  password: string,
  portalUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .credentials-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea; font-family: 'Courier New', monospace; }
        .credential-row { margin: 12px 0; padding: 10px; background: white; border-radius: 4px; }
        .credential-label { color: #667eea; font-weight: bold; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
        .credential-value { font-size: 14px; color: #333; word-break: break-all; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
        .security-box { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .security-box strong { color: #b45309; }
        .security-box li { margin: 6px 0; color: #92400e; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Your Login Credentials</h1>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>Welcome! Here are your login credentials to access the client portal. You can now view your projects, invoices, payments, and communicate with our team.</p>

          <div class="credentials-box">
            <div class="credential-row">
              <span class="credential-label">📧 Email Address</span>
              <span class="credential-value">${email}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">🔑 Password</span>
              <span class="credential-value">${password}</span>
            </div>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="${portalUrl}" class="button">Login to Portal</a>
          </p>

          <div class="security-box">
            <strong>🛡️ Security Tips:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Keep your password confidential and don't share it with anyone</li>
              <li>Change your password after your first login for added security</li>
              <li>Use a strong password if you change it</li>
              <li>Clear your browser cache if using a shared computer</li>
              <li>Never give your password to support staff (we'll never ask for it)</li>
            </ul>
          </div>

          <p><strong>Can't login or forgot your password?</strong></p>
          <p>If you have trouble accessing your account or need to reset your password, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>

          <p>We're here to help and answer any questions you may have about your projects or account.</p>
          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Your ${COMPANY_NAME} Portal Login Credentials`,
    html,
  });
}

// Send Quotation Email
export async function sendQuotationEmail(
  to: string,
  clientName: string,
  quotationNumber: string,
  title: string,
  items: Array<{ description: string; quantity: number; rate: number; amount: number }>,
  total: number,
  validUntil: Date
) {
  const itemsHtml = items
    .map(
      (item) => `
    <div class="item-row">
      <span>${item.description}</span>
      <span>${item.quantity}</span>
      <span>₹${item.rate.toLocaleString('en-IN')}</span>
      <span>₹${item.amount.toLocaleString('en-IN')}</span>
    </div>
  `
    )
    .join('');

  const portalUrl = 'https://www.pixelsdigital.tech/client-portal/login';
  const validDate = new Date(validUntil).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .quotation-number { background: #e0e7ff; color: #3730a3; padding: 10px 20px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-header { background: #f3f4f6; font-weight: bold; padding: 12px; border-bottom: 2px solid #667eea; }
        .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .final-total { font-size: 24px; font-weight: bold; color: #059669; border-top: 2px solid #10b981; padding-top: 12px; margin-top: 12px; }
        .validity-box { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Quotation</h1>
          <p>A quotation has been prepared for you</p>
        </div>
        <div class="content">
          <h2>Hi ${clientName},</h2>
          <p>Thank you for your interest! We've prepared a quotation for your project.</p>
          
          <div class="quotation-number">
            Quotation No: ${quotationNumber}
          </div>

          <h3>${title}</h3>

          <div class="items-table">
            <div class="items-header item-row">
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span>Amount</span>
            </div>
            ${itemsHtml}
          </div>

          <div class="total-section">
            <div class="total-row final-total">
              <span>Total Amount:</span>
              <span>₹${total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="validity-box">
            <strong>⏰ Valid Until:</strong>
            <p style="margin: 5px 0 0 0;">${validDate}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This quotation is valid until the date mentioned above. Please respond before expiry.</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" class="button">View in Portal & Accept</a>
          </p>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Review the quotation details carefully</li>
            <li>Login to your portal to accept or ask questions</li>
            <li>Once accepted, we'll start working on your project</li>
            <li>Feel free to reach out for any clarifications</li>
          </ul>

          <p><strong>Have questions?</strong></p>
          <p>Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. We're here to help!</p>

          <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `New Quotation ${quotationNumber} - ${title}`,
    html,
  });
}
