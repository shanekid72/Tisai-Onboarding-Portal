import React, { useState } from 'react';
import { useCRMData } from '../../context/CRMDataContext';
import { CreateInteractionData, Interaction } from '../../types/crm';
import { useAdminAuth } from '../../context/AdminAuthContext';

const InteractionsPage: React.FC = () => {
  const { state, createInteraction, updateInteraction, deleteInteraction } = useCRMData();
  const { authState } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = authState.user?.role === 'super_admin';

  // Check if current user can edit interactions (Super Admin or Partnership users)
  const canEditInteractions = authState.user?.role === 'super_admin' || authState.user?.role === 'partnership';

  const handleCreateInteraction = async (interactionData: CreateInteractionData) => {
    setIsLoading(true);
    try {
      await createInteraction(interactionData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setShowEditModal(true);
  };

  const handleUpdateInteraction = async (interactionData: Partial<Interaction>) => {
    if (!selectedInteraction) return;
    setIsLoading(true);
    try {
      await updateInteraction(selectedInteraction.id, interactionData);
      setShowEditModal(false);
      setSelectedInteraction(null);
    } catch (error) {
      console.error('Error updating interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin users can delete interactions.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this interaction? This action cannot be undone.')) {
      try {
        await deleteInteraction(interactionId);
      } catch (error) {
        console.error('Error deleting interaction:', error);
      }
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'note': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const sortedInteractions = [...state.interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all communications and interactions with clients.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Log Interaction
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedInteractions.map((interaction, index) => (
          <div key={interaction.id} className="relative">
            {/* Timeline line */}
            {index < sortedInteractions.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
            )}
            
            <div className="flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(interaction.type)}`}>
                {getInteractionIcon(interaction.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{interaction.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(interaction.type)}`}>
                        {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(interaction.date).toLocaleDateString()} at {new Date(interaction.date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canEditInteractions ? (
                      <>
                        <button 
                          onClick={() => handleEditInteraction(interaction)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {isSuperAdmin && (
                          <button 
                            onClick={() => handleDeleteInteraction(interaction.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs">Partnership/Admin access only</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{interaction.description}</p>
                
                {interaction.followUpDate && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Follow-up scheduled for {new Date(interaction.followUpDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {interaction.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {interaction.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span>{attachment.fileName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role-based access control notice */}
                {!canEditInteractions && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm">Edit functions available to Partnership team and Super Admin</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.interactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No interactions yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your communications with partners.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Log First Interaction
          </button>
        </div>
      )}

      {/* Create Interaction Modal */}
      {showCreateModal && (
        <CreateInteractionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateInteraction}
          isLoading={isLoading}
          contacts={state.contacts}
          organizations={state.organizations}
        />
      )}

      {/* Edit Interaction Modal */}
      {showEditModal && selectedInteraction && (
        <EditInteractionModal
          interaction={selectedInteraction}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInteraction(null);
          }}
          onSubmit={handleUpdateInteraction}
          isLoading={isLoading}
          contacts={state.contacts}
          organizations={state.organizations}
        />
      )}
    </div>
  );
};

// Create Interaction Modal Component
interface CreateInteractionModalProps {
  onClose: () => void;
  onSubmit: (data: CreateInteractionData) => void;
  isLoading: boolean;
  contacts: any[];
  organizations: any[];
}

const CreateInteractionModal: React.FC<CreateInteractionModalProps> = ({ onClose, onSubmit, isLoading, contacts, organizations }) => {
  const [formData, setFormData] = useState<CreateInteractionData>({
    contactId: undefined,
    organizationId: undefined,
    type: 'call',
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16), // Current date and time
    followUpDate: undefined,
    mentions: []
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log New Interaction</h2>
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
                Interaction Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'call' | 'email' | 'meeting' | 'note' | 'custom' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief title for this interaction"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what was discussed or accomplished"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Contact (Optional)
              </label>
              <select
                value={formData.contactId || ''}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.displayName} - {contact.company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Organization (Optional)
              </label>
              <select
                value={formData.organizationId || ''}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Follow-up Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.followUpDate || ''}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set a reminder for when you need to follow up
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
              <span>{isLoading ? 'Logging...' : 'Log Interaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Interaction Modal Component
interface EditInteractionModalProps {
  interaction: Interaction;
  onClose: () => void;
  onSubmit: (data: Partial<Interaction>) => void;
  isLoading: boolean;
  contacts: any[];
  organizations: any[];
}

const EditInteractionModal: React.FC<EditInteractionModalProps> = ({ 
  interaction, 
  onClose, 
  onSubmit, 
  isLoading, 
  contacts, 
  organizations 
}) => {
  const [formData, setFormData] = useState({
    contactId: interaction.contactId,
    organizationId: interaction.organizationId,
    type: interaction.type,
    title: interaction.title,
    description: interaction.description,
    date: new Date(interaction.date).toISOString().slice(0, 16),
    followUpDate: interaction.followUpDate ? new Date(interaction.followUpDate).toISOString().slice(0, 16) : ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined
    };
    
    onSubmit(updateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Interaction</h2>
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
                Interaction Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'call' | 'email' | 'meeting' | 'note' | 'custom' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief title for this interaction"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what was discussed or accomplished"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Contact (Optional)
              </label>
              <select
                value={formData.contactId || ''}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.displayName} - {contact.company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Organization (Optional)
              </label>
              <select
                value={formData.organizationId || ''}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Follow-up Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set a reminder for when you need to follow up
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
              <span>{isLoading ? 'Updating...' : 'Update Interaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractionsPage; 