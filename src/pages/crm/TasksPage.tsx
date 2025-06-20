import React, { useState } from 'react';
import { useCRMData } from '../../context/CRMDataContext';
import { CreateTaskData, Task } from '../../types/crm';
import { useAdminAuth } from '../../context/AdminAuthContext';

const TasksPage: React.FC = () => {
  const { state, updateTask, createTask, deleteTask } = useCRMData();
  const { authState } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is super admin
  const isSuperAdmin = authState.user?.role === 'super_admin';

  const handleCreateTask = async (taskData: CreateTaskData) => {
    setIsLoading(true);
    try {
      await createTask(taskData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return;
    setIsLoading(true);
    try {
      await updateTask(selectedTask.id, taskData);
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin users can delete tasks.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const tasksByStatus = {
    todo: state.tasks.filter(task => task.status === 'todo'),
    'in-progress': state.tasks.filter(task => task.status === 'in-progress'),
    completed: state.tasks.filter(task => task.status === 'completed')
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your business tasks and follow-ups.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
                {tasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => handleViewTask(task)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                  
                  {task.dueDate && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600 dark:text-blue-400">P</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {isSuperAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No {status.replace('-', ' ')} tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          isLoading={isLoading}
          contacts={state.contacts}
          organizations={state.organizations}
        />
      )}

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <ViewTaskModal
          task={selectedTask}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => {
            handleDeleteTask(selectedTask.id);
            setShowViewModal(false);
            setSelectedTask(null);
          }}
          onStatusChange={(newStatus) => {
            handleStatusChange(selectedTask.id, newStatus);
            setSelectedTask({ ...selectedTask, status: newStatus });
          }}
          contacts={state.contacts}
          organizations={state.organizations}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleUpdateTask}
          isLoading={isLoading}
          contacts={state.contacts}
          organizations={state.organizations}
        />
      )}
    </div>
  );
};

// View Task Modal Component
interface ViewTaskModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'todo' | 'in-progress' | 'completed') => void;
  contacts: any[];
  organizations: any[];
  isSuperAdmin: boolean;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  contacts, 
  organizations,
  isSuperAdmin
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const relatedContact = task.contactId ? contacts.find(c => c.id === task.contactId) : null;
  const relatedOrganization = task.organizationId ? organizations.find(o => o.id === task.organizationId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h2>
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
          {/* Task Header */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h3>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{task.description}</p>
          </div>

          {/* Task Details */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Task Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee:</span>
                <p className="text-gray-900 dark:text-white">Partnership Team</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created:</span>
                <p className="text-gray-900 dark:text-white">{new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
              {task.dueDate && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                  <p className="text-gray-900 dark:text-white">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                <p className="text-gray-900 dark:text-white">{new Date(task.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Related Items */}
          {(relatedContact || relatedOrganization) && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Related Items</h4>
              <div className="space-y-3">
                {relatedContact && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                    <p className="text-gray-900 dark:text-white">{relatedContact.displayName} - {relatedContact.company}</p>
                  </div>
                )}
                {relatedOrganization && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization:</span>
                    <p className="text-gray-900 dark:text-white">{relatedOrganization.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Change */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Change Status</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => onStatusChange('todo')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  task.status === 'todo' 
                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                To Do
              </button>
              <button
                onClick={() => onStatusChange('in-progress')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  task.status === 'in-progress' 
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => onStatusChange('completed')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  task.status === 'completed' 
                    ? 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                }`}
              >
                Completed
              </button>
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
              Delete Task
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
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Task Modal Component
interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  isLoading: boolean;
  contacts: any[];
  organizations: any[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onSubmit, isLoading, contacts, organizations }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate || '',
    contactId: task.contactId,
    organizationId: task.organizationId
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Task</h2>
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
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter task title"
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
              placeholder="Describe the task details"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'todo' | 'in-progress' | 'completed' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
              <span>{isLoading ? 'Updating...' : 'Update Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Task Modal Component
interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => void;
  isLoading: boolean;
  contacts: any[];
  organizations: any[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onSubmit, isLoading, contacts, organizations }) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: 'partnership_001', // Default to current user
    contactId: undefined,
    organizationId: undefined,
    interactionId: undefined
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Task</h2>
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
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter task title"
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
              placeholder="Describe the task details"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
              <span>{isLoading ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TasksPage; 