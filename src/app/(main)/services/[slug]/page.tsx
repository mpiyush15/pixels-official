import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { notFound } from 'next/navigation';
import ServiceDetailsClient from './ServiceDetailsClient';

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: 'services',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
  });

  if (!docs || docs.length === 0) {
    notFound();
  }

  const service = docs[0];

  return <ServiceDetailsClient service={service} />;
}
