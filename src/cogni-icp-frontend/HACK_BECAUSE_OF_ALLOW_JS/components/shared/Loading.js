import React from 'react';
import { IoReload } from 'react-icons/io5';
const Loading = ({ size = 'md', fullScreen = false }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    if (fullScreen) {
        return (<div className="fixed inset-0 bg-white dark:bg-dark-bg bg-opacity-75 flex items-center justify-center">
        <IoReload className={`${sizes[size]} animate-spin text-primary-500`}/>
      </div>);
    }
    return (<div className="flex items-center justify-center p-4">
      <IoReload className={`${sizes[size]} animate-spin text-primary-500`}/>
    </div>);
};
export default Loading;
