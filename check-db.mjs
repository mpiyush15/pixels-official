import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('pixelsdigital');
    
    console.log('--- PROJECTS with payments ---');
    const projectWithPayments = await db.collection('projects').findOne({ payments: { $exists: true, $not: {$size: 0} } });
    if (projectWithPayments) {
      console.log('Found project with "payments" array. Keys:', Object.keys(projectWithPayments));
      console.log('Sample payments array:', projectWithPayments.payments);
    } else {
      console.log('No project has a "payments" array.');
    }
    
    console.log('\n--- PROJECTS with paymentLogs ---');
    const projectWithPaymentLogs = await db.collection('projects').findOne({ paymentLogs: { $exists: true, $not: {$size: 0} } });
    if (projectWithPaymentLogs) {
      console.log('Found project with "paymentLogs" array. Keys:', Object.keys(projectWithPaymentLogs));
      console.log('Sample paymentLogs array:', projectWithPaymentLogs.paymentLogs);
    } else {
      console.log('No project has a "paymentLogs" array.');
    }
    
    console.log('\n--- RECENT PAYMENTS COLLECTION ---');
    const recentPayments = await db.collection('payments').find().sort({ _id: -1 }).limit(3).toArray();
    console.log(JSON.stringify(recentPayments, null, 2));
    
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
