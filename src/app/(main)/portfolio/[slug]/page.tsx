import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function SingleCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise })
  
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: {
      slug: {
        equals: slug,
      }
    },
    depth: 1, 
  })

  const caseStudy = docs[0];

  if (!caseStudy) {
    notFound();
  }

  const thumbnailUrl = caseStudy.thumbnail && typeof caseStudy.thumbnail === 'object' && caseStudy.thumbnail.url 
    ? caseStudy.thumbnail.url 
    : '/placeholder.jpg';
    
  const altText = caseStudy.thumbnail && typeof caseStudy.thumbnail === 'object' && caseStudy.thumbnail.alt 
    ? caseStudy.thumbnail.alt 
    : caseStudy.title;

  // Split hero title to colorize the last two words
  const titleText = caseStudy.heroTitle || caseStudy.title || '';
  const words = titleText.split(' ');
  const lastTwoWords = words.length > 2 ? words.splice(-2).join(' ') : (words.length > 1 ? words.pop() : '');
  const firstPart = words.join(' ');

  // Extract raw text from rich text if possible for Brief/Challenge
  // This is a naive extraction for demo purposes since we don't have Lexical renderer setup here.
  const extractText = (richTextData: any, fallback: string) => {
    if (!richTextData) return fallback;
    try {
      if (richTextData.root && richTextData.root.children) {
        return richTextData.root.children.map((node: any) => {
          if (node.children) return node.children.map((c: any) => c.text).join(' ');
          return '';
        }).join('\n\n');
      }
    } catch (e) {}
    return fallback;
  };

  const briefText = extractText(caseStudy.brief, "Create a cost-effective launch campaign to build awareness of the product. The goal: highlight its benefits, connect with busy teams, and drive demo inquiries.");
  const challengeText = extractText(caseStudy.challenge, "The target audience were time-poor and under-resourced. Many were reluctant to try new tech or didn't realise how much more efficient their workday could be.\n\nThe challenge was clear: create a launch campaign that spoke their language, showed empathy for their daily pressures, and introduced a practical, approachable solution. All within a modest production budget.");
  const solutionText = extractText(caseStudy.solution, "We delivered a bold, personable and scalable launch campaign that cut through the typical corporate legal jargon.\n\nBy leaning into the genuine frustrations of in-house teams, we created something highly relatable, positioning Cubed as the ultimate stress-reliever.");

  const renderGallery = (galleryData: any[]) => {
    if (galleryData && Array.isArray(galleryData) && galleryData.length > 0) {
      return (
        <div className="w-full rounded-[32px] md:rounded-[48px] bg-[#F5F5F7] p-8 md:p-12 flex items-center justify-center min-h-[250px] mb-20 md:mb-32">
           <div className={`grid grid-cols-1 ${galleryData.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl' : 'max-w-3xl'} gap-8 w-full mx-auto`}>
              {galleryData.map((item: any, idx: number) => {
                const imgUrl = item.image?.url || '/placeholder.jpg';
                const imgAlt = item.image?.alt || 'Gallery image';
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden aspect-[4/3] relative">
                    <Image src={imgUrl} alt={imgAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                );
              })}
           </div>
        </div>
      );
    }
    return (
      <div className="w-full rounded-[32px] md:rounded-[48px] bg-[#F5F5F7] p-8 md:p-12 flex items-center justify-center min-h-[250px] mb-20 md:mb-32">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {/* Dummy cards representing social posts or UI */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden aspect-[4/3] flex flex-col relative">
                <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-2 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 relative p-4">
                   <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                   <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                   <div className="h-3 w-5/6 bg-gray-200 rounded mb-2"></div>
                </div>
              </div>
            ))}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#B270FF] selection:text-white pb-32 pt-28 md:pt-36">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wider uppercase mb-10">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/portfolio" className="hover:text-purple-600 transition-colors">Portfolio</Link>
            <span>/</span>
            <span className="text-purple-600 truncate">{caseStudy.title}</span>
          </div>

          <h1 className="text-[50px] md:text-[80px] font-medium leading-[1.1] text-[#242038] tracking-tight mb-20 max-w-5xl">
            {firstPart} {lastTwoWords && <span className="text-[#B270FF]">{lastTwoWords}</span>}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 text-[15px]">
            <div className="flex gap-8 md:gap-16">
              <div className="flex flex-col gap-2 font-bold text-[#242038]">
                <span>Client:</span>
                <span>Project:</span>
              </div>
              <div className="flex flex-col gap-2 text-gray-600">
                <span>{caseStudy.client}</span>
                <span>{caseStudy.title}</span>
              </div>
            </div>
            
            <div className="text-gray-600 leading-relaxed max-w-2xl">
              {caseStudy.services && Array.isArray(caseStudy.services) && caseStudy.services.length > 0 
                ? caseStudy.services.map((s: any) => s.service).join(', ')
                : 'Branding, Art Direction & Design, Copywriting, Campaign Development'
              }
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[4/3] md:aspect-[2.5/1] rounded-[32px] md:rounded-[48px] overflow-hidden mb-32 relative bg-[#F8F8F8]">
          <Image
            src={thumbnailUrl}
            alt={altText as string}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* The Brief */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16 mb-32 md:mb-40 w-full">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium text-[#242038]">
              <span className="text-[#B270FF]">The</span> Brief
            </h2>
          </div>
          <div className="text-lg md:text-xl text-gray-600 leading-[1.7] w-full flex flex-col gap-6">
            {briefText.split('\n\n').map((paragraph: string, idx: number) => (
               <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Video Section */}
        {((caseStudy.videoSection?.showVideo !== false) || caseStudy.videoSection?.videoUrl || caseStudy.videoSection?.videoMedia) && (
          <div className="mb-32 md:mb-40 rounded-[32px] md:rounded-[48px] overflow-hidden relative aspect-video bg-[#F8F8F8] group cursor-pointer">
             <video
                controls
                preload="metadata"
                className="w-full h-full object-cover"
                poster={
                  typeof caseStudy.videoSection?.posterImage === 'object' && caseStudy.videoSection?.posterImage?.url
                    ? caseStudy.videoSection.posterImage.url
                    : thumbnailUrl
                }
              >
                <source 
                  src={
                    (typeof caseStudy.videoSection?.videoMedia === 'object' && caseStudy.videoSection?.videoMedia?.url)
                      ? caseStudy.videoSection.videoMedia.url
                      : (caseStudy.videoSection?.videoUrl as string || 'https://www.w3schools.com/html/mov_bbb.mp4')
                  } 
                  type="video/mp4" 
                />
              </video>
          </div>
        )}

        {/* The Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 mb-20 md:mb-24">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium text-[#242038]">
              <span className="text-[#B270FF]">The</span> Challenge
            </h2>
          </div>
          <div className="text-lg md:text-xl text-gray-600 leading-[1.7] w-full flex flex-col gap-6">
             {challengeText.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
             ))}
          </div>
        </div>

        {/* Challenge Gallery Section from CMS */}
        {renderGallery(caseStudy.gallery || [])}

        {/* The Solution */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 mb-20 md:mb-24">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium text-[#242038]">
              <span className="text-[#B270FF]">The</span> Solution
            </h2>
          </div>
          <div className="text-lg md:text-xl text-gray-600 leading-[1.7] w-full flex flex-col gap-6">
             {solutionText.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
             ))}
          </div>
        </div>
        
        {/* Solution Gallery Section from CMS */}
        {renderGallery(caseStudy.solutionGallery || [])}

      </div>
    </div>
  )
}
