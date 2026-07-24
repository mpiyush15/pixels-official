'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { usePageTracking } from '@/lib/analytics';

export default function ContactPage() {
  usePageTracking();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    existingWebsite: '',
    industry: '',
    role: '',
    companySize: '',
    projectDescription: '',
    projectGoals: '',
    currentChallenges: '',
    requiredFeatures: '',
    timeline: '',
    estimatedBudget: '',
    preferredStartDate: '',
    doesNotGuarantee: false,
    mayContact: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
    }
    if (currentStep === 2) {
      if (!formData.projectDescription) newErrors.projectDescription = 'Please describe your project';
    }
    if (currentStep === 3) {
      if (!formData.doesNotGuarantee) newErrors.doesNotGuarantee = 'You must acknowledge this';
      if (!formData.mayContact) newErrors.mayContact = 'You must agree to be contacted';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Project Application Form',
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '', email: '', phone: '', companyName: '', existingWebsite: '',
          industry: '', role: '', companySize: '', projectDescription: '',
          projectGoals: '', currentChallenges: '', requiredFeatures: '',
          timeline: '', estimatedBudget: '', preferredStartDate: '',
          doesNotGuarantee: false, mayContact: false,
        });
        setCurrentStep(1);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <p className="text-sm tracking-[0.2em] text-gray-400 font-bold mb-4 uppercase">Request a Proposal</p>
          <h1 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-tight">
            Let’s Build Something <span className="font-bold text-[#8B5CF6]">Exceptional</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-4xl mx-auto font-light leading-relaxed mb-6">
            We partner with ambitious businesses to design and engineer custom software, AI systems, and digital products.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto font-light">
            Complete the project application below. If we’re a good fit, we’ll schedule a discovery call within 1–2 business days.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Process & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 space-y-16"
          >
            {/* How We Work */}
            <div>
              <h2 className="text-3xl font-light text-black mb-8 border-b border-gray-100 pb-4">How We Work</h2>
              <div className="space-y-8">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full">1</div>
                  <h3 className="text-xl font-medium text-black mb-2">Project Application</h3>
                  <p className="text-gray-600 font-light">Tell us about your business, goals, and project requirements.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full">2</div>
                  <h3 className="text-xl font-medium text-black mb-2">Qualification Review</h3>
                  <p className="text-gray-600 font-light">Our engineering team reviews every enquiry to ensure we’re the right technology partner.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full">3</div>
                  <h3 className="text-xl font-medium text-black mb-2">Discovery Call</h3>
                  <p className="text-gray-600 font-light">A focused 30-minute consultation to understand your workflows, technical requirements, timeline, and business objectives.</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full">4</div>
                  <h3 className="text-xl font-medium text-black mb-2">Proposal & Roadmap</h3>
                  <p className="text-gray-600 font-light mb-3">You’ll receive a detailed proposal outlining:</p>
                  <ul className="text-gray-500 font-light space-y-1 pl-4 list-disc marker:text-gray-300">
                    <li>Scope</li>
                    <li>Timeline</li>
                    <li>Deliverables</li>
                    <li>Investment</li>
                    <li>Milestones</li>
                  </ul>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-5 h-5 bg-black text-white text-xs flex items-center justify-center rounded-full">5</div>
                  <h3 className="text-xl font-medium text-black mb-2">Development Begins</h3>
                  <p className="text-gray-600 font-light">After proposal approval and initial payment, we begin engineering your solution.</p>
                </div>
              </div>
            </div>

            {/* Who We Work With */}
            <div>
              <h2 className="text-3xl font-light text-black mb-6 border-b border-gray-100 pb-4">Who We Work With</h2>
              <p className="text-gray-600 font-light mb-6">We work with businesses looking for long-term technology partnerships. Ideal projects include:</p>
              <ul className="space-y-3">
                {['Custom Software', 'AI Solutions', 'Enterprise Applications', 'SaaS Products', 'Business Automation', 'Internal Tools'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-light">
                    <CheckCircle className="w-4 h-4 text-black" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Commitment */}
            <div>
              <h2 className="text-3xl font-light text-black mb-6 border-b border-gray-100 pb-4">Our Commitment</h2>
              <p className="text-gray-600 font-light mb-6">Every project includes:</p>
              <ul className="space-y-3">
                {['Dedicated Project Manager', 'Weekly Progress Updates', 'Transparent Milestones', 'Secure Development Process', 'Post-launch Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-light">
                    <CheckCircle className="w-4 h-4 text-black" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </motion.div>

          {/* Right Column: Application Form & Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-7 flex flex-col gap-12 sticky top-32"
          >
            {/* Multi-step Form */}
            <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 border border-gray-100">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 bg-black text-white rounded-2xl p-6 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-light mb-2">Application Received</h3>
                  <p className="font-light text-gray-300">Thank you! Our engineering team will review your enquiry and get back to you shortly.</p>
                </motion.div>
              )}

              {!success && (
                <form onSubmit={handleSubmit} className="flex flex-col min-h-[500px]">
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 mb-10">
                    {[1, 2, 3].map(step => (
                      <div key={step} className={`flex-1 h-1.5 rounded-full ${currentStep >= step ? 'bg-black' : 'bg-gray-200'}`} />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* STEP 1: Basic & Project Info */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6 flex-grow"
                      >
                        <h3 className="text-2xl font-light text-black mb-6">1. Project Information</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full px-5 py-3.5 bg-white border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-black transition-colors font-light`}
                              placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Work Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-5 py-3.5 bg-white border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-black transition-colors font-light`}
                              placeholder="john@company.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Company Name *</label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              className={`w-full px-5 py-3.5 bg-white border ${errors.companyName ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-black transition-colors font-light`}
                              placeholder="Acme Inc."
                            />
                            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-light text-gray-600 mb-2">Website (Optional)</label>
                          <input
                            type="url"
                            name="existingWebsite"
                            value={formData.existingWebsite}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                            placeholder="https://company.com"
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Industry</label>
                            <input
                              type="text"
                              name="industry"
                              value={formData.industry}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                              placeholder="e.g. Finance"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Your Role</label>
                            <input
                              type="text"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                              placeholder="e.g. Founder, CTO"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Company Size</label>
                            <select
                              name="companySize"
                              value={formData.companySize}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                            >
                              <option value="">Select size</option>
                              <option>1-10</option>
                              <option>11-50</option>
                              <option>51-200</option>
                              <option>201-500</option>
                              <option>500+</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: About Your Project */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6 flex-grow"
                      >
                        <h3 className="text-2xl font-light text-black mb-6">2. About Your Project</h3>
                        
                        <div>
                          <label className="block text-sm font-light text-gray-600 mb-2">Describe your project *</label>
                          <textarea
                            name="projectDescription"
                            value={formData.projectDescription}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-5 py-3.5 bg-white border ${errors.projectDescription ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none`}
                            placeholder="What are you looking to build?"
                          />
                          {errors.projectDescription && <p className="text-red-500 text-xs mt-1">{errors.projectDescription}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-light text-gray-600 mb-2">Project Goals</label>
                          <textarea
                            name="projectGoals"
                            value={formData.projectGoals}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none"
                            placeholder="What outcomes are you expecting?"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Current Challenges</label>
                            <textarea
                              name="currentChallenges"
                              value={formData.currentChallenges}
                              onChange={handleChange}
                              rows={2}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Required Features</label>
                            <textarea
                              name="requiredFeatures"
                              value={formData.requiredFeatures}
                              onChange={handleChange}
                              rows={2}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Timeline & Budget */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6 flex-grow"
                      >
                        <h3 className="text-2xl font-light text-black mb-6">3. Details & Confirmation</h3>
                        
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Expected Timeline</label>
                            <select
                              name="timeline"
                              value={formData.timeline}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                            >
                              <option value="">Select timeline</option>
                              <option>As soon as possible</option>
                              <option>1-3 months</option>
                              <option>3-6 months</option>
                              <option>6+ months</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Estimated Budget</label>
                            <select
                              name="estimatedBudget"
                              value={formData.estimatedBudget}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                            >
                              <option value="">Select budget</option>
                              <option>Less than $1,000</option>
                              <option>$1,000 - $5,000</option>
                              <option>$5,000 - $10,000</option>
                              <option>$10,000 - $25,000</option>
                              <option>$25,000+</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-light text-gray-600 mb-2">Preferred Start Date</label>
                            <input
                              type="date"
                              name="preferredStartDate"
                              value={formData.preferredStartDate}
                              onChange={handleChange}
                              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-start pt-1">
                              <input 
                                type="checkbox" 
                                name="doesNotGuarantee"
                                checked={formData.doesNotGuarantee}
                                onChange={handleChange}
                                className="peer sr-only" 
                              />
                              <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-black peer-checked:border-black transition-colors"></div>
                              <CheckCircle className="absolute top-1 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                            </div>
                            <span className="text-gray-600 font-light group-hover:text-black transition-colors">
                              I understand that completing this application does not guarantee project acceptance.
                            </span>
                          </label>
                          {errors.doesNotGuarantee && <p className="text-red-500 text-xs ml-8">{errors.doesNotGuarantee}</p>}

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-start pt-1">
                              <input 
                                type="checkbox" 
                                name="mayContact"
                                checked={formData.mayContact}
                                onChange={handleChange}
                                className="peer sr-only" 
                              />
                              <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-black peer-checked:border-black transition-colors"></div>
                              <CheckCircle className="absolute top-1 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                            </div>
                            <span className="text-gray-600 font-light group-hover:text-black transition-colors">
                              I agree that Pixels Digital Solutions may contact me regarding this enquiry.
                            </span>
                          </label>
                          {errors.mayContact && <p className="text-red-500 text-xs ml-8">{errors.mayContact}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="text-gray-500 hover:text-black font-medium flex items-center gap-2 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : <div></div>}
                    
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-black text-white px-8 py-3.5 rounded-full font-light flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#FFD166] hover:bg-[#F4C455] text-black px-8 py-3.5 rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Submitting...' : 'Submit Application'} <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Contact Details & Map (Relocated Below Form on Desktop/Mobile) */}
            <div className="grid md:grid-cols-2 gap-8 mt-4">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-light text-black mb-6">Contact Us Directly</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="pt-1.5">
                        <p className="text-gray-600 font-light text-sm">8087131777 | 9766504856</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="pt-1.5">
                        <p className="text-gray-600 font-light text-sm">pixelsadvertise@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="pt-1.5">
                        <p className="text-gray-600 font-light text-sm">Akola | Mumbai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-sm h-[300px] border border-gray-100">
                <iframe 
                  src="https://maps.google.com/maps?q=Pixels+Digital+Solutions,+Akola&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps - Pixels Digital Solutions"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
