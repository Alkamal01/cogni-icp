import React from 'react';
import { FileUploadProgress as ProgressType } from '../../services/fileUploadService';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface FileUploadProgressProps {
  progress: ProgressType[];
  onRemove?: (fileName: string) => void;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ progress, onRemove }) => {
  const getStatusIcon = (status: ProgressType['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'uploading':
        return <div className="w-5 h-5 text-blue-500">↑</div>;
      default:
        return <div className="w-5 h-5 text-gray-500">📄</div>;
    }
  };

  const getStatusColor = (status: ProgressType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'processing':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'uploading':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  return (
    <div className="space-y-3">
      {progress.map((file, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getStatusColor(file.status)} transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {getStatusIcon(file.status)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.file_name}
                  </h4>
                  {file.file_size && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatFileSize(file.file_size)})
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {file.message}
                </p>
                
                {file.status === 'completed' && file.chunks_processed && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>✓ {file.chunks_processed} chunks processed</span>
                    {file.processing_time && (
                      <span>⏱ {formatTime(file.processing_time)}</span>
                    )}
                  </div>
                )}
                
                {file.status === 'failed' && file.error && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{file.error}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar for uploading/processing */}
            {(file.status === 'uploading' || file.status === 'processing') && (
              <div className="ml-4 w-24">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {file.progress}%
                </div>
              </div>
            )}
            
            {/* Remove button */}
            {onRemove && (file.status === 'completed' || file.status === 'failed') && (
              <button
                onClick={() => onRemove(file.file_name)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {progress.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="w-12 h-12 mx-auto mb-3 opacity-50 text-4xl">📄</div>
          <p>No files uploaded yet</p>
          <p className="text-sm">Upload files to build your tutor's knowledge base</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadProgress; 