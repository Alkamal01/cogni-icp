import React from 'react';
const Select = ({ className = '', error, children, ...props }) => {
    return (<div className="w-full">
      <select className={`
          w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 appearance-none
          ${error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}
          ${className}
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          bg-no-repeat bg-right
        `} style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundSize: '1.5em 1.5em'
        }} {...props}>
        {children}
      </select>
      {error && (<p className="mt-1 text-sm text-red-600">{error}</p>)}
    </div>);
};
export default Select;
