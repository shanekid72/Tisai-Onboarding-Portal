import React, { useState } from 'react';
import { useCRMData } from '../../context/CRMDataContext';
import { CreateContactData, Contact } from '../../types/crm';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ContactsPage: React.FC = () => {
  const { state, createContact, updateContact, deleteContact } = useCRMData();
  const { authState } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = authState.user?.role === 'super_admin';

  const handleCreateContact = async (contactData: CreateContactData) => {
    setIsLoading(true);
    try {
      await createContact(contactData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (contactData: Partial<Contact>) => {
    if (!selectedContact) return;
    setIsLoading(true);
    try {
      await updateContact(selectedContact.id, contactData);
      setShowEditModal(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin users can delete contacts.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      try {
        await deleteContact(contactId);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your business contacts and relationships.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Contact
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.contacts.map((contact) => (
          <div key={contact.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={contact.photoUrl || `https://ui-avatars.com/api/?name=${contact.displayName}&background=3B82F6&color=fff`}
                alt={contact.displayName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contact.displayName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{contact.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{contact.company}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {contact.methods.filter(m => m.isPrimary).map((method) => (
                <div key={method.id} className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 capitalize">{method.type}:</span>
                  <span className="text-gray-900 dark:text-white">{method.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {contact.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewContact(contact)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View
              </button>
              <button 
                onClick={() => handleEditContact(contact)}
                className="flex-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {state.contacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contacts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding your first contact.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Contact
          </button>
        </div>
      )}

      {/* Create Contact Modal */}
      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateContact}
          isLoading={isLoading}
        />
      )}

      {/* View Contact Modal */}
      {showViewModal && selectedContact && (
        <ViewContactModal
          contact={selectedContact}
          onClose={() => {
            setShowViewModal(false);
            setSelectedContact(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => {
            handleDeleteContact(selectedContact.id);
            setShowViewModal(false);
            setSelectedContact(null);
          }}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Edit Contact Modal */}
      {showEditModal && selectedContact && (
        <EditContactModal
          contact={selectedContact}
          onClose={() => {
            setShowEditModal(false);
            setSelectedContact(null);
          }}
          onSubmit={handleUpdateContact}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// View Contact Modal Component
interface ViewContactModalProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSuperAdmin: boolean;
}

const ViewContactModal: React.FC<ViewContactModalProps> = ({ contact, onClose, onEdit, onDelete, isSuperAdmin }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Details</h2>
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
              src={contact.photoUrl || `https://ui-avatars.com/api/?name=${contact.displayName}&background=3B82F6&color=fff`}
              alt={contact.displayName}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{contact.displayName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{contact.title}</p>
              <p className="text-gray-500 dark:text-gray-500">{contact.company}</p>
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contact Methods</h4>
            <div className="space-y-2">
              {contact.methods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{method.type}:</span>
                    <span className="text-gray-900 dark:text-white">{method.value}</span>
                  </div>
                  {method.isPrimary && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
                <p className="text-gray-900 dark:text-white">{contact.source}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
                <p className="text-gray-900 dark:text-white">{new Date(contact.createdAt).toLocaleDateString()}</p>
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
              Delete Contact
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
              Edit Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Contact Modal Component
interface EditContactModalProps {
  contact: Contact;
  onClose: () => void;
  onSubmit: (data: Partial<Contact>) => void;
  isLoading: boolean;
}

const EditContactModal: React.FC<EditContactModalProps> = ({ contact, onClose, onSubmit, isLoading }) => {
  const { state } = useCRMData();
  const [formData, setFormData] = useState({
    firstName: contact.firstName,
    lastName: contact.lastName,
    title: contact.title,
    company: contact.company,
    methods: [...contact.methods],
    tags: contact.tags
  });

  const [tags, setTags] = useState(contact.tags.join(', '));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Process tags
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // Filter out empty contact methods
    const validMethods = formData.methods.filter(method => method.value.trim() !== '');
    
    const contactData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: `${formData.firstName} ${formData.lastName}`.trim(),
      title: formData.title,
      company: formData.company,
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
      methods: [...formData.methods, { id: `temp_${Date.now()}`, type: 'email', value: '', isPrimary: false }]
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Contact</h2>
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
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Organization</option>
                {state.organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select from existing organizations or create a new one in Organizations page
              </p>
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
                <div key={method.id || index} className="flex items-center space-x-3">
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
              <span>{isLoading ? 'Updating...' : 'Update Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Contact Modal Component
interface CreateContactModalProps {
  onClose: () => void;
  onSubmit: (data: CreateContactData) => void;
  isLoading: boolean;
}

const CreateContactModal: React.FC<CreateContactModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { state } = useCRMData();
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
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Organization</option>
                {state.organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select from existing organizations or create a new one in Organizations page
              </p>
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

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Manual Entry">Manual Entry</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Event">Event</option>
              <option value="Social Media">Social Media</option>
              <option value="Cold Outreach">Cold Outreach</option>
              <option value="Partner">Partner</option>
            </select>
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

export default ContactsPage; 