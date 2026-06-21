import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelsdigital";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('pixelsdigital');
    
    console.log('--- WIPING DATA ---');
    
    const projectsResult = await db.collection('projects').deleteMany({});
    console.log(`Deleted ${projectsResult.deletedCount} projects.`);
    
    const invoicesResult = await db.collection('invoices').deleteMany({});
    console.log(`Deleted ${invoicesResult.deletedCount} invoices.`);
    
    const paymentsResult = await db.collection('payments').deleteMany({});
    console.log(`Deleted ${paymentsResult.deletedCount} payments.`);
    
    const ledgerResult = await db.collection('ledger_entries').deleteMany({});
    console.log(`Deleted ${ledgerResult.deletedCount} ledger_entries.`);
    
    console.log('--- WIPE COMPLETE ---');
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
