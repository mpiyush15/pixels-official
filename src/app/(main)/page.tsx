import {
  ArrowRight, ArrowUpRight, Box, BrainCircuit, Monitor, ShoppingCart,
  Search, PenTool, Code, Rocket, Heart, GraduationCap, Factory, Store,
  Briefcase, Globe, Github, Twitter, Linkedin, Instagram
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// Map icon names to Lucide components
const IconMap: Record<string, React.ElementType> = {
  ArrowRight, ArrowUpRight, Box, BrainCircuit, Monitor, ShoppingCart,
  Search, PenTool, Code, Rocket, Heart, GraduationCap, Factory, Store,
  Briefcase, Globe, Github, Twitter, Linkedin, Instagram
};

import HeroHeading from '@/components/HeroHeading';
import BrandsMarquee from '@/components/BrandsMarquee';


export default async function Home() {
  const payload = await getPayload({ config: configPromise });
  const homeData = await payload.findGlobal({
    slug: 'home-page',
    depth: 2,
  }) || {};

  const { hero = {} as any, whatWeDo = {} as any, howWeWork = {} as any, featuredWork = {} as any, capabilities = {} as any, cta = {} as any } = homeData as any;

  return (
    <div className="min-h-screen bg-white text-black font-sans">

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-12 bg-white text-black flex flex-col items-center">
        
        {/* Text above the image card */}
        <div className="w-full max-w-[1400px] mx-auto mb-12 text-left">
          <HeroHeading 
            headingLine1={hero.headingLine1}
            animatedLines={hero.animatedLines}
          />

          <p className="text-xl md:text-2xl text-gray-500 font-light max-w-3xl leading-relaxed whitespace-pre-line mt-4">
            {hero.subheading}
          </p>
        </div>

        {/* The Image as a center wider card */}
        <div className="relative w-full max-w-[1400px] mx-auto rounded-[2.5rem] overflow-hidden bg-[#0B0B0B] text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] flex flex-col min-h-[500px] md:min-h-[600px] p-8 md:p-12 lg:p-16 border border-gray-100">
          
          {/* Background Image for the card */}
          <div className="absolute inset-0 z-0 bg-[#0B0B0B]">
            <img
              src={hero.heroImage?.url || (typeof hero.heroImage === 'string' ? hero.heroImage : null) || "https://pixels-official.s3.ap-south-1.amazonaws.com/images/guhf.png"}
              alt={hero.heroImage?.alt || "Hero Background"}
              className="w-full h-full object-cover object-center opacity-80"
            />
          </div>

          {/* Card Content (Bottom Bar) */}
          <div className="relative z-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-end mt-auto gap-8">
            
            {/* Left side: CTAs */}
            {hero.ctaButtons && hero.ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {hero.ctaButtons.map((btn: any, idx: number) => (
                  <Link key={idx} href={btn.url || '#'}>
                    <button className={`px-8 py-3.5 font-medium rounded-full transition-colors duration-300 ${
                      btn.style === 'primary' 
                        ? 'bg-[#B388FF] text-white hover:bg-[#9d6cf2]' 
                        : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black'
                    }`}>
                      {btn.label}
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Right side: Stats */}
            <div className="flex items-center gap-8 md:gap-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 px-10 ml-auto md:ml-0 w-full md:w-auto overflow-x-auto">
              {hero.stats?.map((stat: any, idx: number) => (
                <div key={idx} className="text-center min-w-[100px]">
                  <div className="text-4xl font-light mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-300 font-medium whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      <BrandsMarquee brands={hero.brands} />

      {/* WHAT WE DO SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">WHAT WE DO</p>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight max-w-2xl leading-tight text-gray-900 whitespace-pre-line">
            {whatWeDo.heading}
          </h2>
          <p className="text-gray-500 text-lg max-w-md font-light leading-relaxed whitespace-pre-line">
            {whatWeDo.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whatWeDo.cards?.map((item: any, i: number) => {
            const IconComponent = item.iconName ? IconMap[item.iconName as string] : null;
            return (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col hover:-translate-y-1 transition duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-10">
                  {IconComponent && <IconComponent className={`w-6 h-6 text-[#${i === 0 ? '8B5CF6' : i === 1 ? '10B981' : i === 2 ? '6366F1' : 'F59E0B'}]`} />}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed mb-8 flex-1 whitespace-pre-line">{item.description}</p>
                <ArrowRight className="w-5 h-5 text-[#8B5CF6] mt-auto self-end" />
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW WE WORK SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl overflow-hidden flex items-center justify-center">
            <img
              src="https://pixels-official.s3.ap-south-1.amazonaws.com/images/uhgfu.png"
              alt="How we work"
              className="w-full h-auto object-contain rounded-3xl"
            />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">HOW WE WORK</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-12 text-gray-900 leading-tight whitespace-pre-line">
              {howWeWork.heading}
            </h2>

            <div className="space-y-8">
              {howWeWork.steps?.map((item: any, i: number) => {
                const IconComponent = item.iconName ? IconMap[item.iconName as string] : null;
                return (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400">{item.stepNumber}</span>
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-500 font-light text-sm whitespace-pre-line">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">FEATURED WORK</p>

        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 leading-tight whitespace-pre-line">
            {featuredWork.heading}
          </h2>
          <Link href="/portfolio" className="hidden md:flex items-center gap-2 text-sm border border-gray-200 rounded-full px-5 py-2 hover:bg-gray-50 transition">
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredWork.projects?.map((work: any, i: number) => {
            const imageUrl = typeof work.thumbnail === 'string' ? work.thumbnail : work.thumbnail?.url;
            return (
              <Link href={`/portfolio/${work.slug || ''}`} key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer hover:shadow-lg transition">
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <img src={imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'} alt={work.title as string} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#6B46C1] font-semibold mb-2">{work.client || 'Client'}</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{work.title}</h3>
                  <p className="text-gray-500 font-light text-sm mb-6 flex-1 whitespace-pre-line">{work.category || work.heroTitle || 'Custom Software Project'}</p>
                  <div className="flex items-center gap-2 text-[#10B981] text-sm font-medium mt-auto">
                    View Case Study <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* WHAT WE BUILD / CAPABILITIES */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <div className="max-w-3xl mb-16">
          <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">OUR CAPABILITIES</p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-gray-900 leading-tight whitespace-pre-line">
            {capabilities.heading}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line">
            {capabilities.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.items?.map((item: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition duration-300 cursor-pointer">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-xl font-medium text-gray-900">{item.title}</h3>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${item.badgeColor || 'bg-gray-100 text-gray-700'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-500 font-light text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA SECTION */}
      <section className="px-6 lg:px-16 xl:px-24 pb-24">
        <div className="bg-[#1C1236] rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4C1D95] rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight whitespace-pre-line">
              {cta.heading}
            </h2>
            <p className="text-gray-300 font-light text-lg whitespace-pre-line">
              {cta.subheading}
            </p>
          </div>

          <div className="relative z-10 shrink-0 text-center md:text-right">
            <button className="bg-[#B4F074] hover:bg-[#A3E062] text-black px-8 py-4 rounded-xl font-medium text-lg flex items-center gap-2 mb-6 transition">
              Book a Discovery Call
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-400 font-light">
              Or write to us at: <a href="mailto:hello@pixelsdigitalsolutions.com" className="text-[#B4F074] underline">hello@pixelsdigitalsolutions.com</a>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
