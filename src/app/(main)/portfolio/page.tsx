'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Code, ShoppingCart } from 'lucide-react';
import { usePageTracking } from '@/lib/analytics';

export default function PortfolioPage() {
  usePageTracking();
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-light text-black mb-6 tracking-tight">
            Our <span className="font-thin">Portfolio</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light">
            Showcasing our innovative digital solutions and success stories
          </p>
        </motion.div>

        {/* Enromatics - Completed Project */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-32"
        >
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl overflow-hidden border border-gray-800">
            <div className="p-12 md:p-16">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-white text-sm font-light mb-8"
              >
                <Sparkles className="w-4 h-4" />
                <span>Completed Project</span>
              </motion.div>

              {/* Title */}
              <h2 className="text-4xl md:text-6xl font-light text-white mb-4 tracking-tight">
                Enromatics
              </h2>
              <p className="text-xl text-gray-300 font-light mb-8">SaaS Platform for Modern Businesses</p>

              {/* Story */}
              <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10">
                <h3 className="text-2xl font-light text-white mb-4">The Story</h3>
                <p className="text-gray-300 font-light leading-relaxed mb-4">
                  Enromatics represents our vision of creating powerful, user-friendly SaaS solutions that transform how businesses operate. This project challenged us to build a scalable platform that could handle complex business processes while maintaining an intuitive user experience.
                </p>
                <p className="text-gray-300 font-light leading-relaxed mb-4">
                  From concept to deployment, we focused on creating a robust architecture that could grow with our clients' needs. The platform integrates seamlessly with existing business workflows, providing real-time insights and automation capabilities that drive efficiency.
                </p>
                <p className="text-gray-300 font-light leading-relaxed">
                  Today, Enromatics stands as a testament to our commitment to excellence in software development, combining cutting-edge technology with practical business solutions.
                </p>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-light text-lg mb-2">Modern Architecture</h4>
                  <p className="text-gray-400 text-sm font-light">Built with React & Next.js for optimal performance</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-light text-lg mb-2">Scalable Solution</h4>
                  <p className="text-gray-400 text-sm font-light">Designed to grow with your business needs</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <ExternalLink className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-light text-lg mb-2">Live & Running</h4>
                  <p className="text-gray-400 text-sm font-light">Successfully deployed and serving clients</p>
                </div>
              </div>

              {/* CTA */}
              <motion.a
                href="https://www.enromatics.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 10 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-light text-lg group"
              >
                <span>Visit Enromatics</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Vaibhav Group - In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden border border-gray-200">
            <div className="p-12 md:p-16">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full border border-yellow-200 text-yellow-800 text-sm font-light mb-8"
              >
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>In Progress</span>
              </motion.div>

              {/* Title */}
              <h2 className="text-4xl md:text-6xl font-light text-black mb-4 tracking-tight">
                Vaibhav Group
              </h2>
              <p className="text-xl text-gray-600 font-light mb-8">ERP Dashboard & E-commerce Platform</p>

              {/* Description */}
              <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200">
                <h3 className="text-2xl font-light text-black mb-4">About the Project</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-4">
                  We're currently partnering with Vaibhav Group, a leading biotech company, to develop a comprehensive digital ecosystem that includes a powerful ERP dashboard and a modern e-commerce store. This ambitious project aims to streamline their business operations while expanding their digital presence.
                </p>
                <p className="text-gray-600 font-light leading-relaxed">
                  The ERP system will integrate inventory management, sales tracking, and analytics, while the e-commerce platform will provide customers with a seamless shopping experience for their biotech products.
                </p>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-black font-light text-lg mb-2">ERP Dashboard</h4>
                  <p className="text-gray-600 text-sm font-light">Comprehensive business management system with real-time analytics and inventory tracking</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
                    <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-black font-light text-lg mb-2">E-commerce Store</h4>
                  <p className="text-gray-600 text-sm font-light">Modern online store with seamless checkout and product management</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-light text-gray-600 mb-2">
                      <span>Project Progress</span>
                      <span>In Development</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Website */}
              <motion.a
                href="https://vaibhavbiotech.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, x: 10 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-light text-lg group"
              >
                <span>Visit Vaibhav Biotech</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gray-50 rounded-3xl p-12 border border-gray-200"
        >
          <h2 className="text-4xl md:text-5xl font-light text-black mb-6">Want to see your project here?</h2>
          <p className="text-gray-600 font-light mb-8 max-w-2xl mx-auto text-lg">
            Let's create something amazing together and bring your vision to life
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-8 py-4 rounded-full font-light text-lg"
          >
            Start Your Project
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
