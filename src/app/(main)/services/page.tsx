import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import ServicesClient from './ServicesClient';
import { notFound } from 'next/navigation';

export default async function ServicesPageServer() {
  const payload = await getPayload({ config: configPromise });
  
  // Fetch the Global Services Page Config (Hero & Categories)
  const servicesPage = await payload.findGlobal({
    slug: 'services-page',
    depth: 2,
  }) || {};

  // Fetch all Services (Details, Tech Stack, Projects)
  const servicesData = await payload.find({
    collection: 'services',
    depth: 2,
    sort: 'createdAt',
  });

  return (
    <ServicesClient 
      servicesPage={servicesPage} 
      services={servicesData.docs} 
    />
  );
}
