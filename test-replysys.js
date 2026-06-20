const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('pixelsdigital');
  const collections = await db.listCollections().toArray();
  const target = collections.find(c => c.name.includes('reply'));
  if (target) {
    const sample = await db.collection(target.name).findOne({});
    console.log(target.name, sample);
  }
  process.exit(0);
}
run();
