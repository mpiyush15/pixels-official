'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authorization Error</h1>
          <p className="text-gray-700 mb-4">Error: {error}</p>
          <a
            href="/admin/setup-gdrive"
            className="text-blue-600 underline"
          >
            Go back and try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Authorization Successful!</h1>
        
        {code ? (
          <div>
            <p className="text-gray-700 mb-4">
              Copy this authorization code and paste it in the setup page:
            </p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <code className="text-sm break-all select-all">{code}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                alert('Code copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
            >
              Copy Code
            </button>
            <a
              href="/admin/setup-gdrive"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Setup Page
            </a>
          </div>
        ) : (
          <p className="text-gray-700">No authorization code found in URL.</p>
        )}
      </div>
    </div>
  );
}

export default function GoogleAuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
