'use client';

import { motion } from 'framer-motion';
import { RefreshCw, XCircle, CheckCircle, Clock, CreditCard, AlertTriangle, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
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
              <RefreshCw className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-light text-black mb-6 tracking-tight">
            Refund <span className="font-thin">Policy</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
            Our policy on refunds and cancellations
          </p>
          <p className="text-sm text-gray-500 font-light mt-4">
            Last Updated: December 1, 2024
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 bg-red-50 border-2 border-red-200 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-light text-black mb-3">Important Notice</h3>
                <p className="text-gray-700 font-light leading-relaxed text-lg">
                  <strong>No refunds are available if services are cancelled within 7 days after payment.</strong> As we operate on a prepaid subscription model, all payments are final once services have commenced or been delivered.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-12">
            {/* Section 1: Prepaid Subscription Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  1. Prepaid Subscription Services
                </h2>
              </div>
              <p className="text-gray-600 font-light leading-relaxed text-lg pl-16">
                Pixels Digital Solutions operates on a prepaid subscription model. This means that all our services require payment in advance before service delivery begins. Once payment is received and services have commenced, all sales are considered final.
              </p>
            </motion.div>

            {/* Section 2: No Refund Policy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  2. No Refund After 7 Days
                </h2>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-gray-600 font-light leading-relaxed text-lg">
                  <strong className="text-black">No refunds will be issued if services are cancelled within 7 days after payment has been made.</strong> This policy applies to all our service offerings including but not limited to:
                </p>
                <ul className="space-y-2 text-gray-600 font-light text-lg">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>Social Media Marketing Plans (Starter, Professional, Enterprise)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>Website Development Projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>Video Content Creation Services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>SEO and Digital Marketing Services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>All other prepaid subscription services</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Section 3: Exceptional Circumstances */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  3. Exceptional Circumstances
                </h2>
              </div>
              <p className="text-gray-600 font-light leading-relaxed text-lg pl-16">
                Refunds may be considered on a case-by-case basis only in exceptional circumstances, such as technical failures on our part that prevent service delivery, or if we are unable to fulfill the agreed-upon services. Any such requests must be submitted in writing and will be evaluated at our sole discretion.
              </p>
            </motion.div>

            {/* Section 4: Refund Processing Time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  4. Refund Processing Timeline
                </h2>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-gray-600 font-light leading-relaxed text-lg">
                  In the rare event that a refund is approved after cancellation, the refund amount will be processed and credited back to your original payment method within <strong className="text-black">7-14 working days</strong> from the date of cancellation approval.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <p className="text-gray-700 font-light text-base">
                    <strong className="text-black">Please Note:</strong> The actual time it takes for the refund to reflect in your account may vary depending on your bank or payment provider's processing times.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Section 5: Cancellation Process */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  5. How to Request Cancellation
                </h2>
              </div>
              <div className="pl-16 space-y-4">
                <p className="text-gray-600 font-light leading-relaxed text-lg">
                  If you wish to cancel your service, please contact us via:
                </p>
                <ul className="space-y-2 text-gray-600 font-light text-lg">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>Email: <a href="mailto:info@pixelsdigital.tech" className="text-black hover:underline">info@pixelsdigital.tech</a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>Phone: <a href="tel:+919766504856" className="text-black hover:underline">+91 976-650-4856</a></span>
                  </li>
                </ul>
                <p className="text-gray-600 font-light leading-relaxed text-lg">
                  Please include your order/invoice number, service details, and reason for cancellation in your request.
                </p>
              </div>
            </motion.div>

            {/* Section 6: Service Modifications */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                  6. Service Plan Changes
                </h2>
              </div>
              <p className="text-gray-600 font-light leading-relaxed text-lg pl-16">
                If you wish to upgrade or modify your service plan, please contact our team. Upgrades can typically be accommodated with a pro-rated payment adjustment. Downgrades may be subject to the same no-refund policy stated above.
              </p>
            </motion.div>
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-black text-white rounded-2xl p-12 text-center"
          >
            <h3 className="text-3xl font-light mb-4">Questions About Our Refund Policy?</h3>
            <p className="text-gray-300 font-light mb-8 text-lg">
              If you have any questions or concerns about our refund policy, please don't hesitate to contact us.
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

          {/* Summary Box */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-8"
          >
            <h4 className="text-2xl font-light text-black mb-4">Policy Summary</h4>
            <ul className="space-y-3 text-gray-700 font-light text-base">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>NO refunds</strong> if cancelled within 7 days after payment</span>
              </li>
              <li className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span>Prepaid subscription services - payment required in advance</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>If approved, refunds processed in <strong>7-14 working days</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Exceptional circumstances reviewed case-by-case</span>
              </li>
            </ul>
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
