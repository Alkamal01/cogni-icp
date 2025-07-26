import React, { useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoAlertCircle, IoInformationCircle, IoClose } from 'react-icons/io5';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle className="w-5 h-5 text-green-500" />,
    error: <IoCloseCircle className="w-5 h-5 text-red-500" />,
    warning: <IoAlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <IoInformationCircle className="w-5 h-5 text-blue-500" />
  };

  const backgrounds = {
    success: 'bg-green-50 dark:bg-green-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <div
      className={`
        ${backgrounds[type]}
        p-4 rounded-lg shadow-lg
        flex items-center justify-between
        max-w-sm w-full
      `}
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <IoClose className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast; 