import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { documentService } from '../../services/documentService';
import { DocumentTemplate, TemplateVariable } from '../../types/documents';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DocumentTemplatesPage: React.FC = () => {
  const { authState } = useAdminAuth();
  const { addNotification } = useNotifications();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!isLoading && templates.length > 0) {
      // Animate template cards on load
      gsap.fromTo('.template-card', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [isLoading, templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templateData = await documentService.getTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load templates',
        userId: authState.user?.id || ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDocument = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowGenerateModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600 dark:text-gray-400">Loading templates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage document templates with variable substitution
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📝 Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📄</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {template.category}
                  </p>
                </div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                template.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {template.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Variables:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {template.variables.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {template.createdAt.toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">By:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {template.createdBy}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <button
                onClick={() => handleGenerateDocument(template)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Generate Document
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Document Modal */}
      {showGenerateModal && selectedTemplate && (
        <GenerateDocumentModal
          template={selectedTemplate}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedTemplate(null);
          }}
          onGenerate={async (variables) => {
            try {
              const document = await documentService.createDocumentFromTemplate(
                selectedTemplate.id,
                variables
              );
              if (document) {
                addNotification({
                  type: 'success',
                  title: 'Document Generated',
                  message: `Document "${document.name}" has been created successfully`,
                  userId: authState.user?.id || ''
                });
                setShowGenerateModal(false);
                setSelectedTemplate(null);
              }
            } catch (error) {
              addNotification({
                type: 'error',
                title: 'Generation Failed',
                message: 'Failed to generate document from template',
                userId: authState.user?.id || ''
              });
            }
          }}
        />
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(templateData) => {
            // Handle template creation
            console.log('Creating template:', templateData);
            setShowCreateModal(false);
            addNotification({
              type: 'success',
              title: 'Template Created',
              message: 'New template has been created successfully',
              userId: authState.user?.id || ''
            });
            loadTemplates();
          }}
        />
      )}
    </div>
  );
};

// Generate Document Modal Component
interface GenerateDocumentModalProps {
  template: DocumentTemplate;
  onClose: () => void;
  onGenerate: (variables: Record<string, any>) => void;
}

const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({
  template,
  onClose,
  onGenerate
}) => {
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVariableChange = (name: string, value: any) => {
    setVariables(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    template.variables.forEach(variable => {
      if (variable.required && !variables[variable.name]) {
        newErrors[variable.name] = `${variable.name} is required`;
      }

      if (variables[variable.name] && variable.validation) {
        const value = variables[variable.name];
        const validation = variable.validation;

        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          newErrors[variable.name] = `Invalid format for ${variable.name}`;
        }

        if (validation.minLength && value.length < validation.minLength) {
          newErrors[variable.name] = `${variable.name} must be at least ${validation.minLength} characters`;
        }

        if (validation.maxLength && value.length > validation.maxLength) {
          newErrors[variable.name] = `${variable.name} must be no more than ${validation.maxLength} characters`;
        }

        if (variable.type === 'number') {
          const numValue = Number(value);
          if (validation.min !== undefined && numValue < validation.min) {
            newErrors[variable.name] = `${variable.name} must be at least ${validation.min}`;
          }
          if (validation.max !== undefined && numValue > validation.max) {
            newErrors[variable.name] = `${variable.name} must be no more than ${validation.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (validateForm()) {
      onGenerate(variables);
    }
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const error = errors[variable.name];

    switch (variable.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select {variable.name}</option>
            {variable.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            min={variable.validation?.min}
            max={variable.validation?.max}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleVariableChange(variable.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Yes</span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}`}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate Document: {template.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Fill in the variables below to generate a new document from this template.
        </p>

        <div className="space-y-4">
          {template.variables.map((variable) => (
            <div key={variable.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {variable.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                {variable.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderVariableInput(variable)}
              {errors[variable.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[variable.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate Document
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Template Modal Component
interface CreateTemplateModalProps {
  onClose: () => void;
  onCreate: (templateData: any) => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ onClose, onCreate }) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'legal' as const,
    content: ''
  });

  const handleCreate = () => {
    if (templateData.name && templateData.content) {
      onCreate(templateData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Enter template description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={templateData.category}
                onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="legal">Legal</option>
                <option value="financial">Financial</option>
                <option value="technical">Technical</option>
                <option value="partnership">Partnership</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Variable Syntax</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Use double curly braces to define variables in your template:
              </p>
              <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                {`{{variableName}}`}
              </code>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Example: "Hello {`{{name}}`}, your contract starts on {`{{startDate}}`}"
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Content
            </label>
            <textarea
              value={templateData.content}
              onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full h-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="Enter your template content here..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!templateData.name || !templateData.content}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplatesPage; 