import React, { useState, useEffect } from 'react';
import { Document } from '../../types/documents';

interface DocumentViewModalProps {
  document: Document;
  onClose: () => void;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({ document, onClose }) => {
  const isPDF = document.mimeType === 'application/pdf';
  const isImage = document.mimeType.startsWith('image/');
  const [previewError, setPreviewError] = useState(false);
  const [errorType, setErrorType] = useState<'loading' | 'format' | 'permission' | 'network' | 'unknown'>('unknown');
  const [isRetrying, setIsRetrying] = useState(false);
  const [useAlternateViewer, setUseAlternateViewer] = useState(false);
  
  // Try main URL first, then fallback to alternate URLs
  const primaryUrl = document.previewUrl || '';
  const fallbackUrl = document.url || '';
  const previewUrl = useAlternateViewer ? fallbackUrl : primaryUrl || fallbackUrl;
  
  // Reset error state when document changes or on retry
  useEffect(() => {
    setPreviewError(false);
    setErrorType('unknown');
    console.log('Document for preview:', document);
  }, [document, isRetrying]);

  // Handle retry logic
  const handleRetry = () => {
    setIsRetrying(prev => !prev);
    if (!useAlternateViewer && primaryUrl !== fallbackUrl) {
      setUseAlternateViewer(true);
    }
  };

  // Detect network issues
  useEffect(() => {
    const handleOnlineStatus = () => {
      if (!navigator.onLine && previewError) {
        setErrorType('network');
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [previewError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{document.name}</h2>
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div><b>Type:</b> {document.type}</div>
          <div><b>Status:</b> {document.status}</div>
          <div><b>Size:</b> {Math.round(document.size / 1024)} KB</div>
          <div><b>Uploaded:</b> {document.uploadedAt.toLocaleDateString()}</div>
          <div><b>By:</b> {document.uploadedBy}</div>
          <div><b>Last Modified:</b> {document.lastModified.toLocaleDateString()}</div>
          {document.tags && <div><b>Tags:</b> {document.tags.join(', ')}</div>}
        </div>
        
        {document.description && (
          <div className="mb-4">
            <b>Description:</b>
            <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{document.description}</div>
          </div>
        )}
        
        {document.customFields && Object.keys(document.customFields).length > 0 && (
          <div className="mb-4">
            <b>Custom Fields:</b>
            <pre className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs overflow-x-auto">
              {JSON.stringify(document.customFields, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Preview Section with enhanced error handling, fallbacks, and retry */}
        <div className="mb-4 border rounded p-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center mb-2">
            <b className="text-lg">Preview:</b>
            <div className="flex space-x-2">
              {previewError && (
                <button 
                  onClick={handleRetry}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
              {primaryUrl && fallbackUrl && primaryUrl !== fallbackUrl && (
                <button
                  onClick={() => setUseAlternateViewer(!useAlternateViewer)}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {useAlternateViewer ? 'Try Primary Viewer' : 'Try Alternate Viewer'}
                </button>
              )}
            </div>
          </div>
          
          {!previewError && isPDF && previewUrl && (
            <div className="relative">
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="w-full h-96 border rounded bg-white"
                onError={(e) => {
                  console.error('PDF preview error:', e);
                  setPreviewError(true);
                  // Determine error type from event details if possible
                  const target = e.target as HTMLIFrameElement;
                  if (!navigator.onLine) {
                    setErrorType('network');
                  } else if (target.contentDocument?.body.textContent?.includes('permission')) {
                    setErrorType('permission');
                  } else {
                    setErrorType('loading');
                  }
                }}
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}
          
          {!previewError && isImage && previewUrl && (
            <img
              src={previewUrl}
              alt="Document Preview"
              className="max-w-full max-h-96 rounded border mx-auto"
              onError={(e) => {
                console.error('Image preview error:', e);
                setPreviewError(true);
                setErrorType(navigator.onLine ? 'loading' : 'network');
              }}
            />
          )}
          
          {!previewError && !isPDF && !isImage && previewUrl && (
            <div className="text-center p-4 border rounded bg-white dark:bg-gray-600">
              <p className="mb-2">Preview not available for this file type ({document.mimeType}).</p>
              <p>Please download the file to view its contents.</p>
            </div>
          )}
          
          {previewError && (
            <div className="p-4 bg-white dark:bg-gray-600 border border-red-200 dark:border-red-900 rounded">
              <div className="text-red-600 dark:text-red-400 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <b>Preview unavailable:</b> The document could not be loaded.
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {errorType === 'network' && (
                  <p>Network error - Please check your internet connection and try again.</p>
                )}
                {errorType === 'permission' && (
                  <p>Permission denied - You may not have access to preview this document.</p>
                )}
                {errorType === 'format' && (
                  <p>Format error - The document format may not be supported by the previewer.</p>
                )}
                {errorType === 'loading' && (
                  <p>Loading error - The document failed to load. It may be corrupted or inaccessible.</p>
                )}
                {errorType === 'unknown' && (
                  <p>Unknown error - Please try downloading the document instead.</p>
                )}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>File details: {document.mimeType}, {Math.round(document.size / 1024)} KB</p>
                <p>Status: {document.status}</p>
                <p className="mt-2">Troubleshooting tips:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>Try using a different browser</li>
                  <li>Clear your browser cache</li>
                  <li>Check if you have proper permissions</li>
                  <li>Download the file instead of previewing</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <a
            href={document.url || '#'}
            download={document.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ⬇️ Download
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewModal;
