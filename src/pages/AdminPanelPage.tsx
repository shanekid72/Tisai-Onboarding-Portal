import React from 'react';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import { PartnerOnboardingProvider } from '../context/PartnerOnboardingContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

// Main Admin Panel Component with Authentication
const AdminPanelContent: React.FC = () => {
  const { authState } = useAdminAuth();

  // Function to reset admin portal
  const resetAdminPortal = () => {
    localStorage.removeItem('admin_auth_state');
    localStorage.removeItem('admin_users');
    window.location.reload();
  };

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Admin Portal</h2>
          <p className="text-white/60 mb-4">Please wait...</p>
          <button
            onClick={resetAdminPortal}
            className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Reset if stuck
          </button>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    return <AdminLogin />;
  }

  // Show dashboard if authenticated
  return (
    <PartnerOnboardingProvider>
      <AdminDashboard />
    </PartnerOnboardingProvider>
  );
};

// Main Admin Panel Page
const AdminPanelPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminPanelContent />
    </AdminAuthProvider>
  );
};

export default AdminPanelPage; 