import api from '../utils/apiClient';

export interface FileUploadProgress {
  file_name: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  file_size?: number;
  chunks_processed?: number;
  processing_time?: number;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  processed_files: Array<{
    file_name: string;
    chunks_processed: number;
    file_size: number;
    processing_time: number;
    file_type: string;
  }>;
  failed_files: Array<{
    file_name: string;
    error: string;
    file_size: number;
  }>;
  total_processed: number;
  total_failed: number;
  total_files: number;
  message: string;
}

class FileUploadService {
  /**
   * Upload files to a tutor's knowledge base with progress feedback
   */
  async uploadKnowledgeBaseFiles(
    tutorId: string, 
    files: File[], 
    onProgress?: (progress: FileUploadProgress[]) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    
    // Add all files to form data
    files.forEach(file => {
      formData.append('files', file);
    });

    // Initialize progress tracking
    const progress: FileUploadProgress[] = files.map(file => ({
      file_name: file.name,
      status: 'uploading',
      progress: 0,
      message: 'Preparing upload...',
      file_size: file.size
    }));

    // Update progress callback
    if (onProgress) {
      onProgress([...progress]);
    }

    try {
      // Upload files
      const response = await api.post(`/api/tutors/${tutorId}/knowledge-base/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            
            // Update all files with upload progress
            progress.forEach(p => {
              p.status = 'uploading';
              p.progress = uploadProgress;
              p.message = `Uploading... ${uploadProgress}%`;
            });

            if (onProgress) {
              onProgress([...progress]);
            }
          }
        }
      });

      const result = response.data;

      // Update progress with processing results
      if (result.success) {
        // Update successful files
        result.processed_files.forEach((processedFile: any) => {
          const progressItem = progress.find(p => p.file_name === processedFile.file_name);
          if (progressItem) {
            progressItem.status = 'completed';
            progressItem.progress = 100;
            progressItem.message = `Processed ${processedFile.chunks_processed} chunks`;
            progressItem.chunks_processed = processedFile.chunks_processed;
            progressItem.processing_time = processedFile.processing_time;
          }
        });

        // Update failed files
        result.failed_files.forEach((failedFile: any) => {
          const progressItem = progress.find(p => p.file_name === failedFile.file_name);
          if (progressItem) {
            progressItem.status = 'failed';
            progressItem.progress = 0;
            progressItem.message = `Failed: ${failedFile.error}`;
            progressItem.error = failedFile.error;
          }
        });

        if (onProgress) {
          onProgress([...progress]);
        }
      }

      return result;
    } catch (error: any) {
      // Mark all files as failed
      progress.forEach(p => {
        p.status = 'failed';
        p.progress = 0;
        p.message = `Upload failed: ${error.response?.data?.message || error.message}`;
        p.error = error.response?.data?.message || error.message;
      });

      if (onProgress) {
        onProgress([...progress]);
      }

      throw error;
    }
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file type
   */
  isValidFileType(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp'
    ];

    return validTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.pdf') ||
           file.name.toLowerCase().endsWith('.docx') ||
           file.name.toLowerCase().endsWith('.doc') ||
           file.name.toLowerCase().endsWith('.txt') ||
           file.name.toLowerCase().endsWith('.md') ||
           file.name.toLowerCase().endsWith('.jpg') ||
           file.name.toLowerCase().endsWith('.jpeg') ||
           file.name.toLowerCase().endsWith('.png') ||
           file.name.toLowerCase().endsWith('.gif') ||
           file.name.toLowerCase().endsWith('.bmp');
  }

  /**
   * Get file type display name
   */
  getFileTypeDisplay(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'PDF Document',
      'docx': 'Word Document',
      'doc': 'Word Document',
      'txt': 'Text File',
      'md': 'Markdown File',
      'jpg': 'JPEG Image',
      'jpeg': 'JPEG Image',
      'png': 'PNG Image',
      'gif': 'GIF Image',
      'bmp': 'BMP Image'
    };
    return typeMap[extension || ''] || 'Unknown File';
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService; 