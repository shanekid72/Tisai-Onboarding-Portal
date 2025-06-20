import React, { useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { documentService } from '../../services/documentService';
import DocumentViewModal from '../../components/crm/DocumentViewModal';
import UploadModal from '../../components/crm/UploadModal';
import { 
  Document, 
  DocumentSearchQuery, 
  DocumentSearchResult,
  DocumentType,
  DocumentCategory,
  DocumentStatus
} from '../../types/documents';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DocumentsPage: React.FC = () => {
  const { authState } = useAdminAuth();
  const { addNotification } = useNotifications();
  const [searchResults, setSearchResults] = useState<DocumentSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<DocumentSearchQuery>({
    query: '',
    sortBy: 'lastModified',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewedDocument, setViewedDocument] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [searchQuery]);

  // Auto-refresh every 5 seconds when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing documents...');
        loadDocuments();
        setLastRefresh(new Date());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, searchQuery]);

  useEffect(() => {
    if (!isLoading && searchResults) {
      // Animate document cards on load
      gsap.fromTo('.document-card', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [isLoading, searchResults]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const results = await documentService.searchDocuments(searchQuery);
      setSearchResults(results);
      console.log('📊 Loaded documents:', results.total, 'total documents');
    } catch (error) {
      console.error('Error loading documents:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load documents',
        userId: authState.user?.id || ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (filters: Partial<DocumentSearchQuery>) => {
    setSearchQuery(prev => ({ ...prev, ...filters, offset: 0 }));
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchQuery(prev => ({ ...prev, sortBy: sortBy as any, sortOrder, offset: 0 }));
  };

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (searchQuery.limit || 20);
    setSearchQuery(prev => ({ ...prev, offset }));
  };

  const handleDocumentSelect = (documentId: string, selected: boolean) => {
    if (selected) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && searchResults) {
      setSelectedDocuments(searchResults.documents.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleViewDocument = (document: Document) => {
    setViewedDocument(document);
    addNotification({
      type: 'info',
      title: 'Document Viewer',
      message: `Opening ${document.name}`,
      userId: authState.user?.id || ''
    });
    console.log('📄 Viewing document:', document.name);
  };

  const handleDownloadDocument = (doc: Document) => {
    // Simulate document download
    addNotification({
      type: 'success',
      title: 'Download Started',
      message: `Downloading ${doc.name}`,
      userId: authState.user?.id || ''
    });
    
    console.log('⬇️ Downloading document:', doc.name);
    
    // In a real implementation, this would trigger actual download
    // For demo purposes, create a mock download
    const link = document.createElement('a');
    link.href = doc.url || '#';
    link.download = doc.name;
    link.click();
  };

  const handleDeleteDocument = async (documentId: string) => {
    const document = searchResults?.documents.find(d => d.id === documentId);
    if (!document) return;

    const confirmed = confirm(`Are you sure you want to delete "${document.name}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const success = await documentService.deleteDocument(documentId);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Document Deleted',
          message: `${document.name} has been deleted successfully`,
          userId: authState.user?.id || ''
        });
        
        // Remove from selected documents if it was selected
        setSelectedDocuments(prev => prev.filter(id => id !== documentId));
        
        // Refresh the list
        loadDocuments();
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete document',
        userId: authState.user?.id || ''
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedDocuments.length} selected document(s)?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const results = await documentService.deleteMultipleDocuments(selectedDocuments);
      
      if (results.success.length > 0) {
        addNotification({
          type: 'success',
          title: 'Bulk Delete Completed',
          message: `Successfully deleted ${results.success.length} document(s)`,
          userId: authState.user?.id || ''
        });
      }
      
      if (results.failed.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Partial Delete',
          message: `Failed to delete ${results.failed.length} document(s)`,
          userId: authState.user?.id || ''
        });
      }
      
      // Clear selection and refresh
      setSelectedDocuments([]);
      loadDocuments();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Bulk Delete Failed',
        message: 'Failed to delete selected documents',
        userId: authState.user?.id || ''
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      const success = await documentService.approveDocument(documentId, authState.user?.id || '', 'Approved via UI');
      if (success) {
        addNotification({
          type: 'success',
          title: 'Document Approved',
          message: 'Document has been approved successfully',
          userId: authState.user?.id || ''
        });
        loadDocuments(); // Refresh the list
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: 'Failed to approve document',
        userId: authState.user?.id || ''
      });
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const success = await documentService.rejectDocument(documentId, authState.user?.id || '', reason);
      if (success) {
        addNotification({
          type: 'warning',
          title: 'Document Rejected',
          message: 'Document has been rejected',
          userId: authState.user?.id || ''
        });
        loadDocuments(); // Refresh the list
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Failed to reject document',
        userId: authState.user?.id || ''
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: DocumentStatus): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'published': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: DocumentType): string => {
    switch (type) {
      case 'contract': return '📄';
      case 'nda': return '🔒';
      case 'proposal': return '📋';
      case 'report': return '📊';
      case 'presentation': return '📽️';
      case 'invoice': return '💰';
      case 'spreadsheet': return '📈';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'archive': return '📦';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600 dark:text-gray-400">Loading documents...</span>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage documents, approvals, and workflows
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <span className="text-xs text-gray-500">
              Last: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🔍 Filters
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📤 Upload Document
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery.query || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={searchQuery.sortBy || 'lastModified'}
              onChange={(e) => handleSort(e.target.value, searchQuery.sortOrder || 'desc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Name</option>
              <option value="lastModified">Last Modified</option>
              <option value="uploadedAt">Upload Date</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => handleSort(searchQuery.sortBy || 'lastModified', searchQuery.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {searchQuery.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {viewMode === 'grid' ? '📋' : '⊞'}
            </button>
            <button
              onClick={loadDocuments}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Refresh documents"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 dark:text-blue-100">
              {selectedDocuments.length} document(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete Selected</span>
                  </>
                )}
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Approve All
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Reject All
              </button>
              <button 
                onClick={() => setSelectedDocuments([])}
                className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List/Grid */}
      {searchResults && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === searchResults.documents.length && searchResults.documents.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResults.total} documents found
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {Math.floor((searchQuery.offset || 0) / (searchQuery.limit || 20)) + 1} of {Math.ceil(searchResults.total / (searchQuery.limit || 20))}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="p-4">
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {searchResults.documents.map((document) => (
                  <div
                    key={document.id}
                    className="document-card flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-2xl">{getTypeIcon(document.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {document.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                          {document.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {document.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Size: {formatFileSize(document.size)}</span>
                        <span>Modified: {document.lastModified.toLocaleDateString()}</span>
                        <span>By: {document.lastModifiedBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        title="View document"
                      >
                        👁️ View
                      </button>
                      
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownloadDocument(document)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                        title="Download document"
                      >
                        ⬇️ Download
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                        title="Delete document"
                      >
                        🗑️ Delete
                      </button>
                      
                      {/* Approval Buttons */}
                      {document.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleApproveDocument(document.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            title="Approve document"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleRejectDocument(document.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            title="Reject document"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid view with similar enhancements...
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.documents.map((document) => (
                  <div
                    key={document.id}
                    className="document-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">{getTypeIcon(document.type)}</div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {document.name}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                      <div>Size: {formatFileSize(document.size)}</div>
                      <div>Modified: {document.lastModified.toLocaleDateString()}</div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={isDeleting}
                          className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-red-400"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      
                      {document.status === 'pending_review' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveDocument(document.id)}
                            className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleRejectDocument(document.id)}
                            className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(files) => {
            console.log('Uploading files:', files);
            setShowUploadModal(false);
            addNotification({
              type: 'success',
              title: 'Upload Started',
              message: `Uploading ${files.length} file(s)`,
              userId: authState.user?.id || ''
            });
          }}
        />
      )}

      {/* Document View Modal */}
      {viewedDocument && (
        <DocumentViewModal
          document={viewedDocument}
          onClose={() => setViewedDocument(null)}
        />
      )}
    </div>
  );
};

export default DocumentsPage;