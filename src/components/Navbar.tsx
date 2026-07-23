'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar({ data }: { data?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide Navbar completely on the Superadmin Dashboard routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const defaultLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Work', href: '/portfolio' },
    { name: 'About', href: '/about' }
  ];

  const links = data?.links && data.links.length > 0 
    ? data.links.map((link: any) => ({ name: link.label, href: link.url }))
    : defaultLinks;

  const logoUrl = data?.logo?.url || "/cropped-logo.png";
  const showCta = data?.ctaButton?.showButton !== false;
  const ctaLabel = data?.ctaButton?.label || "Talk to us";
  const ctaUrl = data?.ctaButton?.url || "/contact";

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-2 max-w-[1600px] mx-auto bg-transparent">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
          <Image src={logoUrl} alt="Pixels Logo" width={500} height={200} priority className="h-16 md:h-20 lg:h-28 w-auto object-contain" />
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link: { name: string; href: string }) => {
            const isActive = pathname.startsWith(link.href) || (pathname === '/' && link.href === '/');
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-[15px] font-medium transition-colors ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Contact Button (Desktop) */}
        {showCta && (
          <Link 
            href={ctaUrl}
            className="hidden md:inline-block px-6 py-2.5 rounded-full bg-[#FFD166] hover:bg-[#F4C455] text-black text-[15px] font-medium transition-colors"
          >
            {ctaLabel}
          </Link>
        )}

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
            {links.map((link: { name: string; href: string }) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold text-[#242038] hover:text-[#B270FF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {showCta && (
              <Link 
                href={ctaUrl}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold text-[#242038] hover:text-[#75E3C7] transition-colors"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
