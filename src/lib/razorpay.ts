import Razorpay from 'razorpay';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import crypto from 'crypto';

export interface RazorpayClientConfig {
  razorpay: Razorpay;
  keyId: string;
  keySecret: string;
}

/**
 * Initialize Razorpay client.
 * Priority:
 * 1. Environment variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)
 * 2. Payload CMS Global settings ('payment-settings')
 */
export async function getRazorpayClient(): Promise<RazorpayClientConfig> {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    try {
      const payload = await getPayload({ config: configPromise });
      const paymentSettings = await payload.findGlobal({
        slug: 'payment-settings',
      });

      if (paymentSettings?.razorpayKeyId && paymentSettings?.razorpayKeySecret) {
        keyId = paymentSettings.razorpayKeyId as string;
        keySecret = paymentSettings.razorpayKeySecret as string;
      }
    } catch (cmsError) {
      console.warn('Could not retrieve Razorpay keys from CMS:', cmsError);
    }
  }

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay credentials not found. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env or CMS Payment Settings.'
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return { razorpay, keyId, keySecret };
}

/**
 * Create a Razorpay Payment Link for an invoice.
 */
export async function createInvoicePaymentLink(invoice: any, amountToPay: number) {
  const { razorpay } = await getRazorpayClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pixelsdigitalsolutions.com';

  const amountInPaise = Math.round(amountToPay * 100);

  const options: any = {
    amount: amountInPaise,
    currency: 'INR',
    accept_partial: false,
    description: `Payment for Invoice #${invoice.invoiceNumber}`,
    customer: {
      name: invoice.clientName || 'Valued Client',
      email: invoice.clientEmail,
      contact: invoice.clientPhone || undefined,
    },
    notify: {
      sms: Boolean(invoice.clientPhone),
      email: false, // We send our custom branded email
    },
    reminder_enable: true,
    notes: {
      invoiceId: invoice._id ? invoice._id.toString() : '',
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId ? invoice.clientId.toString() : '',
      projectId: invoice.projectId ? invoice.projectId.toString() : '',
    },
    callback_url: `${baseUrl}/payment/callback?invoice_id=${invoice._id}`,
    callback_method: 'get',
  };

  const paymentLink = await razorpay.paymentLink.create(options);
  return paymentLink;
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Error verifying Razorpay webhook signature:', error);
    return false;
  }
}

