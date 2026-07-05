'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, Lock, Eye, Database, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: '1. Introduction',
      content: `Welcome to Pixels Digital Solutions ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services (Web Development, SaaS, Web Design Consulting).`
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: '2. Information We Collect',
      content: `We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website, or otherwise when you contact us. This may include your name, email address, phone number, and project details.`
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: '3. How We Use Your Information',
      content: `We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. This includes providing services, responding to inquiries, and sending administrative information.`
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: '4. How We Keep Your Information Safe',
      content: `We aim to protect your personal information through a system of organizational and technical security measures. We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet can be guaranteed to be 100% secure.`
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '5. Information Sharing',
      content: `We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the legal basis of legitimate interests or when we have your specific consent to do so.`
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '6. Your Privacy Rights',
      content: `In some regions, you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto pt-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-light text-black mb-6 tracking-tight">
            Privacy <span className="font-thin">Policy</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
            How we protect and manage your data
          </p>
          <p className="text-sm text-gray-500 font-light mt-4">
            Last Updated: December 1, 2024
          </p>
        </motion.div>
      </section>

      {/* Policy Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <p className="text-gray-600 font-light leading-relaxed text-lg pl-16">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-black text-white rounded-2xl p-12 text-center"
          >
            <h3 className="text-3xl font-light mb-4">Questions About Privacy?</h3>
            <p className="text-gray-300 font-light mb-8 text-lg">
              If you have any questions or concerns about our Privacy Policy, please contact us.
            </p>
            <div className="space-y-2">
              <p className="text-gray-300 font-light">
                Email: <a href="mailto:info@pixelsdigitalsolutions.com" className="text-white hover:underline">info@pixelsdigitalsolutions.com</a>
              </p>
              <p className="text-gray-300 font-light">
                Phone: <a href="tel:+919766504856" className="text-white hover:underline">+91 976-650-4856</a>
              </p>
              <p className="text-gray-300 font-light">
                Location: Akola | Mumbai, Maharashtra, India
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 font-light text-sm">
            © 2024 Pixels Digital Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
