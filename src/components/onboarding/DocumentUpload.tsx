import React, { useState, useRef } from 'react';
import { usePartnerOnboarding } from '../../context/PartnerOnboardingContext';

const DocumentUpload: React.FC = () => {
  const { state, uploadDocument } = usePartnerOnboarding();
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state) return null;

  const kycStage = state.stages.find(s => s.id === 'kyc');
  const documents = kycStage?.requirements || [];

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocument(documentId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocument) return;

    setIsUploading(true);
    try {
      // Upload to onboarding system
      await uploadDocument(selectedDocument, file);
      
      // Sync to CRM document management system
      if (state?.partnerInfo) {
        const { unifiedDocumentService } = await import('../../services/unifiedDocumentService');
        
        const crmDocument = await unifiedDocumentService.syncOnboardingDocumentToCRM(
          file,
          'kyc',
          state.partnerInfo,
          'kyc',
          selectedDocument
        );
        
        if (crmDocument) {
          console.log('✅ Document synced to CRM:', crmDocument.id);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setSelectedDocument('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'uploaded': return { icon: '✅', color: 'text-green-400', text: 'Uploaded' };
      case 'received': return { icon: '📨', color: 'text-blue-400', text: 'Received' };
      case 'approved': return { icon: '✅', color: 'text-green-400', text: 'Approved' };
      case 'rejected': return { icon: '❌', color: 'text-red-400', text: 'Rejected' };
      default: return { icon: '⏳', color: 'text-gray-400', text: 'Pending' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Document Upload</h4>
        <div className="text-sm text-gray-400">
          {documents.filter(d => d.status !== 'pending').length} / {documents.length} completed
        </div>
      </div>

      {/* Required Documents */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-300">Required Documents</h5>
        {documents.filter(doc => doc.required).map((document) => {
          const status = getDocumentStatus(document.status);
          const canUpload = document.status === 'pending' || document.status === 'rejected';
          
          return (
            <div key={document.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className={`mr-2 ${status.color}`}>{status.icon}</span>
                  <span className="font-medium text-sm">{document.label}</span>
                  <span className={`ml-2 text-xs ${status.color}`}>({status.text})</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{document.description}</p>
                {document.fileName && (
                  <p className="text-xs text-blue-400 mt-1">File: {document.fileName}</p>
                )}
                {document.rejectionReason && (
                  <p className="text-xs text-red-400 mt-1">Reason: {document.rejectionReason}</p>
                )}
              </div>
              
              {canUpload && (
                <button
                  onClick={() => handleDocumentSelect(document.id)}
                  disabled={isUploading}
                  className="ml-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  {isUploading && selectedDocument === document.id ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Conditional Documents */}
      {documents.some(doc => doc.conditional) && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-300">Conditional Documents</h5>
          {documents.filter(doc => doc.conditional).map((document) => {
            const status = getDocumentStatus(document.status);
            const canUpload = document.status === 'pending' || document.status === 'rejected';
            
            return (
              <div key={document.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-yellow-500/30">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`mr-2 ${status.color}`}>{status.icon}</span>
                    <span className="font-medium text-sm">{document.label}</span>
                    <span className={`ml-2 text-xs ${status.color}`}>({status.text})</span>
                    <span className="ml-2 text-xs text-yellow-400">(Conditional)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{document.description}</p>
                  {document.conditionDescription && (
                    <p className="text-xs text-yellow-400 mt-1 italic">{document.conditionDescription}</p>
                  )}
                  {document.fileName && (
                    <p className="text-xs text-blue-400 mt-1">File: {document.fileName}</p>
                  )}
                  {document.rejectionReason && (
                    <p className="text-xs text-red-400 mt-1">Reason: {document.rejectionReason}</p>
                  )}
                </div>
                
                {canUpload && (
                  <button
                    onClick={() => handleDocumentSelect(document.id)}
                    disabled={isUploading}
                    className="ml-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-xs px-3 py-1 rounded transition-colors"
                  >
                    {isUploading && selectedDocument === document.id ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Email Alternative */}
      <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">📧</span>
          <span className="font-medium text-sm">Alternative: Email Submission</span>
        </div>
        <p className="text-xs text-gray-300">
          You can also email your documents to: <strong>partnerships@digitnine.com</strong>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Please include the document name in your email subject for faster processing.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
    </div>
  );
};

export default DocumentUpload; 