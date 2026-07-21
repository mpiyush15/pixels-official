'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Helper to extract rich text
function extractText(richTextData: any, fallback = ""): string {
  if (!richTextData || !richTextData.root || !richTextData.root.children) {
    return fallback;
  }

  let text = '';
  const traverse = (node: any) => {
    if (node.type === 'text') {
      text += node.text;
    } else if (node.type === 'linebreak') {
      text += '\n';
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
    if (node.type === 'paragraph' || node.type === 'heading') {
      text += '\n\n';
    }
  };

  richTextData.root.children.forEach(traverse);
  return text.trim() || fallback;
}

export default function TestHomeClient({ homeData }: { homeData: any }) {
  const [adjectiveIndex, setAdjectiveIndex] = useState(0);
  const [nounIndex, setNounIndex] = useState(0);

  const adjectives = homeData.heroRotatingAdjectives?.map((a: any) => a.word) || ['Intelligent Solutions'];
  const nouns = homeData.heroRotatingNouns?.map((n: any) => n.word) || ['Brands.'];

  useEffect(() => {
    const interval = setInterval(() => {
      setAdjectiveIndex((prev) => (prev + 1) % adjectives.length);
      setNounIndex((prev) => (prev + 1) % nouns.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [adjectives.length, nouns.length]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] selection:bg-[#B270FF] selection:text-white pt-40 md:pt-48 pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Hero Section */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-7xl lg:text-[110px] font-medium text-[#242038] leading-[1.05] tracking-tight max-w-6xl">
            <div>{homeData.heroPrefix || 'Creating'}</div>
            <div className="text-[#B270FF] h-[1.1em] overflow-hidden relative">
              <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${adjectiveIndex * 100}%)` }}>
                {adjectives.map((word: string, i: number) => (
                  <div key={i} className="h-full">{word}</div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 md:gap-x-8">
              <span>{homeData.heroSuffix || 'for'}</span>
              <div className="h-[1.1em] overflow-hidden relative inline-block align-bottom">
                <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${nounIndex * 100}%)` }}>
                  {nouns.map((word: string, i: number) => (
                    <div key={i} className="h-full">{word}</div>
                  ))}
                </div>
              </div>
            </div>
          </h1>
        </div>

        {/* Hero Video/Image */}
        <div className="w-full aspect-[16/9] md:aspect-[2.5/1] rounded-[32px] md:rounded-[48px] overflow-hidden relative mb-32 md:mb-48 bg-gray-200">
          {homeData.heroVideo?.url ? (
             <video 
               src={homeData.heroVideo.url}
               autoPlay
               muted
               loop
               playsInline
               className="w-full h-full object-cover"
             />
          ) : (
             <Image 
               src="/placeholder.jpg" 
               alt="Hero Placeholder"
               fill
               className="object-cover"
               priority
             />
          )}
        </div>

        {/* What we do */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 mb-32 md:mb-48">
          <div>
            <div className="uppercase tracking-wider text-sm font-bold text-gray-800 mb-8">
              {homeData.introLabel || 'What we do'}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#242038] leading-[1.2]">
              {homeData.introTitle || 'Experts in growth.'}
            </h2>
          </div>
          <div className="text-lg md:text-xl text-gray-700 leading-[1.8] w-full max-w-3xl flex flex-col gap-6">
             {extractText(homeData.introDescription, "Our business is the business of creating solutions that help clients grow theirs. Our unique offering allows businesses to affect positive change & successfully navigate digital environments with minimal risk, greater visibility and lower cost than ever before.").split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
             ))}
          </div>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32 md:mb-48">
          {homeData.servicesCards && homeData.servicesCards.length > 0 ? homeData.servicesCards.map((card: any, idx: number) => {
            const desc = extractText(card.description, "Description placeholder");
            const bg = card.backgroundColor || '#F2E8FF';
            const iconUrl = card.icon?.url || null;
            return (
              <Link href={card.link || '#'} key={idx} className="group">
                <div style={{ backgroundColor: bg }} className="rounded-[32px] md:rounded-[48px] p-8 md:p-16 h-full flex flex-col transition-transform duration-500 ease-in-out group-hover:scale-[0.98]">
                  <div className="w-16 h-16 mb-12 relative">
                    {iconUrl ? (
                      <Image src={iconUrl} alt={card.title} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full bg-[#242038] rounded-full opacity-20"></div>
                    )}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-medium text-[#242038] mb-6">
                    {card.title}
                  </h3>
                  <p className="text-gray-800 leading-relaxed text-lg mb-12 flex-1">
                    {desc}
                  </p>
                  <div className="flex items-center text-[#242038] font-semibold">
                    Learn more
                    <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          }) : (
             /* Fallbacks */
             <>
                <Link href="/services" className="group">
                  <div style={{ backgroundColor: '#F2E8FF' }} className="rounded-[32px] md:rounded-[48px] p-8 md:p-16 h-full flex flex-col transition-transform duration-500 ease-in-out group-hover:scale-[0.98]">
                    <div className="w-16 h-16 mb-12 bg-[#242038] rounded-full opacity-20"></div>
                    <h3 className="text-3xl md:text-4xl font-medium text-[#242038] mb-6">Creative & Brand</h3>
                    <p className="text-gray-800 leading-relaxed text-lg mb-12 flex-1">From logo design and tone-of-voice (TOV) guidelines to compelling content strategies; we specialise in crafting creative solutions that capture attention and resonates with target audiences.</p>
                    <div className="flex items-center text-[#242038] font-semibold">
                      Learn more
                      <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
                <Link href="/services" className="group">
                  <div style={{ backgroundColor: '#FFE3EE' }} className="rounded-[32px] md:rounded-[48px] p-8 md:p-16 h-full flex flex-col transition-transform duration-500 ease-in-out group-hover:scale-[0.98]">
                    <div className="w-16 h-16 mb-12 bg-[#242038] rounded-full opacity-20"></div>
                    <h3 className="text-3xl md:text-4xl font-medium text-[#242038] mb-6">Development & Technology</h3>
                    <p className="text-gray-800 leading-relaxed text-lg mb-12 flex-1">From custom applications to seamless integrations, our development & technology services are designed to solve complex challenges and create exceptional user experiences.</p>
                    <div className="flex items-center text-[#242038] font-semibold">
                      Learn more
                      <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
             </>
          )}
        </div>

        {/* Logos Carousel (Simple version for demo) */}
        <div className="bg-white rounded-[32px] md:rounded-[48px] p-8 md:p-16 overflow-hidden">
           <h2 className="text-2xl md:text-3xl font-medium text-[#242038] mb-12 text-center">
             {homeData.logosTitle || "Trusted by industry leaders nationwide."}
           </h2>
           {/* Very basic marquee animation */}
           <div className="flex space-x-12 animate-[marquee_20s_linear_infinite] opacity-50">
             {homeData.logos && homeData.logos.length > 0 ? homeData.logos.map((logo: any, idx: number) => (
                <div key={idx} className="w-32 h-16 relative flex-shrink-0">
                   <Image src={logo.image?.url || "/placeholder.jpg"} alt="Logo" fill className="object-contain" />
                </div>
             )) : (
                /* Fallback text logos if no images */
                Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="text-2xl font-bold text-gray-400 whitespace-nowrap flex-shrink-0 uppercase tracking-widest">
                      COMPANY LOGO
                   </div>
                ))
             )}
           </div>
        </div>

      </div>
    </div>
  )
}
