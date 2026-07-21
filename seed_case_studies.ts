
import payload from 'payload';
import configPromise from './src/payload.config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const download = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        resolve();
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function run() {
  await payload.init({ config: configPromise });

  const studies = [
    {
      title: 'Neon Brand Refresh',
      slug: 'neon-brand-refresh',
      client: 'Neon',
      category: 'Branding',
      heroTitle: 'Electrifying a modern brand identity.',
      services: [{ service: 'Branding' }, { service: 'Strategy' }],
      imageUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80',
    },
    {
      title: 'Aura Web Platform',
      slug: 'aura-web-platform',
      client: 'Aura',
      category: 'Web Development',
      heroTitle: 'A seamless digital experience for wellness.',
      services: [{ service: 'Web Development' }, { service: 'UI/UX' }],
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    },
    {
      title: 'Nova Marketing Campaign',
      slug: 'nova-marketing-campaign',
      client: 'Nova',
      category: 'Marketing',
      heroTitle: 'Reaching new heights with data-driven campaigns.',
      services: [{ service: 'Marketing' }, { service: 'Analytics' }],
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    }
  ];

  for (const study of studies) {
    const imgPath = path.join(__dirname, `${study.slug}.jpg`);
    console.log(`Downloading image for ${study.title}...`);
    await download(study.imageUrl, imgPath);

    console.log(`Uploading media for ${study.title}...`);
    const media = await payload.create({
      collection: 'media',
      data: { alt: study.title },
      filePath: imgPath,
    });

    console.log(`Creating case study ${study.title}...`);
    await payload.create({
      collection: 'case-studies',
      data: {
        title: study.title,
        slug: study.slug,
        client: study.client,
        category: study.category,
        heroTitle: study.heroTitle,
        services: study.services,
        thumbnail: media.id,
      }
    });

    fs.unlinkSync(imgPath);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

run();
