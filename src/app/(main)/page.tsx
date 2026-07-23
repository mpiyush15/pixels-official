import Image from 'next/image';
import Link from 'next/link';
import BrandsMarquee from '@/components/BrandsMarquee';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export default async function Home() {
  const payload = await getPayload({ config: configPromise });
  const homeData = await payload.findGlobal({ 
    slug: 'home-page',
    depth: 2
  });

  // Safe defaults if CMS is empty
  const hero = homeData?.hero || {};
  const brands = homeData?.brands || [];
  const intro = homeData?.intro || {};
  const solutions = homeData?.solutions || {};
  const aiAutomation = homeData?.aiAutomation || {};
  const ourWork = homeData?.ourWork || {};

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-12 bg-white flex flex-col items-center">
        <FadeIn className="w-full max-w-[1400px] mx-auto mb-12 text-left">
          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-light leading-[1.1] tracking-tight text-black max-w-5xl">
            <span className="text-[#8B5CF6] font-bold">{hero.headingWord1 || 'Building'}</span>{hero.headingLine1Rest || ' Software,'}<br />
            {hero.headingLine2 || 'AI Systems &'}<br />
            {hero.headingLine3 || 'Digital Products'}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl leading-relaxed mt-6 whitespace-pre-line">
            {hero.subheading || 'Building strong, scalable, and intelligent systems for the modern era.'}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="relative w-full max-w-[1400px] mx-auto rounded-[2.5rem] overflow-hidden bg-[#0B0B0B] flex flex-col min-h-[400px] md:min-h-[600px] lg:min-h-[700px]">
          <div className="absolute inset-0 z-0 bg-[#0B0B0B]">
            <Image
              src={(hero.heroImage as any)?.url || "https://pixels-official.s3.ap-south-1.amazonaws.com/images/guhf.png"}
              alt={(hero.heroImage as any)?.alt || "Hero Background"}
              fill
              priority
              className="object-cover object-center opacity-80"
            />
          </div>
        </FadeIn>
      </section>

      {/* BRANDS MARQUEE */}
      {brands.length > 0 && (
        <FadeIn delay={0.3}>
          <BrandsMarquee brands={brands.map(b => ({ name: b.name }))} />
        </FadeIn>
      )}

      {/* INTRO SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          <FadeIn>
            <p className="text-[11px] tracking-[0.2em] text-gray-400 font-bold mb-4">{intro.eyebrow || 'WHO WE ARE'}</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-black">
              {intro.headingLine1 || 'Engineering systems for '} <span className="text-[#8B5CF6] font-bold">{intro.headingHighlight || 'Growth.'}</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2} className="flex flex-col gap-6 text-gray-600 font-light text-lg">
            {(intro.paragraphs || []).map((p, idx) => (
              <p key={idx} className="whitespace-pre-line">{p.text}</p>
            ))}
            {(!intro.paragraphs || intro.paragraphs.length === 0) && (
              <>
                <p>Pixels Digital Solutions is a software engineering team that helps ambitious companies build products, automate operations, and scale faster.</p>
                <p>We design and develop custom software, SaaS platforms, AI automation, and enterprise systems that solve real-world problems and unlock new avenues for growth.</p>
                <p>By combining engineering excellence with business understanding, we build products that are scalable, secure, and ready for the future.</p>
              </>
            )}
          </FadeIn>
        </div>
      </section>

      {/* SOLUTIONS WE BUILD */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-16 text-black">
            {solutions.headingLine1 || 'Solutions we '} <span className="text-[#8B5CF6] font-bold">{solutions.headingHighlight || 'build.'}</span>
          </h2>
        </FadeIn>
        
        <StaggerContainer className="flex flex-wrap justify-center gap-12 lg:gap-16 max-w-[1200px] mx-auto">
          {(solutions.cards || []).map((card, idx) => (
            <StaggerItem 
              key={idx}
              className={`w-[314px] p-10 rounded-[2.5rem] flex flex-col h-[434px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] shrink-0 ${
                card.theme === 'yellow' 
                  ? 'bg-[#FFD166] border border-[#FFD166]' 
                  : 'bg-[#FAFAFA] border border-gray-100/50'
              }`}
            >
              <h3 className="text-2xl font-bold mb-6 text-black pr-4 leading-tight min-h-[96px] whitespace-pre-line">
                {card.title}
              </h3>
              <p className={`font-light text-2xl leading-relaxed whitespace-pre-line ${
                card.theme === 'yellow' ? 'text-black/80' : 'text-gray-600'
              }`}>
                {card.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* AI & AUTOMATION SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4 whitespace-pre-line">
            {aiAutomation.headingLine1 || 'Artificial Intelligence &\nBusiness '} <span className="text-[#8B5CF6] font-bold">{aiAutomation.headingHighlight || 'Automation.'}</span>
          </h2>
          <p className="text-gray-500 font-light mb-16 max-w-2xl text-lg whitespace-pre-line">
            {aiAutomation.subheading || 'AI and machine learning tools that automate business workflows and processes.'}
          </p>
        </FadeIn>

        <StaggerContainer className="flex flex-wrap justify-center gap-12 lg:gap-16 max-w-[1200px] mx-auto">
          {(aiAutomation.cards || []).map((card, idx) => (
            <StaggerItem 
              key={idx}
              className={`w-[314px] p-10 md:p-12 rounded-[2.5rem] flex flex-col h-[434px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] shrink-0 ${
                card.theme === 'dark'
                  ? 'bg-[#0F172A]'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 pr-4 leading-tight min-h-[96px] whitespace-pre-line ${
                card.theme === 'dark' ? 'text-[#4ADE80]' : 'text-black'
              }`}>
                {card.title}
              </h3>
              <p className={`font-light text-2xl leading-relaxed whitespace-pre-line ${
                card.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {card.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* OUR WORK SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-16 text-black">
            {ourWork.headingLine1 || 'Our '} <span className="text-[#8B5CF6] font-bold">{ourWork.headingHighlight || 'Work.'}</span>
          </h2>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {ourWork.projects && ourWork.projects.length > 0 ? (
            ourWork.projects.map((project: any, idx) => (
              <Link href={`/portfolio/${project.slug || ''}`} key={idx}>
                <StaggerItem className="aspect-[4/3] rounded-[2rem] bg-[#F5F1EB] flex flex-col justify-end p-10 cursor-pointer hover:opacity-90 transition relative overflow-hidden group">
                  {(project.thumbnail as any)?.url && (
                    <Image 
                      src={(project.thumbnail as any).url}
                      alt={project.title || 'Case Study'}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="relative z-10 p-4 rounded-2xl bg-white/80 backdrop-blur-sm w-max">
                    <h3 className="text-2xl font-semibold text-black">{project.title}</h3>
                    <p className="text-gray-600">{project.client || 'Case Study'}</p>
                  </div>
                </StaggerItem>
              </Link>
            ))
          ) : (
            <>
              <StaggerItem className="aspect-[4/3] rounded-[2rem] bg-[#F5F1EB] flex flex-col justify-end p-10 cursor-pointer hover:opacity-90 transition">
                <h3 className="text-2xl font-semibold text-black">Atut Technology</h3>
                <p className="text-gray-600">Case Study</p>
              </StaggerItem>
              <StaggerItem className="aspect-[4/3] rounded-[2rem] bg-[#F5F1EB] flex flex-col justify-end p-10 cursor-pointer hover:opacity-90 transition">
                <h3 className="text-2xl font-semibold text-black">Vaibhav Biotech</h3>
                <p className="text-gray-600">Case Study</p>
              </StaggerItem>
            </>
          )}
        </StaggerContainer>
      </section>
    </div>
  );
}
