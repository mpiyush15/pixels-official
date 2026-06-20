const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('replysys-new');
  const colls = await db.listCollections().toArray();
  console.log('Collections in replysys-new:', colls.map(c=>c.name));
  
  if (colls.some(c => c.name === 'payments')) {
    const p = await db.collection('payments').findOne({});
    console.log('Sample Payment:', p);
  }
  if (colls.some(c => c.name === 'invoices')) {
    const i = await db.collection('invoices').findOne({});
    console.log('Sample Invoice:', i);
  }
  if (colls.some(c => c.name === 'subscriptions')) {
    const s = await db.collection('subscriptions').findOne({});
    console.log('Sample Subscription:', s);
  }
  await client.close();
}
run();
