import { useState, useCallback } from 'react';
import { uploadFileToStorage, validateFileUpload, deleteFileFromStorage } from '../lib/supabase';

export interface UseFileUploadOptions {
  bucketName?: string;
  folder?: string;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  allowedExtensions?: string[];
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (file: File, progress: number) => void;
  onUploadComplete?: (file: File, filePath: string) => void;
  onUploadError?: (file: File, error: string) => void;
}

export interface UploadState {
  uploading: boolean;
  progress: Record<string, number>;
  errors: Record<string, string>;
  completed: Record<string, string>; // filename -> filePath
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    bucketName = 'public_images',
    folder = 'uploads',
    maxFileSize = 50,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError
  } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: {},
    errors: {},
    completed: {}
  });

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    // Validate file
    const validation = validateFileUpload(file, {
      maxSize: maxFileSize * 1024 * 1024,
      allowedTypes,
      allowedExtensions
    });

    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      setUploadState(prev => ({
        ...prev,
        errors: { ...prev.errors, [file.name]: errorMessage }
      }));
      onUploadError?.(file, errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setUploadState(prev => ({
        ...prev,
        uploading: true,
        progress: { ...prev.progress, [file.name]: 0 },
        errors: { ...prev.errors, [file.name]: '' }
      }));

      onUploadStart?.(file);

      // Simulate progress updates (in real implementation, this would come from upload progress)
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          const currentProgress = prev.progress[file.name] || 0;
          if (currentProgress < 90) {
            const newProgress = Math.min(currentProgress + Math.random() * 30, 90);
            onUploadProgress?.(file, newProgress);
            return {
              ...prev,
              progress: { ...prev.progress, [file.name]: newProgress }
            };
          }
          return prev;
        });
      }, 200);

      // Upload file
      const filePath = await uploadFileToStorage(file, folder, bucketName);

      // Complete progress
      clearInterval(progressInterval);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: { ...prev.progress, [file.name]: 100 },
        completed: { ...prev.completed, [file.name]: filePath }
      }));

      onUploadComplete?.(file, filePath);
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        errors: { ...prev.errors, [file.name]: errorMessage }
      }));
      onUploadError?.(file, errorMessage);
      throw error;
    }
  }, [bucketName, folder, maxFileSize, allowedTypes, allowedExtensions, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]);

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const results: string[] = [];
    
    for (const file of files) {
      try {
        const filePath = await uploadFile(file);
        results.push(filePath);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    return results;
  }, [uploadFile]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      await deleteFileFromStorage(filePath, bucketName);
      
      // Remove from completed files
      setUploadState(prev => {
        const newCompleted = { ...prev.completed };
        Object.keys(newCompleted).forEach(fileName => {
          if (newCompleted[fileName] === filePath) {
            delete newCompleted[fileName];
          }
        });
        return { ...prev, completed: newCompleted };
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }, [bucketName]);

  const clearUploadState = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: {},
      errors: {},
      completed: {}
    });
  }, []);

  const removeFileFromState = useCallback((fileName: string) => {
    setUploadState(prev => {
      const newState = { ...prev };
      delete newState.progress[fileName];
      delete newState.errors[fileName];
      delete newState.completed[fileName];
      return newState;
    });
  }, []);

  return {
    uploadState,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    clearUploadState,
    removeFileFromState,
    isUploading: uploadState.uploading,
    hasErrors: Object.values(uploadState.errors).some(error => error.length > 0),
    completedUploads: Object.keys(uploadState.completed).length
  };
};

export default useFileUpload;