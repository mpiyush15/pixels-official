'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, X, Check, CreditCard, Shield } from 'lucide-react';
import { useRef, useState } from 'react';
import { usePageTracking } from '@/lib/analytics';
import Link from 'next/link';
import Image from 'next/image';

export default function ServicesClient({ servicesPage, services }: { servicesPage: any, services: any[] }) {
  usePageTracking();
  const containerRef = useRef(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const handleChoosePlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order with Cashfree
      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: selectedPlan.name,
          planPrice: selectedPlan.price,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Redirect to Cashfree checkout
      const cashfree = await (window as any).Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'production'
      });

      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self'
      };

      cashfree.checkout(checkoutOptions);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.message || 'Failed to process payment. Please try again.';
      
      // Show user-friendly message
      if (errorMsg.includes('Sandbox credentials')) {
        alert('⚠️ Local Testing: Sandbox credentials needed.\n\nThis will work on production with your live domain and HTTPS.\n\nTo test locally, get sandbox credentials from Cashfree dashboard.');
      } else {
        alert(errorMsg);
      }
      setLoading(false);
    }
  };


  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-16"
        >
          <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-light tracking-tight text-[#1A1A1A] leading-[1.1] mb-8">
            {servicesPage?.hero?.title ? (
              // Simple parser: if they use *text*, make it purple
              servicesPage.hero.title.split(/(\*[^*]+\*)/g).map((part: string, i: number) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <span key={i} className="text-[#B388FF] block my-2">{part.slice(1, -1)}</span>;
                }
                return <span key={i}>{part}</span>;
              })
            ) : (
              <>
                Services tailored <br />
                <span className="text-[#B388FF]">to meet the needs</span> <br />
                of modern businesses.
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light max-w-2xl">
            {servicesPage?.hero?.subtitle || 'Building strong, scalable, and intelligent systems for the modern era.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[60vh] md:h-[70vh] rounded-[3rem] overflow-hidden"
        >
          {(() => {
            const imageUrl = servicesPage?.hero?.heroImage 
              ? (typeof servicesPage.hero.heroImage === 'string' ? servicesPage.hero.heroImage : servicesPage.hero.heroImage.url)
              : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop';
            
            return (
              <Image 
                src={imageUrl} 
                alt="Services hero" 
                fill 
                className="object-cover"
                priority
              />
            );
          })()}
        </motion.div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-32">
          {servicesPage?.serviceCategories?.map((category: any, catIndex: number) => (
            <div key={catIndex} className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-6"
              >
                <h2 className="text-4xl md:text-5xl font-light text-black tracking-tight">
                  {category.categoryName}
                </h2>
                <div className="h-[1px] flex-grow bg-gray-200 mt-2"></div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.services?.map((service: any, srvIndex: number) => (
                  <motion.div
                    key={srvIndex}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: srvIndex * 0.1 }}
                    className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300 flex flex-col h-full group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                      {(() => {
                        const IconComp = (LucideIcons as any)[service.icon] || LucideIcons.Code;
                        return <IconComp className="w-8 h-8" strokeWidth={1.5} />;
                      })()}
                    </div>
                    
                    <h3 className="text-2xl font-medium text-black mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                      {service.description}
                    </p>

                    <Link href={`/services/${service.slug}`} className="mt-auto">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-purple-600 font-medium group/btn"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight">
              Ready to Get <span className="font-thin">Started?</span>
            </h2>
            <p className="text-xl text-gray-400 font-light mb-12 leading-relaxed">
              Let's discuss how we can help your business grow with our digital solutions
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-12 py-6 rounded-full font-light text-xl inline-flex items-center gap-3 shadow-2xl"
            >
              <span>Contact Us Today</span>
              <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Social Media Plans Modal */}
      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPlansModal(false)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>

              {/* Header */}
              <div className="text-center pt-16 pb-12 px-4 border-b">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-5xl md:text-6xl font-light text-black mb-4 tracking-tight">
                    Pricing <span className="font-thin">Plans</span>
                  </h2>
                  <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                    Choose the perfect plan for your business needs
                  </p>
                </motion.div>
              </div>

              {/* Plans Grid */}
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-8">
                  {servicesPage?.pricingPlans?.map((plan: any, index: number) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`relative rounded-2xl p-8 border-2 ${
                        plan.popular
                          ? 'border-black bg-black text-white shadow-2xl scale-105'
                          : 'border-gray-200 bg-white hover:border-black transition-all duration-300'
                      }`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-light">
                            Most Popular
                          </span>
                        </div>
                      )}

                      {/* Plan Name */}
                      <h3 className="text-2xl font-light mb-2">{plan.name}</h3>
                      
                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-light">₹{plan.price.toLocaleString()}</span>
                          <span className={`text-lg font-light ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                            /{plan.duration}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`mb-6 font-light ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                        {plan.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {plan.features?.map((f: any, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check 
                              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                plan.popular ? 'text-white' : 'text-black'
                              }`} 
                              strokeWidth={2} 
                            />
                            <span className="font-light text-sm">{f.feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChoosePlan(plan)}
                        className={`w-full py-4 rounded-xl font-light flex items-center justify-center gap-2 transition-all ${
                          plan.popular
                            ? 'bg-white text-black hover:bg-gray-100'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" strokeWidth={1.5} />
                        <span>Choose {plan.name}</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                {/* Custom Plan CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 text-center"
                >
                  <p className="text-gray-600 font-light mb-4">
                    Need a custom plan tailored to your specific needs?
                  </p>
                  <button className="text-black font-light underline underline-offset-4 hover:text-gray-600 transition-colors">
                    Contact us for a custom quote
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowPaymentForm(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-black text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-light">Complete Your Purchase</h3>
                  <button
                    onClick={() => !loading && setShowPaymentForm(false)}
                    disabled={loading}
                    className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" strokeWidth={1.5} />
                  </button>
                </div>
                {selectedPlan && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light">₹{selectedPlan.price.toLocaleString()}</span>
                    <span className="text-white/70 font-light">/ {selectedPlan.duration}</span>
                  </div>
                )}
                <p className="text-white/70 font-light text-sm mt-1">
                  {selectedPlan?.name} Plan
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none font-light transition-colors"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none font-light transition-colors"
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none font-light transition-colors"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>

                {/* Security Note */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-light text-gray-700">
                      Secure payment powered by Cashfree
                    </p>
                    <p className="text-xs font-light text-gray-500 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-light hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-light hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <CreditCard className="w-5 h-5" strokeWidth={1.5} />
                        </motion.div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" strokeWidth={1.5} />
                        <span>Proceed to Pay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
