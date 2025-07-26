import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ 
  className = '', 
  error, 
  ...props 
}) => {
  return (
    <div className="w-full">
      <textarea
        className={`
          w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-vertical
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
          }
          ${className}
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Textarea; 