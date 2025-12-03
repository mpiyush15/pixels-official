import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend (optional - as backup)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize AWS SES SMTP Transporter
const smtpTransporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}) : null;

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@pixelsdigital.tech';
const COMPANY_NAME = 'Pixels Digital';
const SUPPORT_EMAIL = 'support@pixelsdigital.tech';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using AWS SES SMTP (primary) or Resend (backup)
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Check if any email service is configured
    if (!smtpTransporter && !resend) {
      console.warn('No email service configured. Email would have been sent to:', options.to);
      return { success: false, error: 'Email service not configured' };
    }

    // Priority 1: Use AWS SES SMTP if configured
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail({
          from: FROM_EMAIL,
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });

        console.log('Email sent via AWS SES SMTP:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (smtpError: any) {
        console.error('AWS SES SMTP error:', smtpError);
        
        // If Resend is available, fall back to it
        if (resend) {
          console.log('Falling back to Resend...');
        } else {
          return { success: false, error: smtpError.message || 'Failed to send email via SMTP' };
        }
      }
    }

    // Priority 2: Use Resend if SMTP failed or not configured
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      console.log('Email sent via Resend:', data?.id);
      return { success: true, messageId: data?.id };
    }

    return { success: false, error: 'No email provider configured' };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
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
