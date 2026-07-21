'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ServiceDetailsClient({ service }: { service: any }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      
      {/* 1. Hero Section */}
      <section className="pt-28 md:pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wider uppercase mb-10"
            >
              <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-purple-600 transition-colors">Services</Link>
              <span>/</span>
              <span className="text-purple-600">{service.title}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight mb-8"
            >
              {service.heroTitle || service.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl lg:text-2xl text-gray-600 font-medium leading-relaxed max-w-3xl"
            >
              {service.heroDescription || service.description}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/contact">
                <button className="px-8 py-3.5 bg-[#B388FF] text-white font-medium rounded-full hover:bg-[#9d6cf2] transition-colors duration-300">
                  Talk to the team
                </button>
              </Link>
              <Link href="/portfolio">
                <button className="px-8 py-3.5 bg-transparent border border-black text-black font-medium rounded-full hover:bg-black hover:text-white transition-colors duration-300">
                  View related work
                </button>
              </Link>
            </motion.div>
          </div>
          
          {service.howWeWork && service.howWeWork.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:w-1/3 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm"
            >
              <h3 className="font-medium text-lg mb-6 text-gray-400 uppercase tracking-widest">How we work</h3>
              <ul className="space-y-4">
                {service.howWeWork.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-gray-800 font-medium">{item.item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. Who this is for */}
      {service.whoThisIsFor && service.whoThisIsFor.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-12">Who this is for</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.whoThisIsFor.map((item: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[2rem] ${item.color || 'bg-purple-400'}`}
              >
                <h3 className="text-2xl font-medium mb-4 text-black">{item.title}</h3>
                <p className="text-black/80 font-medium leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. What we help solve */}
      {service.whatWeHelpSolve && service.whatWeHelpSolve.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-12">What we help solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {service.whatWeHelpSolve.map((item: any, i: number) => (
              <div key={i} className="border-l-4 border-emerald-400 pl-6">
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Why Us (Dark Immersive) */}
      {service.whyUs && service.whyUs.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="bg-[#1C1626] rounded-[3rem] p-12 md:p-20 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-12">Why choose us for {service.title}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {service.whyUs.map((item: any, i: number) => (
                <div key={i}>
                  <h3 className="text-2xl font-medium mb-4">{item.title}</h3>
                  <p className="text-gray-400 font-light leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Built for real-world delivery */}
      {service.builtForDelivery && service.builtForDelivery.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-medium mb-12">Built for real-world delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {service.builtForDelivery.map((item: any, i: number) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-purple-600 font-medium uppercase tracking-widest mb-4">{item.title}</h3>
                <p className="text-gray-800 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. How we deliver */}
      {service.deliverySteps && service.deliverySteps.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-medium mb-12">How we deliver</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.deliverySteps.map((item: any, i: number) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[2rem] flex gap-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 shrink-0 bg-[#2C243B] text-white rounded-full flex items-center justify-center font-medium">
                  {item.stepNumber || i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-medium mb-3">{item.title}</h3>
                  <p className="text-gray-500 font-light mb-4">{item.description}</p>
                  {item.highlight && (
                    <p className="text-gray-800 italic font-medium">{item.highlight}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Selected Work */}
      {service.relatedProjects && service.relatedProjects.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4">Selected work</h2>
          <p className="text-xl text-gray-500 mb-12">Representative outcomes—explore more in our work.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.relatedProjects.map((project: any, i: number) => {
              const imageUrl = typeof project.thumbnail === 'string' ? project.thumbnail : project.thumbnail?.url;
              // Alternate background colors for cards
              const colors = ['bg-[#B388FF]', 'bg-[#69F0AE]', 'bg-[#FF80AB]', 'bg-[#8C9EFF]'];
              const bgColor = colors[i % colors.length];

              return (
                <Link key={i} href={`/portfolio/${project.slug}`} className="block group">
                  <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className={`p-10 md:p-14 rounded-[3rem] h-[500px] flex flex-col justify-between ${bgColor}`}
                  >
                    <div>
                      <h3 className="text-4xl md:text-5xl font-medium text-black mb-6 leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-black/70 text-lg line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="mt-8">
                      <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-black text-black font-medium group-hover:bg-black group-hover:text-white transition-colors duration-300">
                        View project
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. FAQs */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-medium mb-12">FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {service.faqs.map((faq: any, i: number) => (
              <div key={i} className="border-b border-gray-200">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left font-medium text-lg hover:text-purple-600 transition-colors"
                >
                  {faq.question}
                  <div className="text-purple-400 text-xl font-light">
                    {openFaq === i ? '−' : '+'}
                  </div>
                </button>
                {openFaq === i && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pb-6 text-gray-500 font-light leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Bottom CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-[#252033] rounded-[3rem] p-12 md:p-24 text-center text-white flex flex-col items-center">
          <div className="text-purple-400 font-medium tracking-widest uppercase mb-8">Get Started</div>
          <h2 className="text-4xl md:text-6xl font-medium max-w-4xl leading-tight mb-8">
            Looking to make your systems smarter without overcomplicating them?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl font-light leading-relaxed mb-12">
            Talk to Pixels Digital about integration points, APIs and automation—we'll help you stress-test scope and platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <button className="px-8 py-4 bg-[#B388FF] text-black font-medium rounded-full hover:bg-white transition-colors duration-300">
                Talk to the team
              </button>
            </Link>
            <Link href="/portfolio">
              <button className="px-8 py-4 bg-transparent border border-white/30 rounded-full font-medium hover:bg-white/10 transition-colors duration-300">
                View our work
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
