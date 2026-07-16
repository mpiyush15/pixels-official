'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Box, BrainCircuit, Monitor, ShoppingCart,
  Search, PenTool, Code, Rocket, Heart, GraduationCap, Factory, Store,
  Briefcase, Globe, Github, Twitter, Linkedin, Instagram
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between pt-2 pb-28 px-6 lg:px-16 xl:px-24 bg-[#0A0A0A] text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-[#0B0B0B]">
          <img
            src="https://pixels-official.s3.ap-south-1.amazonaws.com/images/guhf.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight">PIXELS</span>
            <span className="text-[0.6rem] font-light leading-tight tracking-wider uppercase mt-1 opacity-80">
              Digital<br />Solutions
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-light text-gray-300">
            <a href="#work" className="hover:text-white transition">Work</a>
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#industries" className="hover:text-white transition">Industries</a>
            <a href="#ai" className="hover:text-white transition">AI Solutions</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>

          <button className="hidden md:flex items-center gap-2 text-sm border border-white/20 rounded-full px-5 py-2.5 hover:bg-white/10 transition">
            Book a Discovery Call
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-center mt-12 max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight mb-8">
            We are innovating<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8B4D] to-[#FF9D66]">
              Replysys agents
            </span><br />
            for business automation.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-light max-w-xl leading-relaxed">
            Building strong, scalable, and intelligent systems for the modern era.
          </p>
        </div>

        {/* Hero Bottom Bar */}
        <div className="relative z-20 mt-6 flex flex-col lg:flex-row items-end justify-between gap-10">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-4 font-semibold">
              TRUSTED BY GROWING BUSINESSES
            </p>
            <div className="flex items-center gap-8 opacity-70 grayscale">
              {/* Fake Logos */}
              <div className="flex items-center gap-2 font-bold text-lg"><span className="text-2xl">VB</span> VAIBHAV BIOTECH</div>
              <div className="flex items-center gap-2 font-bold text-lg"><span className="text-2xl">💬</span> REPLYSYS</div>
              <div className="flex items-center gap-2 font-bold text-lg text-white">MITRA</div>
              <div className="flex items-center gap-2 font-bold text-lg"><span className="text-2xl">U</span> UCHAL PORTAL</div>
            </div>
          </div>

          <div className="flex items-center gap-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 px-10">
            <div className="text-center">
              <div className="text-4xl font-light mb-1">10+</div>
              <div className="text-xs text-gray-400 font-light">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light mb-1">4+</div>
              <div className="text-xs text-gray-400 font-light">Industries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light mb-1">2</div>
              <div className="text-xs text-gray-400 font-light">Products Built</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">WHAT WE DO</p>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight max-w-2xl leading-tight text-gray-900">
            Engineering solutions<br />that scale with your vision.
          </h2>
          <p className="text-gray-500 text-lg max-w-md font-light leading-relaxed">
            We combine modern technologies with deep domain understanding to build secure, scalable and future-ready digital systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Custom Software Development",
              desc: "Tailored systems, web applications, ERPs and enterprise platforms.",
              icon: <Box className="w-6 h-6 text-[#8B5CF6]" />
            },
            {
              title: "AI Agents & Automation",
              desc: "Intelligent automation that streamlines operations and accelerates growth.",
              icon: <BrainCircuit className="w-6 h-6 text-[#10B981]" />
            },
            {
              title: "SaaS Product Development",
              desc: "Multi-tenant SaaS platforms built for scalability, performance and growth.",
              icon: <Monitor className="w-6 h-6 text-[#6366F1]" />
            },
            {
              title: "E-commerce Solutions",
              desc: "End-to-end e-commerce systems with powerful integrations.",
              icon: <ShoppingCart className="w-6 h-6 text-[#F59E0B]" />
            }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-10">
                {item.icon}
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed mb-8 flex-1">{item.desc}</p>
              <ArrowRight className="w-5 h-5 text-[#8B5CF6] mt-auto self-end" />
            </div>
          ))}
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
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-12 text-gray-900 leading-tight">
              Strategy. Design.<br />Develop. Deliver.
            </h2>

            <div className="space-y-8">
              {[
                { step: "01", title: "Discover", desc: "We understand your goals, challenges and opportunities.", icon: <Search className="w-5 h-5" /> },
                { step: "02", title: "Plan", desc: "We design the right solution architecture and roadmap.", icon: <PenTool className="w-5 h-5" /> },
                { step: "03", title: "Build", desc: "We engineer with clean code, modern tools and best practices.", icon: <Code className="w-5 h-5" /> },
                { step: "04", title: "Deliver", desc: "We launch, support and scale as you grow.", icon: <Rocket className="w-5 h-5" /> },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400">{item.step}</span>
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-500 font-light text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">FEATURED WORK</p>

        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            Real projects.<br />Real impact.
          </h2>
          <button className="hidden md:flex items-center gap-2 text-sm border border-gray-200 rounded-full px-5 py-2 hover:bg-gray-50 transition">
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              cat: "SaaS Platform",
              title: "ReplySys",
              desc: "Communication automation platform with CRM, campaigns, analytics and AI-ready architecture.",
              img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
            },
            {
              cat: "ERP & E-commerce",
              title: "Vaibhav Biotech",
              desc: "Enterprise platform managing accounts, inventory, staff operations and ecommerce workflows.",
              img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
            },
            {
              cat: "Government Portal",
              title: "Sugar Portal",
              desc: "Role-based management built for complex workflows, approvals and operational reporting.",
              img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2076&auto=format&fit=crop"
            },
            {
              cat: "Education Platform",
              title: "Uchal Portal",
              desc: "Comprehensive administration platform designed for educational operations and management.",
              img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
            },
          ].map((work, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer hover:shadow-lg transition">
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                <img src={work.img} alt={work.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[10px] uppercase tracking-wider text-[#6B46C1] font-semibold mb-2">{work.cat}</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{work.title}</h3>
                <p className="text-gray-500 font-light text-sm mb-6 flex-1">{work.desc}</p>
                <div className="flex items-center gap-2 text-[#10B981] text-sm font-medium">
                  View Case Study <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE BUILD / CAPABILITIES */}
      <section className="py-24 px-6 lg:px-16 xl:px-24 bg-[#FAFAFA]">
        <div className="max-w-3xl mb-16">
          <p className="text-[11px] tracking-[0.2em] text-[#6B46C1] uppercase font-bold mb-4">OUR CAPABILITIES</p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-gray-900 leading-tight">
            Engineering software with<br />business understanding.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed font-light">
            We don't just write code. We build systems that solve real business problems with strategy, engineering and long-term vision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "ERP & Enterprise Systems", desc: "Comprehensive platforms managing accounts, inventory, and operations." },
            { title: "SaaS Platforms", desc: "Multi-tenant cloud applications built for scalability and performance." },
            { title: "AI & Automation", desc: "Intelligent agents and workflows that accelerate business growth.", badge: "Beta", badgeColor: "bg-orange-100 text-orange-600" },
            { title: "Ecommerce Systems", desc: "End-to-end scalable online stores with powerful integrations." },
            { title: "Government Portals", desc: "Secure role-based management built for complex workflows." },
            { title: "Custom Software", desc: "Tailored systems engineered specifically for your unique needs.", badge: "Strong Portfolio", badgeColor: "bg-green-100 text-green-700" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition duration-300 cursor-pointer">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-xl font-medium text-gray-900">{item.title}</h3>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">{item.desc}</p>
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
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight">
              Let's build something<br />meaningful together.
            </h2>
            <p className="text-gray-300 font-light text-lg">
              Have an idea or project in mind? Let's discuss how we can help you build, automate and scale.
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

      {/* FOOTER */}
      <footer className="py-12 px-6 lg:px-16 xl:px-24 border-t border-gray-100 bg-white">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-bold text-2xl tracking-tight text-black">PIXELS</span>
              <span className="text-[0.6rem] font-light leading-tight tracking-wider uppercase mt-1 text-gray-500">
                Digital<br />Solutions
              </span>
            </div>
            <p className="text-gray-500 font-light text-sm max-w-xs">
              Building software, AI systems, Digital products.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Our Process</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">Services</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Custom Software</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">AI Automation</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">SaaS Development</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">E-commerce</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Insights</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-4">
          <p className="text-xs text-gray-500 font-light">
            © 2024 Pixels Digital Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900"><Github className="w-4 h-4" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
