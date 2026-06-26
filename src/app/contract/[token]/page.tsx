'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ShieldCheck, ChevronRight, FileText, CheckSquare, Square } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/contract/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProject(data.project);
        } else {
          setError(data.error || 'Failed to load project contract.');
        }
      })
      .catch((err) => setError('Failed to connect to server.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePayment = async () => {
    if (!agreed) return;
    setProcessingPayment(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.paymentSessionId) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // 2. Load Cashfree SDK
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === 'sandbox' ? 'sandbox' : 'production'
      });

      // 3. Initiate Checkout
      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal' as const,
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          console.error('Payment Error:', result.error);
          setProcessingPayment(false);
          alert('Payment failed or was cancelled: ' + result.error.message);
        }
        if (result.redirect) {
          // Cashfree handles redirect
        }
        if (result.paymentDetails) {
          // 4. Verify payment on success
          console.log('Payment completed, verifying...');
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderId: orderData.orderId,
              token: token
            })
          });
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            router.push('/client-portal/login?success=contract_accepted');
          } else {
            alert('Payment verification failed. Please contact support.');
            setProcessingPayment(false);
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during payment.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || project?.contractAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {project?.contractAccepted ? 'Contract Already Accepted' : 'Proposal Expired or Invalid'}
          </h2>
          <p className="text-gray-600 mb-6">
            {project?.contractAccepted 
              ? 'This contract has already been accepted and the project is active. Please log in to your portal to view details.'
              : error}
          </p>
          <button 
            onClick={() => router.push('/client-portal/login')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Client Portal
          </button>
        </div>
      </div>
    );
  }

  // Find the first milestone that isn't completed to get payment amount
  // If no milestones exist, fallback to total budget
  const nextMilestone = project.milestones?.find((m: any) => m.status !== 'completed');
  const amountToPay = nextMilestone ? (nextMilestone.amount || 0) : (project.budget || 0);
  const paymentDescription = nextMilestone ? `Advance for ${nextMilestone.name}` : 'Project Advance Payment';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Project Proposal & Contract</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Review the project details and complete the initial payment to begin.
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{project.projectName}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Prepared for {project.clientName}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 block">Total Budget</span>
              <span className="text-2xl font-bold text-indigo-600">₹{project.budget?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Project Scope
            </h4>
            <div className="prose prose-indigo max-w-none text-gray-600 bg-gray-50 p-4 rounded-md mb-6">
              {project.description || 'No description provided.'}
            </div>

            {project.milestones && project.milestones.length > 0 && (
              <>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Milestones & Payments</h4>
                <div className="border border-gray-200 rounded-md divide-y divide-gray-200 mb-6">
                  {project.milestones.map((milestone: any, index: number) => (
                    <div key={index} className={`p-4 flex justify-between items-center ${index === 0 ? 'bg-indigo-50' : 'bg-white'}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{milestone.name}</p>
                        <p className="text-xs text-gray-500">Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{milestone.amount?.toLocaleString('en-IN') || 0}</p>
                        {index === 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">Due Now</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terms and Payment Section */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Terms & Initial Payment</h3>
            
            <div className="bg-white p-6 border border-gray-200 rounded-md mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md h-64 overflow-y-auto mb-4 text-sm text-gray-600 whitespace-pre-wrap">
                {project.agreementText || 'Standard terms and conditions apply. Please refer to the official proposal document.'}
              </div>
            </div>

            <div 
              className="flex items-start mb-6 cursor-pointer"
              onClick={() => setAgreed(!agreed)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {agreed ? (
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700 cursor-pointer">
                  I agree to the terms and conditions and authorize the payment
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Amount Due Now</p>
                <p className="text-2xl font-bold text-gray-900">₹{amountToPay.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{paymentDescription}</p>
              </div>
              
              <button
                disabled={!agreed || processingPayment}
                onClick={handlePayment}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  agreed && !processingPayment ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Pay & Start Project
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 flex justify-center items-center text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
              Secured by Cashfree Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
