import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline' | 'ghost' | 'gradient';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animated?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  animated = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Base button styles
  let buttonStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative z-50 cursor-pointer pointer-events-auto';
  
  // Add variant-specific styling
  if (variant === 'primary') {
    buttonStyles += ' bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600';
  } else if (variant === 'secondary') {
    buttonStyles += ' bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white';
  } else if (variant === 'danger') {
    buttonStyles += ' bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600';
  } else if (variant === 'outline') {
    buttonStyles += ' border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white';
  } else if (variant === 'ghost') {
    buttonStyles += ' bg-transparent hover:bg-gray-100 text-gray-800 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-200';
  } else if (variant === 'gradient') {
    buttonStyles += ' bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white focus:ring-primary-500 shadow-md hover:shadow-lg';
  } else if (variant === 'tertiary') {
    buttonStyles += ' text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20';
  }
  
  // Add size-specific styling
  if (size === 'xs') {
    buttonStyles += ' px-2 py-1 text-xs';
  } else if (size === 'sm') {
    buttonStyles += ' px-3 py-1.5 text-sm';
  } else if (size === 'md') {
    buttonStyles += ' px-4 py-2 text-sm';
  } else if (size === 'lg') {
    buttonStyles += ' px-5 py-2.5 text-base';
  }
  
  // Add animation styles
  if (animated) {
    buttonStyles += ' transform transition-transform hover:-translate-y-1 active:translate-y-0';
  }
  
  // Add full width if requested
  if (fullWidth) {
    buttonStyles += ' w-full';
  }
  
  // Add disabled styling
  if (disabled || isLoading) {
    buttonStyles += ' opacity-60 cursor-not-allowed';
  }
  
  // Render the children with proper alignment
  const renderChildren = () => {
    // If children is a span with flex class, return it directly
    if (
      React.isValidElement(children) && 
      React.Children.count(React.Children.toArray(children)) === 1 &&
      typeof children.type === 'string' && 
      children.type.toLowerCase() === 'span' &&
      children.props.className && 
      typeof children.props.className === 'string' &&
      children.props.className.includes('flex')
    ) {
      return children;
    }
    
    // For icon + text, create a properly aligned container
    if (icon) {
      return (
        <span className="inline-flex items-center justify-center">
          {iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          <span>{children}</span>
          {iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </span>
      );
    }
    
    // For just text, make sure it's centered properly
    if (typeof children === 'string' || typeof children === 'number') {
      return <span className="inline-block text-center">{children}</span>;
    }
    
    // If children contains an icon (common case), ensure it's wrapped properly
    if (React.isValidElement(children)) {
      return (
        <span className="inline-flex items-center justify-center">
          {children}
        </span>
      );
    }
    
    // For other cases, return as is
    return children;
  };
  
    return (
      <button
      className={`${buttonStyles} ${className}`}
      disabled={disabled || isLoading}
        {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : renderChildren()}
      </button>
    );
};

export default Button;