import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { CRMDataProvider } from '../context/CRMDataContext';
import { PricingDataProvider } from '../context/PricingDataContext';
import CRMLayout from '../components/crm/layout/CRMLayout';
import CRMDashboard from './crm/CRMDashboard';
import ContactsPage from './crm/ContactsPage';
import OrganizationsPage from './crm/OrganizationsPage';
import InteractionsPage from './crm/InteractionsPage';
import TasksPage from './crm/TasksPage';
import DocumentsPage from './crm/DocumentsPage';
import AnalyticsPage from './crm/AnalyticsPage';
import PricingManagementPage from './crm/PricingManagementPage';

const CRMPage: React.FC = () => {
  const { authState } = useAdminAuth();

  // Debug logging
  console.log('🔍 CRM Page Debug Info:', {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    userRole: authState.user?.role,
    isLoading: authState.isLoading
  });

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading CRM...</h2>
          <p className="text-white/60">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has partnership role
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 mb-4">Please log in to access the CRM system.</p>
          <div className="text-xs text-white/40 mb-4 font-mono">
            Debug: isAuthenticated={String(authState.isAuthenticated)}, user={authState.user ? 'exists' : 'null'}
          </div>
          <a
            href="/admin"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>Go to Login</span>
          </a>
        </div>
      </div>
    );
  }

  // Check if user has partnership role
  if (authState.user.role !== 'partnership' && authState.user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Insufficient Permissions</h2>
          <p className="text-white/60 mb-4">
            CRM access is restricted to Partnership team members.
          </p>
          <p className="text-white/40 text-sm mb-4">
            Current role: {authState.user.role.replace('_', ' ').toUpperCase()}
          </p>
          <div className="text-xs text-white/40 mb-4 font-mono">
            Debug: role={authState.user.role}, allowed=['partnership', 'super_admin']
          </div>
          <a
            href="/admin"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>Back to Admin Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <CRMDataProvider>
      <Routes>
        <Route path="/" element={<CRMLayout />}>
          <Route index element={<CRMDashboard />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="interactions" element={<InteractionsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="pricing-management" element={<PricingDataProvider><PricingManagementPage /></PricingDataProvider>} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/crm" replace />} />
        </Route>
      </Routes>
    </CRMDataProvider>
  );
};

export default CRMPage; 