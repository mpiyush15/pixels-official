'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

export default function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

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
            About <span className="font-thin">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed"
          >
            We are a passionate team of digital experts dedicated to helping businesses thrive in the online world.
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

      {/* Story Section */}
      <section className="py-32 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-7xl font-light text-black mb-8 tracking-tight">
                Our <span className="font-thin">Story</span>
              </h2>
              <p className="text-xl text-gray-600 font-light leading-relaxed mb-6">
                With 3 years of experience, we offer a wide range of services, including Web development & Video content creation. Our goal is to create innovative and effective digital solutions that drive results.
              </p>
              <p className="text-xl text-gray-600 font-light leading-relaxed">
                We're committed to providing exceptional customer service and delivering high-quality solutions that exceed your expectations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-12 border border-gray-200"
            >
              <h3 className="text-3xl font-light text-black mb-8">Differentiating Factors</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-xl text-gray-600 font-light">Customer-centric approach</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-xl text-gray-600 font-light">Innovative solutions</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section - Vertical Scroll */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-tight">
              Why <span className="font-thin">Choose Us</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                icon: <Target className="w-12 h-12" strokeWidth={1.5} />,
                title: 'Beyond the basics',
                description: 'Rather than simply providing digital marketing services, we offer a comprehensive approach that addresses your business\'s unique challenges and opportunities.'
              },
              {
                icon: <TrendingUp className="w-12 h-12" strokeWidth={1.5} />,
                title: 'Holistic approach',
                description: 'We don\'t just execute campaigns; we develop and implement strategic plans that align with your overall business goals.'
              },
              {
                icon: <Users className="w-12 h-12" strokeWidth={1.5} />,
                title: 'Diverse skills',
                description: 'Our team is composed of talented individuals with a wide range of skills and experiences. From creative experts to data analysts.'
              },
              {
                icon: <Lightbulb className="w-12 h-12" strokeWidth={1.5} />,
                title: 'Passion for innovation',
                description: 'We are committed to staying ahead of the curve and embracing the latest digital trends.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 20 }}
                className="bg-gray-50 rounded-3xl p-12 border border-gray-200 hover:border-black transition-all duration-500 cursor-pointer group"
              >
                <div className="flex items-start gap-8">
                  <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl font-light text-black mb-4 group-hover:text-gray-700 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-xl text-gray-600 font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-8xl font-light text-black mb-6 tracking-tight">
              Our <span className="font-thin">Tech Stack</span>
            </h2>
            <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto">
              Powered by cutting-edge technologies and creative tools
            </p>
          </motion.div>

          {/* Development Section */}
          <div className="mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h3 className="text-4xl md:text-5xl font-light text-black mb-3">Development</h3>
              <div className="w-24 h-1 bg-black"></div>
            </motion.div>

            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {[
                { name: 'HTML', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
                { name: 'CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
                { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
                { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
                { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
                { name: 'React Native', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
                { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
                { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' }
              ].map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center border border-gray-200 group-hover:border-black group-hover:shadow-2xl transition-all duration-500">
                      <img 
                        src={tech.logo} 
                        alt={tech.name}
                        className="w-16 h-16 object-contain transition-transform duration-500 group-hover:scale-110"
                        style={{ filter: tech.name === 'Next.js' ? 'brightness(0)' : 'none' }}
                      />
                    </div>
                    <p className="text-center mt-4 text-sm font-light text-gray-600 group-hover:text-black transition-colors">
                      {tech.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Creation Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h3 className="text-4xl md:text-5xl font-light text-black mb-3">Content Creation</h3>
              <div className="w-24 h-1 bg-black"></div>
            </motion.div>

            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {[
                { name: 'Adobe Illustrator', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg' },
                { name: 'Adobe Photoshop', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg' },
                { name: 'Adobe Premiere Pro', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-original.svg' },
                { name: 'After Effects', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-original.svg' },
                { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
                { name: 'Canva', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg' }
              ].map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center border border-gray-200 group-hover:border-black group-hover:shadow-2xl transition-all duration-500">
                      <img 
                        src={tool.logo} 
                        alt={tool.name}
                        className="w-16 h-16 object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <p className="text-center mt-4 text-sm font-light text-gray-600 group-hover:text-black transition-colors max-w-[112px]">
                      {tool.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Founder Section - Full Width Like Campaign Results */}
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
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-lg" />
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
              Meet the Team
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">
              Our <span className="font-thin">Founder</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <img 
                src="https://ik.imagekit.io/a0ivf97jq/alop.png?updatedAt=1764168497635"
                alt="Piyush Magar"
                className="w-auto h-80 md:h-96 object-contain"
              />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 text-center md:text-left max-w-2xl"
            >
              <h3 className="text-3xl md:text-4xl font-light text-white mb-2">Piyush Magar</h3>
              <p className="text-gray-400 text-lg mb-6 font-light">Director</p>
              <p className="text-gray-300 font-light leading-relaxed text-lg">
                As the Director and Video Editor at Forte Studioz, Piyush Magar brings a passion for storytelling and a deep understanding of digital media to every project. With years of experience in the industry, Piyush Magar is skilled at crafting compelling narratives and visually stunning content that resonates with audiences. Their expertise in video editing, combined with their creative vision, ensures that our clients receive top-quality video productions that exceed their expectations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
