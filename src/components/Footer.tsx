import Link from 'next/link';
import { Linkedin, Twitter, Github, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 lg:px-16 xl:px-24 border-t border-gray-100 bg-white">
      <div className="grid md:grid-cols-5 gap-12 mb-16 max-w-[1600px] mx-auto">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <span className="font-bold text-2xl tracking-tight text-black">PIXELS</span>
            <span className="text-[0.6rem] font-light leading-tight tracking-wider uppercase mt-1 text-gray-500">
              Digital<br />Solutions
            </span>
          </Link>
          <p className="text-gray-500 font-light text-sm max-w-xs">
            Building software, AI systems, Digital products.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-6 text-sm">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">About Us</Link></li>
            <li><Link href="/portfolio" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Our Work</Link></li>
            <li><Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-6 text-sm">Services</h4>
          <ul className="space-y-4">
            <li><Link href="/services" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Custom Software</Link></li>
            <li><Link href="/services" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">AI Automation</Link></li>
            <li><Link href="/services" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">SaaS Development</Link></li>
            <li><Link href="/services" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">E-commerce</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-6 text-sm">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Blog</Link></li>
            <li><Link href="#" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Insights</Link></li>
            <li><Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Contact</Link></li>
            <li><Link href="/cms" className="text-gray-500 hover:text-gray-900 text-sm font-light transition">Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <p className="text-xs text-gray-500 font-light">
            © {new Date().getFullYear()} Pixels Digital Solutions. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-400 hover:text-gray-900 transition"><Linkedin className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-gray-900 transition"><Twitter className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-gray-900 transition"><Github className="w-4 h-4" /></a>
          <a href="#" className="text-gray-400 hover:text-gray-900 transition"><Instagram className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
}
