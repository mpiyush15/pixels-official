'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Successfully logged in, redirect to dashboard
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-black mb-2">Pixels Digital</h1>
          <p className="text-gray-500 font-light">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-light text-black mb-2">Welcome back</h2>
            <p className="text-gray-500 text-sm font-light">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-light mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 text-black focus:outline-none focus:border-gray-400 transition-colors font-light placeholder-gray-400 shadow-sm"
                  placeholder="admin@pixelsdigitalsolutions.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-light mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 text-black focus:outline-none focus:border-gray-400 transition-colors font-light placeholder-gray-400 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-light"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#B270FF] text-white py-3 rounded-xl font-light flex items-center justify-center gap-2 hover:bg-[#9d55f0] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" strokeWidth={1.5} />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/admin/forgot-password"
                className="text-gray-500 hover:text-black text-sm font-light transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm font-light mt-8">
          © {new Date().getFullYear()} Pixels Digital. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
