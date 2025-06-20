import React, { useState, useEffect } from 'react';
import { useAdminAuth, AdminUser, CreateUserData } from '../../context/AdminAuthContext';
import { usePartnerOnboarding } from '../../context/PartnerOnboardingContext';

// Tab types
type TabType = 'dashboard' | 'onboarding' | 'users' | 'reports';

// User management modal types
type UserModalType = 'create' | 'edit' | 'view' | null;

const AdminDashboard: React.FC = () => {
  const { authState, logout, createUser, updateUser, deleteUser, getAllUsers, hasPermission } = useAdminAuth();
  const { state: onboardingState } = usePartnerOnboarding();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userModal, setUserModal] = useState<UserModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load users on component mount
  useEffect(() => {
    setUsers(getAllUsers());
  }, [getAllUsers]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle user creation
  const handleCreateUser = async (userData: CreateUserData) => {
    setIsLoading(true);
    try {
      const result = await createUser(userData);
      if (result.success) {
        setUsers(getAllUsers());
        setUserModal(null);
        showNotification('success', 'User created successfully');
      } else {
        showNotification('error', result.error || 'Failed to create user');
      }
    } catch (error) {
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user update
  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    setIsLoading(true);
    try {
      const result = await updateUser(userId, updates);
      if (result.success) {
        setUsers(getAllUsers());
        setUserModal(null);
        setSelectedUser(null);
        showNotification('success', 'User updated successfully');
      } else {
        showNotification('error', result.error || 'Failed to update user');
      }
    } catch (error) {
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(getAllUsers());
        showNotification('success', 'User deleted successfully');
      } else {
        showNotification('error', result.error || 'Failed to delete user');
      }
    } catch (error) {
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: AdminUser['role']) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'legal': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'compliance': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'business': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'technical': return 'bg-red-600/20 text-red-300 border-red-500/30';
      case 'partnership': return 'bg-orange-600/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  // Get dashboard stats
  const getDashboardStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalOnboardings = 1; // Mock data - in real app, get from onboarding context
    const pendingApprovals = 3; // Mock data

    return { totalUsers, activeUsers, totalOnboardings, pendingApprovals };
  };

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white/60">
                  Welcome back, {authState.user?.fullName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-white/60">Role</div>
                <div className={`text-xs px-2 py-1 rounded-lg border ${getRoleBadgeColor(authState.user?.role || 'business')}`}>
                  {authState.user?.role.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-red-500/30 hover:border-red-500/50"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'onboarding', label: 'Onboarding', icon: '🤝' },
              { id: 'users', label: 'User Management', icon: '👥', permission: 'user.read' },
              { id: 'reports', label: 'Reports', icon: '📈' }
            ].map((tab) => {
              if (tab.permission && !hasPermission(tab.permission)) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-300'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border ${
            notification.type === 'success' 
              ? 'bg-green-600/20 border-green-500/30 text-green-300' 
              : 'bg-red-600/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{notification.type === 'success' ? '✅' : '❌'}</span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">System Overview</h2>
            
            {/* CRM Access for Partnership Team and Super Admin */}
            {(authState.user?.role === 'partnership' || authState.user?.role === 'super_admin') && (
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">D9 CRM</h3>
                    <p className="text-orange-200 mb-4">
                      Access your dedicated CRM system to manage contacts, organizations, and partnerships.
                    </p>
                    <a
                      href="/crm"
                      className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Open D9 CRM</span>
                    </a>
                  </div>
                  <div className="w-24 h-24 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">🤝</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Active Users</p>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Onboardings</p>
                    <p className="text-3xl font-bold text-white">{stats.totalOnboardings}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm font-medium">Pending Approvals</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingApprovals}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span>👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">New partner onboarding started</p>
                    <p className="text-white/60 text-sm">TechCorp Inc. - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span>✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Document approved</p>
                    <p className="text-white/60 text-sm">Legal team approved NDA - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span>👥</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">New user created</p>
                    <p className="text-white/60 text-sm">Compliance team member added - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && hasPermission('user.read') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              {hasPermission('user.create') && (
                <button
                  onClick={() => setUserModal('create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Create User</span>
                </button>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-white/80 font-medium">User</th>
                      <th className="text-left p-4 text-white/80 font-medium">Role</th>
                      <th className="text-left p-4 text-white/80 font-medium">Department</th>
                      <th className="text-left p-4 text-white/80 font-medium">Status</th>
                      <th className="text-left p-4 text-white/80 font-medium">Last Login</th>
                      <th className="text-left p-4 text-white/80 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-white">{user.fullName}</div>
                            <div className="text-sm text-white/60">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-xs border ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">{user.department}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-xs border ${
                            user.isActive 
                              ? 'bg-green-600/20 text-green-300 border-green-500/30' 
                              : 'bg-red-600/20 text-red-300 border-red-500/30'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-white/60 text-sm">
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setUserModal('view');
                              }}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View User"
                            >
                              👁️
                            </button>
                            {hasPermission('user.update') && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserModal('edit');
                                }}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Edit User"
                              >
                                ✏️
                              </button>
                            )}
                            {hasPermission('user.delete') && user.id !== authState.user?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete User"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Partner Onboarding Management</h2>
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-white/80">Onboarding management features coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-white/80">Reports and analytics features coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {userModal && (
        <UserModal
          type={userModal}
          user={selectedUser}
          onClose={() => {
            setUserModal(null);
            setSelectedUser(null);
          }}
                     onSave={userModal === 'create' ? handleCreateUser : 
                   userModal === 'edit' ? (updates) => handleUpdateUser(selectedUser!.id, updates as Partial<AdminUser>) : 
                   undefined}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// User Modal Component
interface UserModalProps {
  type: 'create' | 'edit' | 'view';
  user?: AdminUser | null;
  onClose: () => void;
  onSave?: (data: any) => void;
  isLoading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ type, user, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    role: user?.role || 'business',
    department: user?.department || '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSave) {
      if (type === 'create') {
        onSave(formData);
      } else {
        const { password, ...updates } = formData;
        onSave(updates);
      }
    }
  };

  const isReadOnly = type === 'view';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {type === 'create' ? 'Create User' : type === 'edit' ? 'Edit User' : 'User Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 disabled:opacity-50"
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 disabled:opacity-50"
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 disabled:opacity-50"
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white disabled:opacity-50"
              required
              disabled={isReadOnly}
            >
              <option value="business" className="bg-gray-800">Business</option>
              <option value="legal" className="bg-gray-800">Legal</option>
              <option value="compliance" className="bg-gray-800">Compliance</option>
              <option value="technical" className="bg-gray-800">Technical</option>
              <option value="partnership" className="bg-gray-800">Partnership</option>
              <option value="super_admin" className="bg-gray-800">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 disabled:opacity-50"
              required
              disabled={isReadOnly}
            />
          </div>

          {type === 'create' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40"
                required
                placeholder="Enter password"
              />
            </div>
          )}

          {!isReadOnly && (
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white py-3 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{type === 'create' ? 'Create User' : 'Update User'}</span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard; 