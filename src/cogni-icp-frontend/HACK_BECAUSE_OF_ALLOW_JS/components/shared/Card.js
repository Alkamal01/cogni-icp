import React from 'react';
const Card = ({ children, className = '', onClick }) => {
    return (<div className={`
        bg-white dark:bg-dark-card 
        rounded-lg shadow-sm 
        border border-gray-200 dark:border-dark-border
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `} onClick={onClick}>
      {children}
    </div>);
};
export default Card;
