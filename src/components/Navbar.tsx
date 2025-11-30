'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Briefcase, Mail, Info, Code } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: Code },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const handleMenuClick = (href: string) => {
    setIsOpen(false);
    // Navigation will be handled by Next.js Link component
  };

  return (
    <>
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center shadow-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-2xl font-thin tracking-wider text-black">PIXELS</span>
            </motion.div>
          </Link>

          {/* Hamburger Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <Menu className="w-5 h-5 text-white" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-lg z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ clipPath: 'circle(0% at calc(100% - 56px) 56px)' }}
              animate={{ clipPath: 'circle(150% at calc(100% - 56px) 56px)' }}
              exit={{ clipPath: 'circle(0% at calc(100% - 56px) 56px)' }}
              transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              className="fixed inset-0 z-40"
            >
              <div className="absolute inset-0 bg-white">
                <div className="h-full flex flex-col items-center justify-center px-8 py-20">
                  {/* Menu Items */}
                  <nav className="w-full max-w-md space-y-2">
                    {menuItems.map((item, index) => (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          onClick={() => handleMenuClick(item.href)}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          whileHover={{ x: 15 }}
                          className="flex items-center gap-5 py-5 group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-5xl font-thin text-black group-hover:text-gray-500 transition-colors tracking-tight">
                            {item.name}
                          </h3>
                        </motion.div>
                      </Link>
                    ))}
                  </nav>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 w-full max-w-md"
                  >
                    <button className="w-full bg-black text-white py-5 rounded-full font-light text-lg tracking-wide hover:bg-gray-800 transition-all shadow-lg">
                      Get in Touch
                    </button>
                  </motion.div>

                  {/* Footer Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-gray-400 text-sm font-light"
                  >
                    © 2024 Pixels Digital
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
