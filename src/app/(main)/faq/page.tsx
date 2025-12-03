'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePageTracking } from '@/lib/analytics';

export default function FAQPage() {
  usePageTracking();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What services does Pixels Digital offer?',
      answer: 'We offer a comprehensive range of digital services including Website Development, Video Content Creation, Social Media Marketing, Graphic Design, SEO Services, and Analytics & Reporting.'
    },
    {
      question: 'How long does it take to build a website?',
      answer: 'The timeline varies based on the complexity and requirements of your project. A basic website typically takes 2-4 weeks, while more complex projects may take 6-12 weeks. We provide a detailed timeline during our initial consultation.'
    },
    {
      question: 'What is the cost range for website development?',
      answer: 'Our website development services range from ₹15,000 to ₹1,50,000, depending on the features, complexity, and customization required. We offer tailored solutions to fit your budget and business needs.'
    },
    {
      question: 'Do you provide website maintenance after launch?',
      answer: 'Yes, we offer ongoing maintenance and support packages to ensure your website remains secure, up-to-date, and performing optimally. We can discuss maintenance options that suit your needs.'
    },
    {
      question: 'Can you help with social media marketing?',
      answer: 'Absolutely! We create and manage social media campaigns, develop content strategies, design graphics, and provide analytics to help grow your brand presence across all major platforms.'
    },
    {
      question: 'Do you offer video content creation?',
      answer: 'Yes, we specialize in professional video content creation including promotional videos, social media content, product demonstrations, and animations to help engage your audience.'
    },
    {
      question: 'What makes Pixels Digital different from other agencies?',
      answer: 'We combine a customer-centric approach with innovative solutions. With 3 years of experience and a track record of successful campaigns, we focus on delivering measurable results that align with your business goals.'
    },
    {
      question: 'How do I get started with Pixels Digital?',
      answer: 'Simply contact us through our website, phone, or email. We\'ll schedule a consultation to discuss your project requirements, provide recommendations, and create a customized proposal for your business.'
    },
    {
      question: 'Do you work with businesses outside of Akola and Mumbai?',
      answer: 'Yes, we work with clients across India and internationally. Our digital services can be delivered remotely, and we maintain excellent communication throughout the project.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'We work on a milestone-based payment system. Our refund policy depends on the stage of the project and is outlined in our terms and conditions. We always strive for client satisfaction and work to resolve any concerns.'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-light text-black mb-6 tracking-tight">
            <span className="font-thin">FAQ</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light">
            Find answers to commonly asked questions about our services
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-light text-black pr-8">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-600 font-light leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center bg-gray-50 rounded-3xl p-12"
        >
          <h2 className="text-3xl font-light text-black mb-4">Still have questions?</h2>
          <p className="text-gray-600 font-light mb-6">
            Can't find the answer you're looking for? Please reach out to our team.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-8 py-4 rounded-full font-light text-lg"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
