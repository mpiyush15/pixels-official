'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Services', href: '/services' },
    { name: 'Work', href: '/portfolio' },
    { name: 'About us', href: '/about' }
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 max-w-[1600px] mx-auto bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="font-bold text-2xl tracking-tight text-black">PIXELS</span>
          <span className="text-[0.6rem] font-light leading-tight tracking-wider uppercase mt-1 text-gray-500">
            Digital<br />Solutions
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-white rounded-full p-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href) || (pathname === '/' && link.href === '/');
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`px-6 py-2 rounded-full text-[15px] font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#B270FF] text-white' 
                    : 'text-[#242038] hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Contact Button (Desktop) */}
        <Link 
          href="/contact"
          className="hidden md:inline-block px-6 py-3 rounded-full bg-[#75E3C7] hover:bg-[#5FD4B7] text-[#242038] text-[15px] font-medium transition-colors shadow-sm"
        >
          Contact Us
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-black transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-b border-gray-100 shadow-2xl flex flex-col p-6 h-[calc(100vh-80px)]">
          <div className="flex flex-col gap-6 flex-1 pt-4">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold text-[#242038] hover:text-[#B270FF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            <Link 
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-semibold text-[#242038] hover:text-[#75E3C7] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
