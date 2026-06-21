import { MongoClient, ObjectId } from 'mongodb';
import { FinanceDB } from '../src/lib/finance';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set in .env');
}

async function run() {
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    const db = client.db('pixelsdigital');
    
    console.log('Connected to Database');

    // 1. Delete Cancelled Invoices
    const deleteResult = await db.collection('invoices').deleteMany({ status: 'cancelled' });
    console.log(`Deleted ${deleteResult.deletedCount} cancelled invoices`);

    // 2. Sync Older Payments to Ledger
    // First, ensure accounts exist
    await FinanceDB.ensureSystemAccounts();
    const accounts = await db.collection('accounts').find().toArray();
    let cashAccount = accounts.find(a => a.name === 'Cash in Hand');
    let bankAccount = accounts.find(a => a.subType === 'Bank') || cashAccount;
    let receivableAccount = accounts.find(a => a.subType === 'Receivable') || accounts.find(a => a.type === 'Asset');

    if (!cashAccount || !bankAccount || !receivableAccount) {
      console.log('Essential accounts missing, cannot sync payments properly. Run FinanceDB.ensureSystemAccounts() first.');
      return;
    }

    const payments = await db.collection('payments').find().toArray();
    let syncedCount = 0;

    for (const payment of payments) {
      const paymentId = payment._id.toString();
      
      // Check if this payment is already in the ledger
      const existingLedger = await db.collection('ledger_entries').findOne({
        referenceId: paymentId,
        referenceType: 'Payment'
      });

      if (!existingLedger) {
        // We need to sync this payment
        const amount = payment.amount || 0;
        const date = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.createdAt || Date.now());
        const accountType = payment.paymentMethod === 'cash' ? 'cash' : 'bank';
        const paymentAccount = accountType === 'cash' ? cashAccount : bankAccount;
        
        const description = `Invoice Payment: #${payment.invoiceNumber} from ${payment.clientName}`;

        const entryId = new ObjectId();
        
        const debitEntry = {
          _id: new ObjectId(),
          entryId: entryId.toString(),
          accountId: paymentAccount._id.toString(),
          type: 'Debit',
          amount: amount,
          currency: 'INR',
          date: date,
          description: description,
          referenceId: paymentId,
          referenceType: 'Payment',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const creditEntry = {
          _id: new ObjectId(),
          entryId: entryId.toString(),
          accountId: receivableAccount._id.toString(),
          type: 'Credit',
          amount: amount,
          currency: 'INR',
          date: date,
          description: description,
          referenceId: paymentId,
          referenceType: 'Payment',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('ledger_entries').insertMany([debitEntry, creditEntry]);
        syncedCount++;
      }
    }

    console.log(`Successfully synced ${syncedCount} older payments into the Ledger!`);

  } catch (error) {
    console.error('Error in script:', error);
  } finally {
    await client.close();
  }
}

run();
