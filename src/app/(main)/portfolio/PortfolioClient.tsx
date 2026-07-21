'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePageTracking } from '@/lib/analytics';
import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioClient({ caseStudies }: { caseStudies: any[] }) {
  usePageTracking();
  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 mt-12"
        >
          <h1 className="text-6xl md:text-[100px] font-bold text-[#242038] mb-6 tracking-tight leading-[0.9]">
            Our Work.
          </h1>
          <p className="text-xl md:text-3xl text-gray-500 max-w-3xl font-light">
            Showcasing our innovative digital solutions and success stories.
          </p>
        </motion.div>

        {/* Dynamic Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
          {caseStudies.length > 0 ? (
            caseStudies.map((caseStudy, index) => {
              const thumbnailUrl = caseStudy.thumbnail?.url || '/placeholder.jpg';
              const altText = caseStudy.thumbnail?.alt || caseStudy.title;
              return (
                <motion.div
                  key={caseStudy.id || index}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                  className="group block"
                >
                  <Link href={`/portfolio/${caseStudy.slug}`} className="block h-full">
                    <div className="relative aspect-[3/2] rounded-[24px] overflow-hidden bg-[#e0dbea] mb-6">
                      <Image 
                        src={thumbnailUrl} 
                        alt={altText}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    
                    <div className="px-2 flex flex-col items-start">
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
                        {caseStudy.client || 'Client'}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-medium text-[#242038] tracking-tight group-hover:opacity-70 transition-opacity duration-300">
                        {caseStudy.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              )
            })
          ) : (
            <div className="col-span-full py-32 text-center">
              <h3 className="text-2xl text-gray-400 font-light">No projects found. Check back later!</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
