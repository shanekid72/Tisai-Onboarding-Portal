import React, { useState } from 'react';
import { useCRMData } from '../../context/CRMDataContext';
import { CreateOrganizationData, Organization } from '../../types/crm';
import { useAdminAuth } from '../../context/AdminAuthContext';

const OrganizationsPage: React.FC = () => {
  const { state, createOrganization, updateOrganization, deleteOrganization } = useCRMData();
  const { authState } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = authState.user?.role === 'super_admin';

  const handleCreateOrganization = async (orgData: CreateOrganizationData) => {
    setIsLoading(true);
    try {
      await createOrganization(orgData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrganization = async (orgData: Partial<Organization>) => {
    if (!selectedOrganization) return;
    setIsLoading(true);
    try {
      await updateOrganization(selectedOrganization.id, orgData);
      setShowEditModal(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowViewModal(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowEditModal(true);
  };

  const handleDeleteOrganization = async (organizationId: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin users can delete organizations.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        await deleteOrganization(organizationId);
      } catch (error) {
        console.error('Error deleting organization:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage partner organizations and companies.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.organizations.map((org) => (
          <div key={org.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={org.logoUrl || `https://ui-avatars.com/api/?name=${org.name}&background=8B5CF6&color=fff`}
                alt={org.name}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{org.industry}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{org.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Size:</span>
                <span className="text-gray-900 dark:text-white">{org.size} employees</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(org.revenue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Contacts:</span>
                <span className="text-gray-900 dark:text-white">{org.contactIds.length}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewOrganization(org)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View
              </button>
              <button 
                onClick={() => handleEditOrganization(org)}
                className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {state.organizations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No organizations yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first organization.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Organization
          </button>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOrganization}
          isLoading={isLoading}
        />
      )}

      {/* View Organization Modal */}
      {showViewModal && selectedOrganization && (
        <ViewOrganizationModal
          organization={selectedOrganization}
          onClose={() => {
            setShowViewModal(false);
            setSelectedOrganization(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => {
            handleDeleteOrganization(selectedOrganization.id);
            setShowViewModal(false);
            setSelectedOrganization(null);
          }}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Edit Organization Modal */}
      {showEditModal && selectedOrganization && (
        <EditOrganizationModal
          organization={selectedOrganization}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrganization(null);
          }}
          onSubmit={handleUpdateOrganization}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// View Organization Modal Component
interface ViewOrganizationModalProps {
  organization: Organization;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSuperAdmin: boolean;
}

const ViewOrganizationModal: React.FC<ViewOrganizationModalProps> = ({ organization, onClose, onEdit, onDelete, isSuperAdmin }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <img
              src={organization.logoUrl || `https://ui-avatars.com/api/?name=${organization.name}&background=8B5CF6&color=fff`}
              alt={organization.name}
              className="w-16 h-16 rounded-lg"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{organization.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{organization.industry}</p>
              {organization.website && (
                <a 
                  href={organization.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  {organization.website}
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {organization.description && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h4>
              <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {organization.description}
              </p>
            </div>
          )}

          {/* Company Details */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Company Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry:</span>
                <p className="text-gray-900 dark:text-white">{organization.industry || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Size:</span>
                <p className="text-gray-900 dark:text-white">{organization.size ? `${organization.size} employees` : 'Not specified'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Revenue:</span>
                <p className="text-gray-900 dark:text-white">{organization.revenue ? formatCurrency(organization.revenue) : 'Not specified'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacts:</span>
                <p className="text-gray-900 dark:text-white">{organization.contactIds.length} contacts</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
                <p className="text-gray-900 dark:text-white">{new Date(organization.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                <p className="text-gray-900 dark:text-white">{new Date(organization.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          {isSuperAdmin ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              Delete Organization
            </button>
          ) : (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm">Delete restricted to Super Admin</span>
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Edit Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Organization Modal Component
interface EditOrganizationModalProps {
  organization: Organization;
  onClose: () => void;
  onSubmit: (data: Partial<Organization>) => void;
  isLoading: boolean;
}

const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({ organization, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description,
    website: organization.website,
    industry: organization.industry,
    size: organization.size,
    revenue: organization.revenue
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Organization</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the organization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Size (Employees)
              </label>
              <input
                type="number"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 100"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Revenue (USD)
              </label>
              <input
                type="number"
                value={formData.revenue || ''}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 1000000"
                min="0"
              />
            </div>
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
              <span>{isLoading ? 'Updating...' : 'Update Organization'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Organization Modal Component
interface CreateOrganizationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateOrganizationData) => void;
  isLoading: boolean;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: undefined,
    revenue: undefined,
    parentId: undefined
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Organization</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the organization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Size (Employees)
              </label>
              <input
                type="number"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 100"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Revenue (USD)
              </label>
              <input
                type="number"
                value={formData.revenue || ''}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 1000000"
                min="0"
              />
            </div>
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
              <span>{isLoading ? 'Creating...' : 'Create Organization'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationsPage; 