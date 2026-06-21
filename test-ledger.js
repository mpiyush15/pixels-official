const { MongoClient, ObjectId } = require('mongodb');

async function test() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pixels-finance";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('pixels-finance'); // Assuming this is the DB name? Wait, let's check lib/mongodb.ts

  const project = await db.collection('projects').findOne({ _id: new ObjectId("6a36d0dac63de2756318553b") });
  console.log("Project:", project.projectName);
  
  const m = project.milestones[0];
  console.log("Milestone paymentStatus:", m.paymentStatus);
  console.log("Milestone paymentAccountId:", m.paymentAccountId);
  
  const cashAccount = await db.collection('accounts').findOne({ name: 'Cash in Hand' });
  const salesAccount = await db.collection('accounts').findOne({ name: 'Sales Revenue' });
  
  console.log("cashAccount:", cashAccount ? cashAccount._id : 'null');
  console.log("salesAccount:", salesAccount ? salesAccount._id : 'null');

  const existingEntry = await db.collection('ledger_entries').findOne({
    referenceId: project._id.toString(),
    referenceType: 'Payment',
    description: { $regex: m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
  });
  
  console.log("existingEntry:", existingEntry);

  let targetAccountId = cashAccount?._id?.toString();
  if (m.paymentAccountId) {
    targetAccountId = m.paymentAccountId;
  }
  const amount = parseFloat(m.amount) || 0;

  console.log("targetAccountId:", targetAccountId);
  console.log("amount:", amount);

  if (targetAccountId && salesAccount && amount > 0) {
    console.log("WILL INSERT");
  } else {
    console.log("WILL NOT INSERT");
  }

  await client.close();
}

test().catch(console.error);
