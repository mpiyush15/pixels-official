'use client';

import { FileText, Image as ImageIcon, Film, FileArchive, File } from 'lucide-react';

interface FileThumbnailProps {
  file: {
    name: string;
    url: string;
    key: string;
    size: number;
  };
  onClick: () => void;
}

export default function FileThumbnail({ file, onClick }: FileThumbnailProps) {
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

  const getIcon = () => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-purple-600" />;
      case 'video':
        return <Film className="h-8 w-8 text-red-600" />;
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'spreadsheet':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'archive':
        return <FileArchive className="h-8 w-8 text-orange-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Thumbnail or Icon */}
      {fileType === 'image' ? (
        <div className="w-24 h-24 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden">
            {getIcon()}
          </div>
        </div>
      ) : (
        <div className="w-24 h-24 mb-3 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
          {getIcon()}
        </div>
      )}

      {/* File Info */}
      <p className="text-sm font-medium text-gray-900 text-center line-clamp-2 w-full mb-1">
        {file.name}
      </p>
      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}
