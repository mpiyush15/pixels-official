import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from 'lucide-react'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 1,
  })

  const caseStudy = docs[0]
  if (!caseStudy) {
    return {
      title: 'Case Study Not Found | Pixels Digital',
      description: 'The requested case study could not be found.',
    }
  }

  const thumbnailUrl =
    caseStudy.thumbnail && typeof caseStudy.thumbnail === 'object' && caseStudy.thumbnail.url
      ? caseStudy.thumbnail.url
      : 'https://pixels-official.s3.ap-south-1.amazonaws.com/images/guhf.png'

  const title = `${caseStudy.title} | Case Study | Pixels Digital`
  const description =
    caseStudy.heroTitle ||
    `Explore how Pixels Digital designed and built ${caseStudy.title} for ${caseStudy.client}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: caseStudy.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [thumbnailUrl],
    },
  }
}

/**
 * Robust Lexical Rich Text Node Renderer
 * Recursively renders Lexical AST nodes including paragraphs, lists, list items,
 * headings, links, and formatted inline text (bold, italic, code, underline).
 */
function renderLexicalNode(node: any, index: number): React.ReactNode {
  if (!node) return null

  // 1. Plain text node with formatting bitmasks
  if (node.type === 'text') {
    let content: React.ReactNode = node.text || ''
    const format = node.format || 0

    // Lexical format bitmask flags:
    // 1: bold, 2: italic, 4: strikethrough, 8: underline, 16: code, 32: sub, 64: sup
    if (format & 1) content = <strong>{content}</strong>
    if (format & 2) content = <em>{content}</em>
    if (format & 8) content = <u>{content}</u>
    if (format & 4) content = <del>{content}</del>
    if (format & 16) content = <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs sm:text-sm font-mono text-purple-700">{content}</code>

    return <span key={index}>{content}</span>
  }

  const children = node.children && Array.isArray(node.children)
    ? node.children.map((child: any, i: number) => renderLexicalNode(child, i))
    : null

  // 2. Paragraph
  if (node.type === 'paragraph') {
    return (
      <p key={index} className="leading-relaxed sm:leading-[1.7] mb-4 last:mb-0">
        {children}
      </p>
    )
  }

  // 3. Lists
  if (node.type === 'list') {
    const isOrdered = node.listType === 'number' || node.tag === 'ol'
    if (isOrdered) {
      return (
        <ol key={index} className="list-decimal pl-5 sm:pl-6 space-y-2 mb-4">
          {children}
        </ol>
      )
    }
    return (
      <ul key={index} className="list-disc pl-5 sm:pl-6 space-y-2 mb-4">
        {children}
      </ul>
    )
  }

  // 4. List items
  if (node.type === 'listitem') {
    return (
      <li key={index} className="leading-relaxed pl-1">
        {children}
      </li>
    )
  }

  // 5. Headings
  if (node.type === 'heading') {
    const level = String(node.tag || 'h3').toLowerCase()
    if (level === 'h1') {
      return (
        <h1 key={index} className="font-semibold text-[#242038] mt-6 mb-3 text-xl sm:text-2xl">
          {children}
        </h1>
      )
    }
    if (level === 'h2') {
      return (
        <h2 key={index} className="font-semibold text-[#242038] mt-5 mb-2.5 text-lg sm:text-xl">
          {children}
        </h2>
      )
    }
    return (
      <h3 key={index} className="font-semibold text-[#242038] mt-4 mb-2 text-base sm:text-lg">
        {children}
      </h3>
    )
  }

  // 6. Links
  if (node.type === 'link') {
    const url = node.fields?.url || node.url || '#'
    const newTab = node.fields?.newTab ?? false
    return (
      <a
        key={index}
        href={url}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        className="text-[#8B5CF6] underline underline-offset-2 hover:text-[#7C3AED] transition-colors"
      >
        {children}
      </a>
    )
  }

  // 7. Quotes
  if (node.type === 'quote') {
    return (
      <blockquote key={index} className="border-l-4 border-[#B270FF] pl-4 italic my-4 text-gray-700">
        {children}
      </blockquote>
    )
  }

  // Default fallback for any container node
  return <div key={index}>{children}</div>
}

function RichTextContent({
  data,
  fallback,
}: {
  data: any
  fallback: string
}) {
  if (!data) {
    return (
      <>
        {fallback.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed sm:leading-[1.7]">
            {paragraph}
          </p>
        ))}
      </>
    )
  }

  if (typeof data === 'string') {
    return (
      <>
        {data.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed sm:leading-[1.7]">
            {paragraph}
          </p>
        ))}
      </>
    )
  }

  if (data?.root?.children && Array.isArray(data.root.children) && data.root.children.length > 0) {
    return (
      <div className="w-full space-y-3 sm:space-y-4">
        {data.root.children.map((child: any, idx: number) => renderLexicalNode(child, idx))}
      </div>
    )
  }

  return (
    <>
      {fallback.split('\n\n').map((paragraph, idx) => (
        <p key={idx} className="leading-relaxed sm:leading-[1.7]">
          {paragraph}
        </p>
      ))}
    </>
  )
}

export default async function SingleCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'case-studies',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 1,
  })

  const caseStudy = docs[0]

  if (!caseStudy) {
    notFound()
  }

  // Fetch adjacent case studies for "Next Project" footer navigation
  const { docs: allProjects } = await payload.find({
    collection: 'case-studies',
    depth: 1,
    limit: 10,
  })

  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const nextProject =
    allProjects.length > 1
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null

  const thumbnailUrl =
    caseStudy.thumbnail && typeof caseStudy.thumbnail === 'object' && caseStudy.thumbnail.url
      ? caseStudy.thumbnail.url
      : '/placeholder.jpg'

  const altText =
    caseStudy.thumbnail && typeof caseStudy.thumbnail === 'object' && caseStudy.thumbnail.alt
      ? caseStudy.thumbnail.alt
      : caseStudy.title

  // Split hero title to colorize the last two words
  const titleText = caseStudy.heroTitle || caseStudy.title || ''
  const words = titleText.split(' ')
  const lastTwoWords =
    words.length > 2 ? words.splice(-2).join(' ') : words.length > 1 ? words.pop() : ''
  const firstPart = words.join(' ')

  const fallbackBrief =
    'Create a cost-effective launch campaign to build awareness of the product. The goal: highlight its benefits, connect with busy teams, and drive demo inquiries.'
  const fallbackChallenge =
    "The target audience were time-poor and under-resourced. Many were reluctant to try new tech or didn't realise how much more efficient their workday could be.\n\nThe challenge was clear: create a launch campaign that spoke their language, showed empathy for their daily pressures, and introduced a practical, approachable solution. All within a modest production budget."
  const fallbackSolution =
    'We delivered a bold, personable and scalable launch campaign that cut through the typical corporate legal jargon.\n\nBy leaning into the genuine frustrations of in-house teams, we created something highly relatable, positioning the product as the ultimate stress-reliever.'

  const renderGallery = (galleryData: any[], sectionTitle: string) => {
    if (galleryData && Array.isArray(galleryData) && galleryData.length > 0) {
      return (
        <div className="w-full mb-16 sm:mb-24 md:mb-32">
          <div
            className={`grid grid-cols-1 ${
              galleryData.length > 1 ? 'sm:grid-cols-2' : ''
            } gap-4 sm:gap-6 md:gap-8 w-full`}
          >
            {galleryData.map((item: any, idx: number) => {
              const imgUrl = item.image?.url || '/placeholder.jpg'
              const imgAlt = item.image?.alt || `${sectionTitle} gallery image ${idx + 1}`
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative flex group"
                >
                  <Image
                    src={imgUrl}
                    alt={imgAlt}
                    width={item.image?.width || 1200}
                    height={item.image?.height || 800}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 750px"
                    unoptimized
                  />
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  // Safe check for video
  const hasVideo =
    caseStudy.videoSection?.showVideo === true &&
    (Boolean(caseStudy.videoSection?.videoUrl) ||
      (typeof caseStudy.videoSection?.videoMedia === 'object' &&
        Boolean((caseStudy.videoSection.videoMedia as any)?.url)))

  const videoSourceUrl =
    typeof caseStudy.videoSection?.videoMedia === 'object' &&
    (caseStudy.videoSection?.videoMedia as any)?.url
      ? (caseStudy.videoSection.videoMedia as any).url
      : (caseStudy.videoSection?.videoUrl as string) || ''

  const videoPosterUrl =
    typeof caseStudy.videoSection?.posterImage === 'object' &&
    (caseStudy.videoSection?.posterImage as any)?.url
      ? (caseStudy.videoSection.posterImage as any).url
      : thumbnailUrl

  return (
    <article className="min-h-screen bg-white selection:bg-[#B270FF] selection:text-white pb-20 sm:pb-28 md:pb-36 pt-24 sm:pt-28 md:pt-36">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 font-medium tracking-wider uppercase mb-6 sm:mb-8 md:mb-10"
        >
          <Link href="/" className="hover:text-purple-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/portfolio" className="hover:text-purple-600 transition-colors">
            Portfolio
          </Link>
          <span>/</span>
          <span className="text-purple-600 truncate max-w-[180px] sm:max-w-md">
            {caseStudy.title}
          </span>
        </nav>

        {/* Hero Section */}
        <header className="mb-10 sm:mb-14 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[80px] font-medium leading-[1.15] sm:leading-[1.1] text-[#242038] tracking-tight mb-8 sm:mb-12 md:mb-16 max-w-5xl break-words">
            {firstPart}{' '}
            {lastTwoWords && <span className="text-[#B270FF]">{lastTwoWords}</span>}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 text-sm sm:text-[15px]">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-8 md:gap-x-12 gap-y-3 sm:gap-y-4 items-start">
              <span className="font-bold text-[#242038] whitespace-nowrap">Client:</span>
              <span className="text-gray-600 break-words">{caseStudy.client}</span>

              <span className="font-bold text-[#242038] whitespace-nowrap">Project:</span>
              <span className="text-gray-600 break-words">{caseStudy.title}</span>

              {(caseStudy as any).techStack &&
                Array.isArray((caseStudy as any).techStack) &&
                (caseStudy as any).techStack.length > 0 && (
                  <>
                    <span className="font-bold text-[#242038] whitespace-nowrap">Tech Stack:</span>
                    <span className="text-gray-600 break-words">
                      {(caseStudy as any).techStack
                        .map((t: any) => t.technology)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </>
                )}
            </div>

            <div className="text-gray-600 leading-relaxed max-w-2xl break-words">
              {caseStudy.services &&
              Array.isArray(caseStudy.services) &&
              caseStudy.services.length > 0
                ? caseStudy.services
                    .map((s: any) => s.service)
                    .filter(Boolean)
                    .join(', ')
                : 'Branding, Art Direction & Design, Copywriting, Campaign Development'}
            </div>
          </div>
        </header>

        {/* Hero Featured Image */}
        <figure className="w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-[2.4/1] rounded-2xl sm:rounded-[32px] md:rounded-[48px] overflow-hidden mb-16 sm:mb-24 md:mb-32 relative bg-[#F8F8F8] shadow-sm">
          <Image
            src={thumbnailUrl}
            alt={altText as string}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1600px"
            priority
          />
        </figure>

        {/* The Brief Section */}
        <section
          aria-labelledby="brief-heading"
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 sm:gap-6 md:gap-16 mb-16 sm:mb-24 md:mb-32 w-full"
        >
          <div>
            <h2
              id="brief-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#242038] tracking-tight"
            >
              <span className="text-[#B270FF]">The</span> Brief
            </h2>
          </div>
          <div className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed sm:leading-[1.7] w-full flex flex-col gap-4 sm:gap-6">
            <RichTextContent data={caseStudy.brief} fallback={fallbackBrief} />
          </div>
        </section>

        {/* Video Walkthrough Section (Rendered when configured) */}
        {hasVideo && (
          <section
            aria-label="Project Walkthrough Video"
            className="mb-16 sm:mb-24 md:mb-32 rounded-2xl sm:rounded-[32px] md:rounded-[48px] overflow-hidden relative aspect-video bg-[#F8F8F8] shadow-sm"
          >
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              poster={videoPosterUrl}
            >
              <source src={videoSourceUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </section>
        )}

        {/* The Challenge Section */}
        <section
          aria-labelledby="challenge-heading"
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 sm:gap-6 md:gap-16 mb-12 sm:mb-16 md:mb-20"
        >
          <div>
            <h2
              id="challenge-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#242038] tracking-tight"
            >
              <span className="text-[#B270FF]">The</span> Challenge
            </h2>
          </div>
          <div className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed sm:leading-[1.7] w-full flex flex-col gap-4 sm:gap-6">
            <RichTextContent data={caseStudy.challenge} fallback={fallbackChallenge} />
          </div>
        </section>

        {/* Challenge Gallery Section from CMS */}
        {renderGallery(caseStudy.gallery || [], 'Challenge')}

        {/* The Solution Section */}
        <section
          aria-labelledby="solution-heading"
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 sm:gap-6 md:gap-16 mb-12 sm:mb-16 md:mb-20"
        >
          <div>
            <h2
              id="solution-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#242038] tracking-tight"
            >
              <span className="text-[#B270FF]">The</span> Solution
            </h2>
          </div>
          <div className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed sm:leading-[1.7] w-full flex flex-col gap-4 sm:gap-6">
            <RichTextContent data={caseStudy.solution} fallback={fallbackSolution} />
          </div>
        </section>

        {/* Solution Gallery Section from CMS */}
        {renderGallery(caseStudy.solutionGallery || [], 'Solution')}

        {/* Bottom Navigation & CTA Banner */}
        <footer className="pt-10 sm:pt-16 border-t border-gray-100 flex flex-col gap-8 sm:gap-12">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-200 text-sm font-medium text-[#242038] hover:border-purple-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Works</span>
            </Link>

            {nextProject && (
              <Link
                href={`/portfolio/${nextProject.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#242038] text-white text-sm font-medium hover:bg-[#8B5CF6] transition-colors"
              >
                <span>Next Project: {nextProject.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Project Inquiry CTA Banner */}
          <div className="bg-[#FAF8FF] border border-[#E9D5FF] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] tracking-wider uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Transform Your Digital Presence?</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#242038] mb-2">
                Let's build an exceptional solution together.
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Partner with Pixels Digital to architect scalable web apps, custom ERPs, or high-converting digital products.
              </p>
            </div>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#8B5CF6] text-white font-medium text-sm hover:bg-[#7C3AED] transition-colors shadow-sm shrink-0"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </footer>
      </div>
    </article>
  )
}
