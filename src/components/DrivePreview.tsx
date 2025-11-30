"use client";

import { useState, useEffect } from 'react';
import { Play, FileText, Image as ImageIcon, File, ExternalLink } from 'lucide-react';

interface DrivePreviewProps {
  driveLink: string;
  title?: string;
  className?: string;
}

export default function DrivePreview({ driveLink, title, className = '' }: DrivePreviewProps) {
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image' | 'document' | 'unknown'>('unknown');

  useEffect(() => {
    // Extract file ID from various Google Drive URL formats
    const extractFileId = (url: string): string | null => {
      // Format 1: https://drive.google.com/file/d/FILE_ID/view
      let match = url.match(/\/file\/d\/([^\/]+)/);
      if (match) return match[1];

      // Format 2: https://drive.google.com/open?id=FILE_ID
      match = url.match(/[?&]id=([^&]+)/);
      if (match) return match[1];

      // Format 3: https://drive.google.com/uc?id=FILE_ID
      match = url.match(/uc\?id=([^&]+)/);
      if (match) return match[1];

      return null;
    };

    const id = extractFileId(driveLink);
    setFileId(id);

    // Try to detect file type from URL or extension
    if (driveLink.includes('video') || driveLink.includes('.mp4') || driveLink.includes('.mov')) {
      setFileType('video');
    } else if (driveLink.includes('image') || driveLink.includes('.jpg') || driveLink.includes('.png')) {
      setFileType('image');
    } else if (driveLink.includes('document') || driveLink.includes('.pdf') || driveLink.includes('.doc')) {
      setFileType('document');
    }
  }, [driveLink]);

  if (!fileId) {
    return (
      <div className={`bg-gray-100 rounded-xl p-6 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Invalid Drive link</p>
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-flex items-center gap-1"
          >
            Open link <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const directUrl = `https://drive.google.com/file/d/${fileId}/view`;

  const getIcon = () => {
    switch (fileType) {
      case 'video':
        return <Play className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  return (
    <div className={`bg-gray-50 rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            {getIcon()}
            <span className="font-medium">{title}</span>
          </div>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            Open in Drive <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
      
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={previewUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
          loading="lazy"
        />
      </div>
    </div>
  );
}
