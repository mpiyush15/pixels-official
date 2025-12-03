'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Code, Video, Users, TrendingUp, Star, CheckCircle2, Phone, MapPin, Sparkles, Zap, Target, Rocket } from 'lucide-react';
import { useRef } from 'react';
import { usePageTracking } from '@/lib/analytics';

export default function Home() {
  usePageTracking();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="min-h-screen bg-white relative overflow-hidden">

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-light text-black mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            <span className="block">Creating Top</span>
            <span className="block font-thin">DIGITAL SOLUTIONS</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-500 mb-8 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Our mission is to help you achieve your digital goals. We're committed to providing exceptional customer service and delivering{' '}
            <span className="text-black">high-quality solutions</span>{' '}
            that exceed your expectations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-block px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-lg md:text-xl text-gray-600 font-light">
                Develop your business website at the best price between{' '}
                <span className="text-black font-normal">₹15,000</span> to{' '}
                <span className="text-black font-normal">₹1,50,000</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-8 py-4 rounded-full font-light text-lg flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-light text-lg border border-gray-300 text-black hover:bg-gray-50 transition-colors"
            >
              View Portfolio
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
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

      {/* Campaign Results Section */}
      <section className="relative py-32 px-4 bg-black overflow-hidden">
        {/* Animated Digital Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Moving Light Boxes - Fixed positions to avoid hydration mismatch */}
          {[
            { left: '10%', top: '20%' },
            { left: '80%', top: '10%' },
            { left: '30%', top: '70%' },
            { left: '60%', top: '40%' },
            { left: '15%', top: '85%' },
            { left: '75%', top: '60%' },
            { left: '45%', top: '15%' },
            { left: '90%', top: '75%' },
            { left: '25%', top: '45%' },
            { left: '50%', top: '90%' },
            { left: '70%', top: '25%' },
            { left: '35%', top: '55%' },
          ].map((pos, i) => (
            <motion.div
              key={i}
              animate={{
                x: ['0%', '20%', '-10%', '0%'],
                y: ['0%', '-15%', '10%', '0%'],
                opacity: [0.2, 0.5, 0.3, 0.2],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="absolute w-32 h-32 border border-white/20 rounded-lg"
              style={{
                left: pos.left,
                top: pos.top,
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-lg" />
            </motion.div>
          ))}
          
          {/* Larger Moving Light Boxes */}
          {[
            { left: '5%', top: '30%' },
            { left: '85%', top: '50%' },
            { left: '40%', top: '10%' },
            { left: '20%', top: '65%' },
            { left: '65%', top: '80%' },
            { left: '55%', top: '20%' },
          ].map((pos, i) => (
            <motion.div
              key={`large-${i}`}
              animate={{
                x: ['0%', '15%', '0%'],
                y: ['0%', '-10%', '0%'],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20 + i * 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1.5,
              }}
              className="absolute w-64 h-64 border border-white/10 rounded-2xl"
              style={{
                left: pos.left,
                top: pos.top,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent blur-2xl rounded-2xl" />
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-white/10 rounded-full border border-white/20 text-gray-300 text-sm font-light tracking-wide mb-4"
            >
              Real Results
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">
              Campaign Success in <span className="font-thin">Just 2 Days</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
              Investment: <span className="text-white font-normal">₹6,220</span> on 10 ads
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Views', value: '327.5K', icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} /> },
              { label: 'Unique Viewers', value: '120.2K', icon: <Users className="w-6 h-6" strokeWidth={1.5} /> },
              { label: 'Engagements', value: '115.3K', icon: <Target className="w-6 h-6" strokeWidth={1.5} /> },
              { label: 'Link Clicks', value: '4,932', icon: <Zap className="w-6 h-6" strokeWidth={1.5} /> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className="text-gray-400 mb-4">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-light text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Engagement Rate', value: '35.2%', description: 'Industry avg: 1-3%' },
              { label: 'Cost Per Click', value: '₹1.26', description: 'Highly cost-effective' },
              { label: 'CPM', value: '₹19', description: 'Cost per 1000 views' },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
              >
                <div className="text-sm text-gray-400 font-light mb-2">{metric.label}</div>
                <div className="text-3xl font-light text-white mb-2">{metric.value}</div>
                <div className="text-xs text-gray-500 font-light">{metric.description}</div>
              </motion.div>
            ))}
          </div>

          {/* SaaS Platform Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16"
          >
            <motion.a
              href="https://www.enromatics.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className="block group"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 hover:border-white/40 transition-all duration-500 overflow-hidden relative">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  {/* Left side - Icon/Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                      <Code className="w-10 h-10 text-black" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Middle - Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full border border-white/20 text-gray-300 text-xs font-light tracking-wide mb-3">
                      Featured Project
                    </div>
                    <h3 className="text-3xl md:text-4xl font-light text-white mb-3 group-hover:text-gray-100 transition-colors">
                      Enromatics SaaS Platform
                    </h3>
                    <p className="text-gray-400 font-light text-lg mb-4">
                      Custom SaaS solutions we develop for clients - Full-stack platforms with modern architecture
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {['SaaS', 'Full-Stack', 'Scalable', 'Modern UI'].map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right side - CTA */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 text-white group-hover:gap-4 transition-all">
                      <span className="text-sm font-light">View Project</span>
                      <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 text-lg font-light mb-6">
              Ready to achieve similar results for your business?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-4 rounded-full font-light text-lg flex items-center gap-2 mx-auto"
            >
              <span>Start Your Campaign</span>
              <Rocket className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-32 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-500 text-sm font-light tracking-wide mb-4"
            >
              What We Offer
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-tight">
              Our <span className="font-thin">Services</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
              Transforming ideas into stunning digital experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl border border-gray-200 flex items-center justify-center mb-6">
                  <Code className="w-8 h-8 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Website Development
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-6 font-light">
                  We create tailored websites that reflect your brand identity and engage your target audience with modern, responsive designs.
                </p>
                <div className="h-px bg-gray-200 w-full" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl border border-gray-200 flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl md:text-4xl font-light text-black mb-4">
                  Video Content
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-6 font-light">
                  Capture attention and drive engagement with our professional video content creation services that tell your brand story.
                </p>
                <div className="h-px bg-gray-200 w-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
              Our <span className="font-thin">Impact</span>
            </h2>
            <p className="text-gray-500 text-lg font-light">Numbers that speak for themselves</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { number: '33+', label: 'Clients', icon: Users, delay: 0 },
              { number: '1000+', label: 'Social Media Posts', icon: TrendingUp, delay: 0.1 },
              { number: '94%', label: 'Positive Feedback', icon: Star, delay: 0.2 },
              { number: '2', label: 'Years of Success', icon: CheckCircle2, delay: 0.3 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: stat.delay,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="group text-center"
              >
                <div className="relative bg-gray-50 p-8 rounded-3xl border border-gray-200 group-hover:border-gray-300 transition-all duration-500">
                  <div className="relative z-10">
                    <stat.icon className="w-10 h-10 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-5xl md:text-6xl font-thin text-black mb-3">
                      {stat.number}
                    </div>
                    <div className="text-gray-500 font-light">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 px-4 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-500 text-sm font-light tracking-wide mb-6"
              >
                Who We Are
              </motion.span>
              <h2 className="text-5xl md:text-6xl font-light text-black mb-8 tracking-tight">
                About <span className="font-thin">Us</span>
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-lg mb-6 leading-relaxed font-light"
              >
                We are a passionate team of digital experts dedicated to helping businesses thrive in the online world. With{' '}
                <span className="text-black">3 years of experience</span>, we offer a wide range of services, including Web development & Video content creation.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg mb-10 leading-relaxed font-light"
              >
                Our goal is to create innovative and effective digital solutions that drive results.
              </motion.p>
              <div className="space-y-5">
                {[
                  { text: 'Customer-centric approach', delay: 0.4 },
                  { text: 'Innovative solutions', delay: 0.5 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay }}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-black" strokeWidth={1.5} />
                    </div>
                    <span className="text-black text-lg font-light">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { title: 'Beyond the basics', desc: 'Comprehensive approach addressing unique challenges', delay: 0 },
                { title: 'Holistic approach', desc: 'Strategic plans aligned with business goals', delay: 0.1 },
                { title: 'Diverse skills', desc: 'Talented team with wide range of expertise', delay: 0.2 },
                { title: 'Passion for innovation', desc: 'Embracing latest digital trends', delay: 0.3 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay, type: "spring" }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative bg-white p-6 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-light text-black mb-3">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-light">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-gray-50 rounded-full border border-gray-200 text-gray-500 text-sm font-light tracking-wide mb-4"
            >
              Testimonials
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-light text-black mb-4 tracking-tight">
              Happy <span className="font-thin">Clients</span> About Us
            </h2>
            <p className="text-gray-500 text-lg font-light">See what our clients say about working with us</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group relative bg-gray-50 p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-black text-black" strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-light italic">
                  "Mr.Piyush took my Project brief and injected his own creative ideas and showed an excellent understanding of the style I was trying to create. He worked quickly and was there when needed. Excellent Job..!!!Most economical and great work."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-light text-xl">
                    PW
                  </div>
                  <div>
                    <p className="text-black font-normal text-lg">Pradip Wankhade</p>
                    <p className="text-gray-500 font-light">Director, Orima Global</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative bg-gray-50 p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-black text-black" strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-light italic">
                  "Very professional and prompt service. Mr. Piyush is very humble and supportive. Kudos to Pixels Digital solution.. We are happy with our website design and working. Pixels also give you proper guidance and effective solutions"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-light text-xl">
                    SC
                  </div>
                  <div>
                    <p className="text-black font-normal text-lg">Sandip Chaudhary</p>
                    <p className="text-gray-500 font-light">Director, Abhang Cotton Industries</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies / Portfolio Section - Horizontal Scroll */}
      <section id="portfolio" className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-500 text-sm font-light tracking-wide mb-4"
            >
              Our Work
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-light text-black mb-4 tracking-tight">
              Case <span className="font-thin">Studies</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8 font-light">
              Scroll horizontally to explore our featured projects
            </p>
          </motion.div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto scroll-smooth pb-8 px-4 md:px-8 scrollbar-hide snap-x snap-mandatory">
            {[
              { 
                title: 'Abhang Cotton Industries', 
                subtitle: 'Akola',
                desc: 'From a farmer\'s industry to go online',
                tech: ['E-Commerce', 'Responsive Design', 'SEO'],
                icon: '🌾'
              },
              { 
                title: 'Orima Global Industries', 
                subtitle: 'International',
                desc: 'Challenges to handle first project',
                tech: ['Corporate Website', 'CMS', 'Multi-language'],
                icon: '🏭'
              },
              { 
                title: 'Global Science Academy', 
                subtitle: 'Education',
                desc: 'Entry to coaching industry and guidance of experts',
                tech: ['LMS', 'Student Portal', 'Video Integration'],
                icon: '🎓'
              },
              { 
                title: 'Digital Marketing Campaign', 
                subtitle: 'Social Media',
                desc: 'Boosting brand presence with creative content',
                tech: ['Content Strategy', 'Analytics', 'Engagement'],
                icon: '📱'
              },
              { 
                title: 'Video Production Studio', 
                subtitle: 'Media',
                desc: 'Professional video content creation services',
                tech: ['Video Editing', 'Motion Graphics', '4K Production'],
                icon: '🎬'
              },
            ].map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.03, y: -10 }}
                className="flex-shrink-0 w-[400px] md:w-[450px] snap-center group"
              >
                <div className="relative h-full bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500 cursor-pointer">
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="text-6xl mb-6">
                      {study.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-light text-black mb-2">
                      {study.title}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-gray-500 font-light text-sm mb-4 uppercase tracking-wider">
                      {study.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed font-light">
                      {study.desc}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {study.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 text-sm border border-gray-200 font-light"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* View Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-black hover:text-gray-600 font-light transition-colors"
                    >
                      View Case Study
                      <span>→</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* End Spacer */}
            <div className="flex-shrink-0 w-8"></div>
          </div>

          {/* Scroll Indicators */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2 font-light">
            <span>←</span>
            Scroll to explore more
            <span>→</span>
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-light text-black mb-4 tracking-tight">PIXELS DIGITAL</h3>
              <p className="text-gray-500 mb-6 font-light">A digital service provider from Pixels Digital Solutions Akola</p>
            </div>

            <div>
              <h4 className="text-xl font-light text-black mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors font-light">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors font-light">Contact Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors font-light">Terms and Conditions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-light text-black mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors font-light">Website Development</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black transition-colors font-light">Video Contents</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-light text-black mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-500 font-light">
                  <Phone className="w-5 h-5" strokeWidth={1.5} />
                  976-650-4856
                </li>
                <li className="flex items-center gap-2 text-gray-500 font-light">
                  <MapPin className="w-5 h-5" strokeWidth={1.5} />
                  Akola | Mumbai
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 font-light">© 2024 Created with PIXELS DIGITAL SOLUTIONS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

