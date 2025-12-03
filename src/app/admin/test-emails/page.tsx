'use client';

import { useState } from 'react';

export default function TestEmailsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; success: boolean; message: string } | null>(null);

  const sendTestEmail = async (testType: string) => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, testType })
      });

      const data = await response.json();
      
      setResult({
        type: testType,
        success: data.success,
        message: data.success ? 'Email sent successfully!' : data.error || 'Failed to send email'
      });
    } catch (error: any) {
      setResult({
        type: testType,
        success: false,
        message: error.message || 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📧 Email Testing Dashboard</h1>
        <p className="text-gray-600">Test all email templates and configurations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block mb-2 font-medium">Test Email Address</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {result && (
        <div className={`p-4 rounded-lg mb-6 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{result.type}:</strong> {result.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => sendTestEmail('Welcome Email')}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎉 Test Welcome Email
        </button>

        <button
          onClick={() => sendTestEmail('Login Alert')}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔐 Test Login Alert
        </button>

        <button
          onClick={() => sendTestEmail('Password Reset')}
          disabled={loading}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔑 Test Password Reset
        </button>

        <button
          onClick={() => sendTestEmail('Payment Confirmation')}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💰 Test Payment Confirmation
        </button>

        <button
          onClick={() => sendTestEmail('Payment Reminder')}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏰ Test Payment Reminder
        </button>

        <button
          onClick={() => sendTestEmail('Invoice')}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📄 Test Invoice Email
        </button>

        <button
          onClick={() => sendTestEmail('Project Update')}
          disabled={loading}
          className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 Test Project Update
        </button>

        <button
          onClick={() => sendTestEmail('Basic Configuration')}
          disabled={loading}
          className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⚙️ Test Basic Email
        </button>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-3 text-blue-900">📝 Setup Instructions</h2>
        <ol className="space-y-2 text-sm text-blue-800">
          <li><strong>1.</strong> Get Resend API key from <a href="https://resend.com" target="_blank" className="underline">resend.com</a></li>
          <li><strong>2.</strong> Add <code className="bg-blue-100 px-2 py-1 rounded">RESEND_API_KEY</code> to your environment variables</li>
          <li><strong>3.</strong> Add <code className="bg-blue-100 px-2 py-1 rounded">EMAIL_FROM=noreply@pixelsdigital.tech</code></li>
          <li><strong>4.</strong> Enter your email above and click any test button</li>
          <li><strong>5.</strong> Check your inbox for the test email</li>
        </ol>
      </div>

      <div className="mt-6 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-lg font-semibold mb-3 text-yellow-900">⚠️ Current Status</h2>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>✅ Email templates created</li>
          <li>✅ Email service integrated</li>
          <li>✅ Auto-send on login, payment, client creation</li>
          <li>🟡 Waiting for Resend API key configuration</li>
          <li>🟡 AWS SES waiting for production access</li>
        </ul>
      </div>
    </div>
  );
}
