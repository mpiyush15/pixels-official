'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsConditionsPage() {
  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: '1. Introduction',
      content: `Welcome to Pixels Digital Solutions ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our services.`
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '2. Services',
      content: `Pixels Digital Solutions provides digital marketing services including but not limited to website development, social media marketing, SEO services, video content creation, and graphic design. The specific scope of services will be detailed in individual service agreements or proposals.`
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: '3. Client Responsibilities',
      content: `Clients agree to: (a) Provide accurate and complete information necessary for service delivery; (b) Respond to our communications in a timely manner; (c) Review and approve deliverables within agreed timeframes; (d) Make payments according to the agreed schedule; (e) Provide necessary access to accounts, platforms, and resources required for service delivery.`
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: '4. Payment Terms',
      content: `Payment terms will be specified in individual service agreements. Unless otherwise stated: (a) Invoices are due within the timeframe specified on the invoice; (b) Late payments may incur additional charges; (c) Services may be suspended for non-payment; (d) Refund policies vary by service and will be outlined in service-specific agreements.`
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '5. Intellectual Property',
      content: `Upon full payment, clients receive ownership of custom deliverables created specifically for them. However, we retain the right to: (a) Use completed work in our portfolio; (b) Retain ownership of proprietary tools, templates, and methodologies; (c) Use general knowledge and skills gained during projects.`
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: '6. Confidentiality',
      content: `Both parties agree to maintain confidentiality of sensitive information shared during the course of business. This includes but is not limited to business strategies, financial information, and proprietary data. This obligation continues even after the termination of services.`
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: '7. Limitation of Liability',
      content: `Pixels Digital Solutions shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services. Our total liability shall not exceed the amount paid by the client for the specific services in question.`
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: '8. Termination',
      content: `Either party may terminate services with written notice as specified in the service agreement. Upon termination: (a) Client remains responsible for payment of services rendered; (b) We will deliver completed work up to the termination date; (c) Ongoing campaigns or subscriptions will be handled according to their specific terms.`
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '9. Modifications',
      content: `We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Continued use of our services after changes constitutes acceptance of the modified Terms.`
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '10. Governing Law',
      content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts in Akola, Maharashtra.`
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
              <Scale className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-light text-black mb-6 tracking-tight">
            Terms & <span className="font-thin">Conditions</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
            Please read these terms carefully before using our services
          </p>
          <p className="text-sm text-gray-500 font-light mt-4">
            Last Updated: December 1, 2024
          </p>
        </motion.div>
      </section>

      {/* Terms Content */}
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
            <h3 className="text-3xl font-light mb-4">Questions About Our Terms?</h3>
            <p className="text-gray-300 font-light mb-8 text-lg">
              If you have any questions or concerns about these Terms and Conditions, please contact us.
            </p>
            <div className="space-y-2">
              <p className="text-gray-300 font-light">
                Email: <a href="mailto:info@pixelsdigital.tech" className="text-white hover:underline">info@pixelsdigital.tech</a>
              </p>
              <p className="text-gray-300 font-light">
                Phone: <a href="tel:+919766504856" className="text-white hover:underline">+91 976-650-4856</a>
              </p>
              <p className="text-gray-300 font-light">
                Location: Akola | Mumbai, Maharashtra, India
              </p>
            </div>
          </motion.div>

          {/* Acceptance Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-light text-black mb-2">Acceptance of Terms</h4>
                <p className="text-gray-600 font-light leading-relaxed">
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. 
                  If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the 
                  authority to bind such entity to these terms.
                </p>
              </div>
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
