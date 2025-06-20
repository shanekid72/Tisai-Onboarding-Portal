import React, { useEffect, useState } from 'react';
import { useCRMData } from '../../context/CRMDataContext';
import { CreateContactData } from '../../types/crm';
import { gsap } from 'gsap';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotifications, websocketService } from '../../context/NotificationContext';

const CRMDashboard: React.FC = () => {
  const { getMetrics, state, createContact } = useCRMData();
  const { authState } = useAdminAuth();
  const { addNotification, isConnected } = useNotifications();
  const metrics = getMetrics();
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Demo section toggle - only available for Super Admin users
  const isSuperAdmin = authState.user?.role === 'super_admin';
  const [showDemoSection, setShowDemoSection] = useState(false);

  const handleCreateContact = async (contactData: CreateContactData) => {
    setIsLoading(true);
    try {
      await createContact(contactData);
      setShowCreateContactModal(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Animate dashboard cards on load
    gsap.fromTo('.metric-card', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const recentContacts = state.contacts.slice(0, 5);
  const recentTasks = state.tasks.slice(0, 5);

  // Demo notification functions
  const sendTestNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const notifications = {
      success: {
        type: 'success' as const,
        title: 'Success!',
        message: 'This is a test success notification',
        userId: authState.user?.id || '',
        autoHide: true,
        duration: 4000
      },
      error: {
        type: 'error' as const,
        title: 'Error Occurred',
        message: 'This is a test error notification that requires attention',
        userId: authState.user?.id || '',
        autoHide: false
      },
      warning: {
        type: 'warning' as const,
        title: 'Warning',
        message: 'This is a test warning notification',
        userId: authState.user?.id || '',
        autoHide: true,
        duration: 5000
      },
      info: {
        type: 'info' as const,
        title: 'Information',
        message: 'This is a test info notification with action',
        userId: authState.user?.id || '',
        actionUrl: '/crm/contacts',
        autoHide: true,
        duration: 6000
      }
    };

    addNotification(notifications[type]);
  };

  const simulateDocumentApproval = () => {
    websocketService.simulateDocumentApproval(
      'NDA_001',
      authState.user?.id || '',
      'Legal Team'
    );
  };

  const simulateDocumentRejection = () => {
    websocketService.simulateDocumentRejection(
      'KYC_002',
      authState.user?.id || '',
      'Compliance Team',
      'Missing required signatures'
    );
  };

  const simulateOnboardingUpdate = () => {
    websocketService.simulateOnboardingStatusUpdate(
      authState.user?.id || '',
      'Commercial Agreement',
      'KYC Verification',
      75
    );
  };

  const simulateTaskAssignment = () => {
    websocketService.simulateTaskAssignment(
      'task_001',
      'Review partnership proposal',
      authState.user?.id || '',
      'Partnership Manager'
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business relationships.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Demo toggle button - only visible to Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => setShowDemoSection(!showDemoSection)}
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg transition-all duration-200 text-sm flex items-center space-x-2"
            >
              <span>🔔</span>
              <span>{showDemoSection ? 'Hide Demo' : 'Show Demo'}</span>
            </button>
          )}
          <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export Report
          </button>
          <button 
            onClick={() => setShowCreateContactModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Contact
          </button>
        </div>
      </div>

      {/* Real-time Notifications Demo Section - Only show for Super Admin when enabled */}
      {(isSuperAdmin && showDemoSection) && (
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🔔 Real-time Notifications (Demo)</h3>
              <p className="text-purple-200">
                Test the real-time notification system with various notification types
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-white/80">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => sendTestNotification('success')}
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              ✅ Success Toast
            </button>
            <button
              onClick={() => sendTestNotification('error')}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              ❌ Error Toast
            </button>
            <button
              onClick={() => sendTestNotification('warning')}
              className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              ⚠️ Warning Toast
            </button>
            <button
              onClick={() => sendTestNotification('info')}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              ℹ️ Info Toast
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={simulateDocumentApproval}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              📄✅ Document Approved
            </button>
            <button
              onClick={simulateDocumentRejection}
              className="bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              📄❌ Document Rejected
            </button>
            <button
              onClick={simulateOnboardingUpdate}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              🚀 Onboarding Update
            </button>
            <button
              onClick={simulateTaskAssignment}
              className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              📋 Task Assigned
            </button>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60">
              💡 <strong>Tip:</strong> These notifications simulate real-time events that would occur in a production environment. 
              Success and info notifications auto-hide, while error notifications persist until manually closed.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalContacts}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +{metrics.newContactsThisMonth} this month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.totalOrganizations}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Active partnerships
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metrics.openTasks}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                {metrics.upcomingFollowUps} follow-ups due
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="metric-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Pipeline</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(metrics.revenueThisQuarter)}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {formatPercentage(metrics.conversionRate)} conversion rate
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Contacts</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                <img
                  src={contact.photoUrl || `https://ui-avatars.com/api/?name=${contact.displayName}&background=3B82F6&color=fff`}
                  alt={contact.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{contact.company}</p>
                </div>
                <div className="flex space-x-1">
                  {contact.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(metrics.teamProductivity)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team Productivity</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.averageResponseTime}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completedTasksThisWeek}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed This Week</p>
          </div>
        </div>
      </div>

      {/* Create Contact Modal */}
      {showCreateContactModal && (
        <CreateContactModal
          onClose={() => setShowCreateContactModal(false)}
          onSubmit={handleCreateContact}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Create Contact Modal Component (reused from ContactsPage)
interface CreateContactModalProps {
  onClose: () => void;
  onSubmit: (data: CreateContactData) => void;
  isLoading: boolean;
}

const CreateContactModal: React.FC<CreateContactModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateContactData>({
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    methods: [
      { type: 'email', value: '', isPrimary: true },
      { type: 'phone', value: '', isPrimary: false }
    ],
    addresses: [],
    customFields: [],
    source: 'Manual Entry',
    organizationIds: [],
    tags: []
  });

  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Process tags
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // Filter out empty contact methods
    const validMethods = formData.methods.filter(method => method.value.trim() !== '');
    
    const contactData: CreateContactData = {
      ...formData,
      methods: validMethods,
      tags: tagArray
    };

    onSubmit(contactData);
  };

  const updateContactMethod = (index: number, field: 'type' | 'value', value: string) => {
    const newMethods = [...formData.methods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setFormData({ ...formData, methods: newMethods });
  };

  const addContactMethod = () => {
    setFormData({
      ...formData,
      methods: [...formData.methods, { type: 'email', value: '', isPrimary: false }]
    });
  };

  const removeContactMethod = (index: number) => {
    const newMethods = formData.methods.filter((_, i) => i !== index);
    setFormData({ ...formData, methods: newMethods });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. CEO, CTO, Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Company name"
              />
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Methods
              </label>
              <button
                type="button"
                onClick={addContactMethod}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Method
              </button>
            </div>
            <div className="space-y-3">
              {formData.methods.map((method, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <select
                    value={method.type}
                    onChange={(e) => updateContactMethod(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={method.value}
                    onChange={(e) => updateContactMethod(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={method.type === 'email' ? 'email@example.com' : method.type === 'phone' ? '+1-555-0123' : 'Contact info'}
                  />
                  {formData.methods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContactMethod(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter tags separated by commas (e.g. hot-lead, enterprise, decision-maker)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isLoading ? 'Creating...' : 'Create Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRMDashboard; 