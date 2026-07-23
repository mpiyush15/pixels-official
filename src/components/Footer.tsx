'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Linkedin, Twitter, Github, Instagram } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer completely on the Superadmin Dashboard routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="py-12 px-6 lg:px-16 xl:px-24 bg-[#0B0B0B] text-white">
      <div className="grid md:grid-cols-5 gap-12 mb-16 max-w-[1600px] mx-auto">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center mb-6">
            <Image src="https://pixels-official.s3.ap-south-1.amazonaws.com/logos/white+logo.png" alt="Pixels Logo" width={600} height={240} className="h-24 md:h-32 lg:h-40 w-auto object-contain" />
          </Link>
          <p className="text-gray-400 font-light text-sm max-w-xs">
            Building software, AI systems, Digital products.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 text-sm">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-gray-400 hover:text-white text-sm font-light transition">About Us</Link></li>
            <li><Link href="/portfolio" className="text-gray-400 hover:text-white text-sm font-light transition">Our Work</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm font-light transition">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 text-sm">Services</h4>
          <ul className="space-y-4">
            <li><Link href="/services" className="text-gray-400 hover:text-white text-sm font-light transition">Custom Software</Link></li>
            <li><Link href="/services" className="text-gray-400 hover:text-white text-sm font-light transition">AI Automation</Link></li>
            <li><Link href="/services" className="text-gray-400 hover:text-white text-sm font-light transition">SaaS Development</Link></li>
            <li><Link href="/services" className="text-gray-400 hover:text-white text-sm font-light transition">E-commerce</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 text-sm">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-gray-400 hover:text-white text-sm font-light transition">Blog</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white text-sm font-light transition">Insights</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm font-light transition">Contact</Link></li>
            <li><Link href="/cms" className="text-gray-400 hover:text-white text-sm font-light transition">Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800 gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <p className="text-xs text-gray-500 font-light">
            © {new Date().getFullYear()} PIXELS DIGITAL SOLUTIONS. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-400 hover:text-white transition"><Linkedin className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-white transition"><Github className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-white transition"><Instagram className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
}
