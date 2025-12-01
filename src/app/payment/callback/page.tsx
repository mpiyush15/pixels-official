'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      setStatus('failed');
      setMessage('Invalid payment session');
      return;
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/cashfree/verify-payment?order_id=${orderId}`);
        const data = await response.json();

        if (data.success && data.order_status === 'PAID') {
          setStatus('success');
          setMessage('Payment successful! Your subscription is now active.');
          setOrderDetails(data);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support if amount was deducted.');
        }
      } catch (error) {
        setStatus('failed');
        setMessage('Failed to verify payment. Please contact support.');
      }
    };

    // Wait for payment to process
    setTimeout(() => {
      verifyPayment();
    }, 2000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Loader2 className="w-20 h-20 text-black" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-3xl font-light text-black mb-4">
              Processing Payment
            </h2>
            <p className="text-gray-600 font-light">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2} />
              </div>
            </motion.div>
            <h2 className="text-3xl font-light text-black mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 font-light mb-8">
              {message}
            </p>
            {orderDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <p className="text-sm text-gray-500 font-light mb-2">Order ID</p>
                <p className="text-black font-light mb-4 break-all">{orderDetails.order_id}</p>
                <p className="text-sm text-gray-500 font-light mb-2">Amount Paid</p>
                <p className="text-2xl text-black font-light">₹{orderDetails.order_amount?.toLocaleString()}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="w-full bg-black text-white py-4 rounded-xl font-light flex items-center justify-center gap-2"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          </>
        )}

        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" strokeWidth={2} />
              </div>
            </motion.div>
            <h2 className="text-3xl font-light text-black mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 font-light mb-8">
              {message}
            </p>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/services')}
                className="w-full bg-black text-white py-4 rounded-xl font-light"
              >
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/contact')}
                className="w-full bg-gray-100 text-black py-4 rounded-xl font-light"
              >
                Contact Support
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
