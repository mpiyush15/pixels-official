import { sendAdminNewSubscriptionEmail } from '../lib/email';

async function test() {
  console.log('Sending test email...');
  const res = await sendAdminNewSubscriptionEmail(
    'Test Client',
    'client@example.com',
    'Premium Growth Plan',
    'Monthly',
    15000
  );
  console.log('Result:', res);
}

test();
