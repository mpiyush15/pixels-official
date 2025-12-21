'use client';

import { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, Film, FileArchive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilePreviewModalProps {
  file: {
    name: string;
    url: string;
    key: string;
    size: number;
  };
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false);

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '')) return 'video';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'spreadsheet';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return 'archive';
    
    return 'other';
  };

  const fileType = getFileType(file.name);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{file.name}</h3>
              <p className="text-sm text-purple-100">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <a
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
            {fileType === 'image' && !imageError ? (
              <div className="flex items-center justify-center">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : fileType === 'video' ? (
              <div className="flex items-center justify-center">
                <video
                  controls
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  src={file.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : fileType === 'pdf' ? (
              <iframe
                src={file.url}
                className="w-full h-[70vh] rounded-lg border-2 border-gray-200"
                title={file.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-6 bg-gray-100 rounded-full mb-4">
                  {fileType === 'document' && <FileText className="h-16 w-16 text-blue-600" />}
                  {fileType === 'spreadsheet' && <FileText className="h-16 w-16 text-green-600" />}
                  {fileType === 'archive' && <FileArchive className="h-16 w-16 text-orange-600" />}
                  {fileType === 'other' && <FileText className="h-16 w-16 text-gray-600" />}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{file.name}</h4>
                <p className="text-gray-600 mb-6">Preview not available for this file type</p>
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download File</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
