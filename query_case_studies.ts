import payload from 'payload';
import configPromise from './src/payload.config';

async function run() {
  await payload.init({
    config: configPromise,
  });

  const { docs } = await payload.find({
    collection: 'case-studies',
    depth: 1,
  });

  console.log(JSON.stringify(docs.map(d => d.videoSection), null, 2));
  process.exit(0);
}

run();
