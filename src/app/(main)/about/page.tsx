import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import Image from 'next/image'
import { notFound } from 'next/navigation'

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

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })
  const aboutData = await payload.findGlobal({
    slug: 'about-page',
    depth: 1,
  })

  if (!aboutData) {
    notFound();
  }

  const approachText = extractText(aboutData.approachText, "It means we believe in building relationships that are measured in years and not projects. It means we believe that the most effective work is based on a deep understanding of our clients' challenges & priorities. And it means that we deliver that work on-time, on-budget and with an absolute focus on our clients' bottom line.\n\nWe pride ourselves on being agile, deeply collaborative, and fully committed to engineering excellence.");

  return (
    <div className="min-h-screen bg-white selection:bg-[#B270FF] selection:text-white pt-40 md:pt-48 pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Hero Section */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-7xl lg:text-[90px] font-medium text-[#242038] leading-[1.1] tracking-tight max-w-4xl">
            {aboutData.heroHeadline1 || "Our mission is to be the world's most"} <span className="text-[#B270FF]">{aboutData.heroHighlight || "innovative"}</span> {aboutData.heroHeadline2 || "digital agency."}
          </h1>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] md:aspect-[2.5/1] rounded-[32px] md:rounded-[48px] overflow-hidden relative mb-32 md:mb-48">
          <Image 
            src={(aboutData.heroImage as any)?.url || "/placeholder.jpg"}
            alt={(aboutData.heroImage as any)?.alt || "Team working together"}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Our Approach */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 mb-32 md:mb-48">
          <div>
            <div className="uppercase tracking-wider text-sm font-bold text-gray-800 mb-8">
              OUR APPROACH
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#242038] leading-[1.2]">
              {aboutData.approachTitle1 || "What"} <span className="text-[#B270FF]">{aboutData.approachHighlight || "innovative"}</span> {aboutData.approachTitle2 || "means."}
            </h2>
          </div>
          <div className="text-lg md:text-xl text-gray-700 leading-[1.8] w-full max-w-3xl flex flex-col gap-6">
             {approachText.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
             ))}
          </div>
        </div>

        {/* What makes us different */}
        <div className="mb-32 md:mb-48">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#242038] mb-12">
            {aboutData.differentTitle1 || "What makes us"} <span className="text-[#B270FF]">{aboutData.differentHighlight || "different."}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.differentCards && aboutData.differentCards.length > 0 ? aboutData.differentCards.map((card: any, idx: number) => {
              const desc = extractText(card.description);
              const bg = card.color || '#d8b4fe';
              const iconUrl = card.icon?.url || null;
              return (
                <div key={idx} style={{ backgroundColor: bg }} className="rounded-[32px] p-8 md:p-10 flex flex-col">
                  {iconUrl ? (
                    <div className="w-12 h-12 mb-8 relative">
                      <Image src={iconUrl} alt={card.title} fill className="object-contain" />
                    </div>
                  ) : (
                     <div className="w-12 h-12 mb-8">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-800">
                           <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                     </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-medium text-[#242038] mb-6">
                    {card.title}
                  </h3>
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    {desc}
                  </p>
                </div>
              );
            }) : (
               /* Fallbacks if no data */
               <>
                  <div style={{ backgroundColor: '#d8b4fe' }} className="rounded-[32px] p-8 md:p-10 flex flex-col">
                     <div className="w-12 h-12 mb-8">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-800">
                           <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                     </div>
                     <h3 className="text-2xl md:text-3xl font-medium text-[#242038] mb-6">
                        Technical Excellence
                     </h3>
                     <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                        We don't just build apps; we engineer robust, scalable systems leveraging cutting-edge web technologies and seamless CMS integrations.
                     </p>
                  </div>
               </>
            )}
          </div>
        </div>

        {/* How we deliver */}
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#242038] mb-12">
            {aboutData.deliverTitle1 || "How we"} <span className="text-[#B270FF]">{aboutData.deliverHighlight || "deliver."}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {aboutData.deliverCards && aboutData.deliverCards.length > 0 ? aboutData.deliverCards.map((card: any, idx: number) => {
              const desc = extractText(card.description);
              const bg = card.color || '#d8b4fe';
              const iconUrl = card.icon?.url || null;
              return (
                <div key={idx} style={{ backgroundColor: bg }} className="rounded-[32px] p-8 md:p-10 flex flex-col">
                  {iconUrl ? (
                    <div className="w-12 h-12 mb-8 relative">
                      <Image src={iconUrl} alt={card.title} fill className="object-contain" />
                    </div>
                  ) : (
                     <div className="w-12 h-12 mb-8">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-800">
                           <circle cx="12" cy="12" r="10" />
                           <path d="M12 8v8M8 12h8" />
                        </svg>
                     </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-medium text-[#242038] mb-6">
                    {card.title}
                  </h3>
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                    {desc}
                  </p>
                </div>
              );
            }) : (
               /* Fallback */
               <div style={{ backgroundColor: '#6ee7b7' }} className="rounded-[32px] p-8 md:p-10 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-medium text-[#242038] mb-6">Agile Delivery</h3>
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base">Constant iterations, direct feedback loops, and rapid prototyping ensure what we build is exactly what you need.</p>
               </div>
            )}
          </div>

          {/* Deliver Wide Card */}
          {aboutData.deliverWideCard && (
            <div 
              style={{ backgroundColor: aboutData.deliverWideCard.color || '#f9a8d4' }}
              className="w-full rounded-[32px] p-8 md:p-16 mt-6 flex flex-col md:flex-row items-start md:items-center gap-12"
            >
              <div className="flex flex-col gap-6 w-full max-w-lg">
                 {typeof aboutData.deliverWideCard.icon === 'object' && aboutData.deliverWideCard.icon?.url ? (
                    <div className="w-12 h-12 relative mb-2">
                       <Image src={aboutData.deliverWideCard.icon.url} alt="Wide Card Icon" fill className="object-contain" />
                    </div>
                 ) : (
                    <div className="w-12 h-12 mb-2">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-800">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                       </svg>
                    </div>
                 )}
                 <h3 className="text-4xl md:text-5xl font-medium text-[#242038]">
                    {aboutData.deliverWideCard.title}
                 </h3>
              </div>
              <div className="text-gray-800 text-lg md:text-xl leading-relaxed flex-1">
                 {extractText(aboutData.deliverWideCard.description)}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
