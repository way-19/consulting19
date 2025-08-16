import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertTriangle, CheckCircle, Eye, Download, Trash2 } from 'lucide-react';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  existingFiles?: UploadedFile[];
  onExistingFileRemove?: (fileId: string) => void;
  onExistingFileView?: (file: UploadedFile) => void;
  uploadProgress?: Record<string, number>;
  dragDropText?: string;
  browseText?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 50, // 50MB default
  maxFiles = 10,
  multiple = true,
  disabled = false,
  className = '',
  showPreview = true,
  existingFiles = [],
  onExistingFileRemove,
  onExistingFileView,
  uploadProgress = {},
  dragDropText = 'Drag and drop files here, or click to browse',
  browseText = 'Browse Files'
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return mimeType.startsWith(baseType);
      }
      return mimeType === type;
    });

    if (!isAccepted) {
      return `File type "${fileExtension}" is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: File[] = [];
    const newErrors: string[] = [];

    // Check total file count
    const totalFiles = selectedFiles.length + existingFiles.length + files.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed. You're trying to add ${files.length} more files.`);
      setErrors(newErrors);
      return;
    }

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        newFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : [newFiles[0]];
      setSelectedFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }
  }, [selectedFiles, existingFiles, maxFiles, maxFileSize, acceptedTypes, multiple, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeSelectedFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
    if (onFileRemove) {
      onFileRemove(index);
    }
  };

  const getFileIcon = (file: File | UploadedFile) => {
    const type = file.type || file.name.split('.').pop()?.toLowerCase();
    
    if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type as string)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (type === 'application/pdf' || type === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc', 'docx'].includes(type as string)) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 cursor-pointer'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            dragActive ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 ${
              dragActive ? 'text-purple-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className={`text-lg font-medium ${
              dragActive ? 'text-purple-900' : 'text-gray-900'
            }`}>
              {dragDropText}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Up to {maxFiles} files
            </p>
          </div>
          
          <button
            type="button"
            disabled={disabled}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Upload className="h-5 w-5" />
            <span>{browseText}</span>
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h4 className="font-medium text-red-900">Upload Errors</h4>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files Preview */}
      {showPreview && selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={getImagePreview(file)}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  {uploadProgress[file.name] !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadProgress[file.name]}% uploaded</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeSelectedFile(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Existing Files ({existingFiles.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {existingFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {onExistingFileView && (
                    <button
                      onClick={() => onExistingFileView(file)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View file"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {onExistingFileRemove && (
                    <button
                      onClick={() => onExistingFileRemove(file.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Guidelines */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="font-medium text-gray-900 mb-2">File Upload Guidelines</h5>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Supported formats: {acceptedTypes.join(', ')}</p>
          <p>• Maximum file size: {maxFileSize}MB per file</p>
          <p>• Maximum files: {maxFiles} files total</p>
          <p>• For best results, use high-quality images and clear document scans</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;