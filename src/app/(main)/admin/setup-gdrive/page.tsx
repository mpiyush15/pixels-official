'use client';

import { useState } from 'react';

export default function SetupGoogleDrive() {
  const [authUrl, setAuthUrl] = useState('');
  const [code, setCode] = useState('');
  const [tokens, setTokens] = useState<any>(null);

  const getAuthUrl = async () => {
    const response = await fetch('/api/google-drive/auth-url');
    const data = await response.json();
    setAuthUrl(data.url);
  };

  const exchangeCode = async () => {
    const response = await fetch('/api/google-drive/exchange-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    setTokens(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google Drive Setup</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Step 1: Get Authorization URL</h2>
          <button
            onClick={getAuthUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Auth URL
          </button>
          
          {authUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Click this link to authorize:</p>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {authUrl}
              </a>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Step 2: Enter Authorization Code</h2>
          <p className="text-sm text-gray-600 mb-4">
            After authorizing, Google will redirect you. Copy the "code" parameter from the URL.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste authorization code here"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />
          <button
            onClick={exchangeCode}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Exchange Code for Tokens
          </button>
        </div>

        {tokens && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Step 3: Save These Tokens</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add these to your .env.local file:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
GOOGLE_ACCESS_TOKEN=${tokens.access_token}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
