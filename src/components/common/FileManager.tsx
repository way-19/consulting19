import React, { useState, useEffect } from 'react';
import { Folder, File, Image, FileText, Download, Trash2, Eye, Plus, Search, Filter, Grid, List, Upload, RefreshCw } from 'lucide-react';
import FileUpload, { UploadedFile } from './FileUpload';
import FilePreview from './FilePreview';
import { useFileUpload } from '../../hooks/useFileUpload';
import { getPublicImageUrl } from '../../lib/supabase';

export interface FileManagerProps {
  files: UploadedFile[];
  onFileUpload?: (files: File[]) => Promise<void>;
  onFileDelete?: (fileId: string) => Promise<void>;
  onFileView?: (file: UploadedFile) => void;
  onRefresh?: () => Promise<void>;
  allowUpload?: boolean;
  allowDelete?: boolean;
  viewMode?: 'grid' | 'list';
  bucketName?: string;
  folder?: string;
  className?: string;
  title?: string;
  emptyStateText?: string;
}

const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileUpload,
  onFileDelete,
  onFileView,
  onRefresh,
  allowUpload = true,
  allowDelete = true,
  viewMode: initialViewMode = 'grid',
  bucketName = 'documents',
  folder = 'client_documents',
  className = '',
  title = 'File Manager',
  emptyStateText = 'No files uploaded yet'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { uploadMultipleFiles, uploadState, clearUploadState } = useFileUpload({
    bucketName,
    folder,
    onUploadComplete: async (file, filePath) => {
      console.log('File uploaded successfully:', file.name, filePath);
      if (onRefresh) {
        await onRefresh();
      }
    },
    onUploadError: (file, error) => {
      console.error('Upload error for', file.name, ':', error);
    }
  });

  const fileTypes = [
    { value: 'all', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'document', label: 'Documents' },
    { value: 'pdf', label: 'PDF Files' }
  ];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (typeFilter !== 'all') {
      switch (typeFilter) {
        case 'image':
          matchesType = file.type.startsWith('image/');
          break;
        case 'document':
          matchesType = file.type.includes('word') || file.type.includes('document') || 
                      file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
          break;
        case 'pdf':
          matchesType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          break;
      }
    }
    
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (selectedFiles: File[]) => {
    try {
      setLoading(true);
      if (onFileUpload) {
        await onFileUpload(selectedFiles);
      } else {
        await uploadMultipleFiles(selectedFiles);
      }
      setShowUploadModal(false);
      clearUploadState();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      setLoading(true);
      if (onFileDelete) {
        await onFileDelete(fileId);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileView = (file: UploadedFile) => {
    if (onFileView) {
      onFileView(file);
    } else {
      setSelectedFile(file);
      setShowPreviewModal(true);
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {fileTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}

          {allowUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
            </div>
            <File className="h-6 w-6 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-blue-600">
                {files.filter(f => f.type.startsWith('image/')).length}
              </p>
            </div>
            <Image className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-green-600">
                {files.filter(f => !f.type.startsWith('image/')).length}
              </p>
            </div>
            <FileText className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
              </p>
            </div>
            <Folder className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
          <p className="text-gray-600 mb-6">{emptyStateText}</p>
          {allowUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Upload First File
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              {/* File Preview */}
              <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="text-center">
                    {getFileIcon(file)}
                    <p className="text-sm text-gray-600 mt-2">{file.type}</p>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFileView(file)}
                      className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    {allowDelete && (
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 truncate mb-1">{file.name}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">Type</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Upload Date</div>
              <div className="col-span-3">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    {getFileIcon(file)}
                  </div>
                  
                  <div className="col-span-4">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-600">{file.type}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-gray-900">{formatFileSize(file.size)}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-gray-900">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(file.uploadedAt).toLocaleTimeString()}</p>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFileView(file)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {allowDelete && (
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload Files</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    clearUploadState();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <FileUpload
                onFileSelect={handleFileUpload}
                acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
                maxFileSize={50}
                maxFiles={10}
                multiple={true}
                uploadProgress={uploadState.progress}
                dragDropText="Drag and drop your files here"
                browseText="Choose Files"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FilePreview
              file={selectedFile}
              onClose={() => setShowPreviewModal(false)}
              onDelete={allowDelete ? handleFileDelete : undefined}
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;