import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('pixelsdigital');
    const colls = await db.listCollections().toArray();
    console.log('All Collections:', colls.map(c => c.name));
    
    const replyColl = colls.find(c => c.name.toLowerCase().includes('rplysys-new') || c.name.toLowerCase().includes('reply'));
    if (replyColl) {
      console.log('Found:', replyColl.name);
      const sample = await db.collection(replyColl.name).findOne({});
      console.log(JSON.stringify(sample, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
