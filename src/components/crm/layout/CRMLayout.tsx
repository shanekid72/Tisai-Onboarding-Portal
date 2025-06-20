import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CRMSidebar from './CRMSidebar';
import CRMTopBar from './CRMTopBar';

const CRMLayout: React.FC = () => {
  // Start with expanded sidebar by default, only collapse on very small screens
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // md breakpoint - only collapse on mobile
    }
    return false; // Default to expanded
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      // Auto-collapse only on very small screens
      if (isMobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <CRMSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <CRMTopBar onMenuClick={toggleSidebar} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CRMLayout; 