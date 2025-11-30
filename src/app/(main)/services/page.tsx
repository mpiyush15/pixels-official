'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Code, Video, Megaphone, Palette, Search, BarChart, ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ServicesPage() {
  const containerRef = useRef(null);
  const [activeService, setActiveService] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const services = [
    {
      icon: <Code className="w-12 h-12" strokeWidth={1.5} />,
      title: 'Website Development',
      description: 'We create tailored websites that reflect your brand identity and engage your target audience with modern, responsive designs.',
      features: ['Custom Design', 'Responsive Layout', 'SEO Optimized', 'Fast Performance']
    },
    {
      icon: <Megaphone className="w-12 h-12" strokeWidth={1.5} />,
      title: 'Social Media Marketing',
      description: 'Build your brand presence and engage with your audience across all major social platforms.',
      features: ['Content Strategy', 'Post Management', 'Ad Campaigns', 'Analytics']
    },
    {
      icon: <Search className="w-12 h-12" strokeWidth={1.5} />,
      title: 'SEO Services',
      description: 'Improve your online visibility and rank higher in search engine results.',
      features: ['Keyword Research', 'On-Page SEO', 'Link Building', 'SEO Audit']
    },
    {
      icon: <BarChart className="w-12 h-12" strokeWidth={1.5} />,
      title: 'Analytics & Reporting',
      description: 'Track your digital performance and make data-driven decisions for growth.',
      features: ['Performance Tracking', 'Custom Reports', 'ROI Analysis', 'Insights']
    },
    {
      icon: <Video className="w-12 h-12" strokeWidth={1.5} />,
      title: 'Video Content Creation',
      description: 'Capture attention and drive engagement with our professional corporate video content creation and ad creation services. From promotional videos to social media ads, we bring your vision to life.',
      features: ['Corporate Videos', 'Ad Creation', 'Social Media Content', 'Product Demos']
    },
    {
      icon: <Palette className="w-12 h-12" strokeWidth={1.5} />,
      title: 'Graphic Design',
      description: 'Create stunning visual content that captures attention and communicates your message effectively.',
      features: ['Brand Identity', 'Marketing Materials', 'Social Graphics', 'Print Design']
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          style={{ opacity, scale }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-9xl font-light text-black mb-6 tracking-tight"
          >
            Our <span className="font-thin">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Comprehensive digital solutions to help your business thrive online
          </motion.p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border border-gray-300 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-gray-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Services Section - One Sticky Left Side */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Left Side - Single Sticky Container that Changes */}
            <div className="hidden lg:block lg:w-2/5 lg:sticky lg:top-32 lg:h-fit">
              <div className="relative">
                {services.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={false}
                    animate={{
                      opacity: activeService === index ? 1 : 0,
                      x: activeService === index ? 0 : -50
                    }}
                    transition={{ duration: 0.5 }}
                    className={`${activeService === index ? 'relative' : 'absolute inset-0 pointer-events-none'}`}
                  >
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="mb-8"
                    >
                      <div className="w-32 h-32 md:w-48 md:h-48 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl">
                        {service.icon}
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-4xl md:text-6xl font-light text-black mb-4 tracking-tight">
                      {service.title}
                    </h3>
                    <div className="w-20 h-1 bg-black"></div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side - Scrolling Services Content */}
            <div className="lg:w-3/5 space-y-32">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  onViewportEnter={() => setActiveService(index)}
                  viewport={{ margin: "-40%" }}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="min-h-screen flex items-center"
                >
                  <div className="space-y-8 w-full">
                    {/* Mobile Title (Hidden on Desktop) */}
                    <div className="lg:hidden mb-8">
                      <div className="w-32 h-32 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6">
                        {service.icon}
                      </div>
                      <h3 className="text-4xl font-light text-black mb-4 tracking-tight">
                        {service.title}
                      </h3>
                      <div className="w-20 h-1 bg-black"></div>
                    </div>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                      {service.features.map((feature, i) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          whileHover={{ scale: 1.05, x: 10 }}
                          className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200 hover:border-black transition-all duration-300"
                        >
                          <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
                          <span className="text-gray-700 font-light">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Learn More Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-black font-light text-lg group mt-8 bg-gray-50 px-8 py-4 rounded-full border border-gray-200 hover:border-black hover:bg-white transition-all duration-300"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" strokeWidth={1.5} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight">
              Ready to Get <span className="font-thin">Started?</span>
            </h2>
            <p className="text-xl text-gray-400 font-light mb-12 leading-relaxed">
              Let's discuss how we can help your business grow with our digital solutions
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-12 py-6 rounded-full font-light text-xl inline-flex items-center gap-3 shadow-2xl"
            >
              <span>Contact Us Today</span>
              <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
