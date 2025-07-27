import { useState } from 'react';

interface Toast {
  id: number;
  title: string;
  description: string;
  variant: 'success' | 'error' | 'warning' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ 
    title, 
    description, 
    variant = 'info' 
  }: Omit<Toast, 'id'>) => {
    const id = Math.random();
    
    // In a real implementation, this would add the toast to a queue
    // and automatically remove it after a timeout
    setToasts(prev => [...prev, { id, title, description, variant }]);
    
    // For this mock implementation, we'll just log the toast to the console
    console.log(`Toast [${variant}]: ${title} - ${description}`);
    
    // Mock removing the toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
    
    return id;
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    toast,
    dismissToast
  };
};

export default useToast; 