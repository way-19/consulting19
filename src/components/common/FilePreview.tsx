import React, { useState } from 'react';
import { Eye, Download, Trash2, X, ZoomIn, ZoomOut, RotateCw, Share2, Edit, FileText, Image, File } from 'lucide-react';
import { UploadedFile } from './FileUpload';

export interface FilePreviewProps {
  file: UploadedFile;
  onClose?: () => void;
  onDelete?: (fileId: string) => void;
  onEdit?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
  showActions?: boolean;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  onDelete,
  onEdit,
  onShare,
  showActions = true,
  className = ''
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isDocument = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) ||
                   ['doc', 'docx'].includes(file.name.split('.').pop()?.toLowerCase() || '');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const getFileIcon = () => {
    if (isImage) return <Image className="h-16 w-16 text-blue-500" />;
    if (isPDF) return <FileText className="h-16 w-16 text-red-500" />;
    if (isDocument) return <FileText className="h-16 w-16 text-blue-500" />;
    return <File className="h-16 w-16 text-gray-500" />;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-xs">{file.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative">
        {isImage ? (
          <div className="p-6">
            <div className="relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center min-h-96">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-96 object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  filter: loading ? 'blur(4px)' : 'none'
                }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>
            
            {/* Image Controls */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600 px-3">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={handleRotate}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : isPDF ? (
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">PDF Document</h4>
              <p className="text-sm text-gray-600 mb-4">
                Click the download button to view this PDF document
              </p>
              <button
                onClick={handleDownload}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              {getFileIcon()}
              <h4 className="font-medium text-gray-900 mb-2 mt-4">Document File</h4>
              <p className="text-sm text-gray-600 mb-4">
                This file type cannot be previewed. Click download to view the file.
              </p>
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              
              {onShare && (
                <button
                  onClick={() => onShare(file.id)}
                  className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(file.id)}
                  className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                    onDelete(file.id);
                  }
                }}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;