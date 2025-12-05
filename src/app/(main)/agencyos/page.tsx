'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Users, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  BarChart3,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Star,
  DollarSign,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function AgencyOSLanding() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Centralize all client information, communication history, and project details in one place."
    },
    {
      icon: FileText,
      title: "Project Tracking",
      description: "Track project progress, milestones, and deliverables with intuitive kanban boards."
    },
    {
      icon: CreditCard,
      title: "Invoice & Payments",
      description: "Generate professional invoices, track payments, and manage your cash flow effortlessly."
    },
    {
      icon: BarChart3,
      title: "Financial Analytics",
      description: "Get real-time insights into revenue, expenses, profit margins, and business health."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track billable hours, monitor team productivity, and generate accurate timesheets."
    },
    {
      icon: MessageSquare,
      title: "Client Portal",
      description: "Give clients secure access to their projects, files, invoices, and communication."
    },
    {
      icon: DollarSign,
      title: "Expense Management",
      description: "Track business expenses, vendor payments, and maintain complete financial records."
    },
    {
      icon: Calendar,
      title: "Team Management",
      description: "Manage staff, assign tasks, track work submissions, and handle payroll seamlessly."
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "999",
      description: "Perfect for freelancers and small agencies",
      features: [
        "5 Active Clients",
        "10 Active Projects",
        "Unlimited Invoices",
        "Client Portal Access",
        "Basic Analytics",
        "Email Support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "2,499",
      description: "For growing agencies with more clients",
      features: [
        "25 Active Clients",
        "50 Active Projects",
        "Unlimited Invoices",
        "Advanced Analytics",
        "Team Collaboration",
        "Priority Support",
        "Custom Branding"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Agency",
      price: "4,999",
      description: "For established agencies scaling up",
      features: [
        "100 Active Clients",
        "200 Active Projects",
        "Unlimited Everything",
        "Advanced Reports",
        "API Access",
        "Dedicated Support",
        "White Label Option"
      ],
      cta: "Start Free Trial",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Founder, DesignCraft Studio",
      content: "AgencyOS transformed how we manage our agency. We've reduced admin time by 60% and our client satisfaction has never been higher.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "CEO, WebWorks Agency",
      content: "The financial analytics alone are worth the price. We finally have complete visibility into our profitability and cash flow.",
      rating: 5
    },
    {
      name: "Amit Kumar",
      role: "Owner, Creative Solutions",
      content: "Client portal is a game-changer. Our clients love having 24/7 access to their projects and we've eliminated so many back-and-forth emails.",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Agencies Trust Us" },
    { number: "50K+", label: "Projects Managed" },
    { number: "₹100Cr+", label: "Revenue Tracked" },
    { number: "99.9%", label: "Uptime Guaranteed" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgencyOS
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition">Sign In</button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-600">Trusted by 500+ Agencies in India</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Complete
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Agency Management
              </span>
              Platform
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Run your entire agency from one powerful platform. Manage clients, projects, finances, 
              and team collaboration with ease. Save 20+ hours every week on admin work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition">
                Watch Demo Video
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 z-10"></div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 h-[500px]">
                {/* Mock Dashboard UI */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Revenue", value: "₹24.5L", change: "+12.5%" },
                    { label: "Active Projects", value: "47", change: "+8%" },
                    { label: "Active Clients", value: "23", change: "+15%" },
                    { label: "This Month", value: "₹4.2L", change: "+18%" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                      <div className="text-white text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-green-400 text-xs">{stat.change}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <div className="text-white font-semibold mb-4">Revenue Overview</div>
                    <div className="flex items-end space-x-2 h-40">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 95, 75, 88, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <div className="text-white font-semibold mb-4">Recent Activity</div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1 h-2 bg-white/20 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Your Agency Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling multiple tools. AgencyOS brings all your agency operations into one seamless platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your agency. All plans include 14-day free trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center">
                    <span className="text-gray-500 text-lg">₹</span>
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Agency Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what agency owners are saying about AgencyOS
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 500+ agencies who have saved thousands of hours and scaled their business with AgencyOS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition">
                Schedule a Demo
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-6">
              No credit card required • 14-day free trial • Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AgencyOS</span>
              </div>
              <p className="text-sm">
                The complete agency management platform built for Indian agencies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Updates</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms-conditions" className="hover:text-white transition">Terms</Link></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 AgencyOS. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
