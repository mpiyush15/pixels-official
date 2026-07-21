'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending upload request...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test File Upload</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block mb-4">
          <span className="text-sm font-medium mb-2 block">Choose a file to upload:</span>
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 disabled:opacity-50"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
        </label>

        {uploading && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Uploading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">✓ Upload Successful!</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">File Name:</span>
                <span className="ml-2 text-gray-700">{result.fileName}</span>
              </div>
              <div>
                <span className="font-medium">File Size:</span>
                <span className="ml-2 text-gray-700">{(result.fileSize / 1024).toFixed(2)} KB</span>
              </div>
              <div>
                <span className="font-medium">File Type:</span>
                <span className="ml-2 text-gray-700">{result.fileType}</span>
              </div>
              <div>
                <span className="font-medium">S3 Key:</span>
                <span className="ml-2 text-gray-700 break-all">{result.fileKey}</span>
              </div>
              {result.fileUrl && (
                <div>
                  <span className="font-medium">Download URL:</span>
                  <div className="mt-1">
                    <a
                      href={result.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Open File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Make sure you're logged in as admin</li>
          <li>Choose a file (PDF, Word, Excel, Image, or Text)</li>
          <li>Check browser console (F12) for detailed logs</li>
          <li>Check server logs for S3 upload details</li>
          <li>If successful, click "Open File" to verify</li>
        </ol>
      </div>
    </div>
  );
}
