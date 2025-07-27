import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
// import NotificationPanel from './NotificationPanel'; // Commented out or remove
const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (<div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/> {/* Pass props to Sidebar */}
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (<div className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden" onClick={toggleSidebar}></div>)}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary-500/5 to-purple-500/10 dark:from-primary-900/10 dark:to-purple-900/10 rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-primary-500/5 to-purple-500/10 dark:from-primary-900/10 dark:to-purple-900/10 rounded-tr-full -z-10"></div>
        
        <Navbar toggleSidebar={toggleSidebar}/> {/* Pass toggleSidebar to Navbar */}
        <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </motion.main>
        {/* <NotificationPanel /> */} {/* Removed NotificationPanel instance */}
      </div>
    </div>);
};
export default Layout;
