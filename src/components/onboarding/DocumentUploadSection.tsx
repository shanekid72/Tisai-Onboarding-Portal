import React, { useState, useRef } from 'react';
import { ComplianceDocument } from '../../types/partnerOnboarding';
import { usePartnerOnboarding } from '../../context/PartnerOnboardingContext';

interface DocumentUploadSectionProps {
  documents: ComplianceDocument[];
}

const DocumentCard: React.FC<{ document: ComplianceDocument; onUpload: (file: File) => void }> = ({ 
  document, 
  onUpload 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
      onUpload(file);
      // Update local state immediately to show upload completion
      document.status = file.name === 'skipped' ? 'approved' : 'uploaded';
      document.fileName = file.name === 'skipped' ? 'Skipped (Optional)' : file.name;
      document.uploadDate = new Date();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'uploaded':
      case 'received':
        return '✅';
      case 'approved':
        return document.fileName === 'Skipped (Optional)' ? '⏭️' : '🎉';
      case 'rejected':
        return '❌';
      default:
        return document.required ? '📄' : '📋';
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'uploaded':
      case 'received':
        return 'border-green-500/50 bg-green-500/10';
      case 'approved':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'rejected':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return document.required 
          ? 'border-yellow-500/50 bg-yellow-500/5' 
          : 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const isCompleted = document.status === 'uploaded' || document.status === 'received' || document.status === 'approved';

  return (
    <div className={`relative group transition-all duration-300 hover:scale-[1.02] ${getStatusColor()} border-2 rounded-xl p-6 backdrop-blur-sm`}>
      {/* Required/Optional Badge */}
      <div className="absolute -top-2 -right-2">
        {isCompleted ? (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Completed
          </span>
        ) : document.required ? (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Required
          </span>
        ) : (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Optional
          </span>
        )}
      </div>

      {/* Document Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getStatusIcon()}</div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {document.label}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {document.description}
            </p>
            {document.conditional && (
              <p className="text-xs text-blue-400 mt-2 italic">
                💡 {document.conditionDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {isCompleted ? (
        <div className={`${document.fileName === 'Skipped (Optional)' ? 'bg-gray-600/20 border border-gray-500/30' : 'bg-green-600/20 border border-green-500/30'} rounded-lg p-4 mb-4`}>
          <div className="flex items-center space-x-2">
            <span className={document.fileName === 'Skipped (Optional)' ? 'text-gray-400' : 'text-green-400'}>
              {document.fileName === 'Skipped (Optional)' ? '⏭️' : '✅'}
            </span>
            <span className={`${document.fileName === 'Skipped (Optional)' ? 'text-gray-400' : 'text-green-400'} font-medium`}>
              {document.fileName === 'Skipped (Optional)' ? 'Skipped (Optional Document)' : 
               document.fileName ? `Uploaded: ${document.fileName}` : 'Document Received'}
            </span>
          </div>
          {document.uploadDate && (
            <p className={`text-xs ${document.fileName === 'Skipped (Optional)' ? 'text-gray-300' : 'text-green-300'} mt-1`}>
              {document.fileName === 'Skipped (Optional)' ? 'Skipped on' : 'Uploaded on'} {
                document.uploadDate instanceof Date 
                  ? document.uploadDate.toLocaleDateString()
                  : new Date(document.uploadDate).toLocaleDateString()
              }
            </p>
          )}
        </div>
      ) : (
        /* Upload Area */
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer
            ${isDragOver 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3">
              <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-blue-400 font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">
                  {isDragOver ? 'Drop file here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-400">
          📧 Alternative: Email to partnerships@digitnine.com
        </div>
        {!isCompleted ? (
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Choose File</span>
            </button>
            
            {/* Skip button for optional documents */}
            {!document.required && (
              <button
                onClick={() => handleFileSelect(new File([], 'skipped'))}
                disabled={isUploading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Skip</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(`#document-${document.id}`, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />
    </div>
  );
};

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ documents }) => {
  const { uploadDocument, skipOptionalDocument, state } = usePartnerOnboarding();

  const handleDocumentUpload = async (documentId: string, file: File) => {
    try {
      if (file.name === 'skipped') {
        // Handle skipped optional document
        await skipDocument(documentId);
      } else {
        // Upload to onboarding system
        await uploadDocument(documentId, file);
        
        // Sync to CRM document management system
        if (state?.partnerInfo) {
          const { unifiedDocumentService } = await import('../../services/unifiedDocumentService');
          
          const crmDocument = await unifiedDocumentService.syncOnboardingDocumentToCRM(
            file,
            'kyc',
            state.partnerInfo,
            'kyc',
            documentId
          );
          
          if (crmDocument) {
            console.log('✅ KYC document synced to CRM:', crmDocument.id);
          }
        }
      }
      
      // Force UI refresh by updating document count
      const updatedDocs = [...documents];
      const docIndex = updatedDocs.findIndex(doc => doc.id === documentId);
      
      if (docIndex !== -1) {
        updatedDocs[docIndex].status = file.name === 'skipped' ? 'approved' : 'uploaded';
        updatedDocs[docIndex].fileName = file.name === 'skipped' ? 'Skipped (Optional)' : file.name;
        updatedDocs[docIndex].uploadDate = new Date();
      }
      
      // Update progress display
      const completedDocsCount = updatedDocs.filter(doc => 
        doc.status === 'uploaded' || doc.status === 'received' || doc.status === 'approved'
      ).length;
      
      console.log(`📊 Documents progress updated: ${completedDocsCount}/${documents.length}`);
      
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const skipDocument = async (documentId: string) => {
    await skipOptionalDocument(documentId);
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const optionalDocs = documents.filter(doc => !doc.required);
  const completedCount = documents.filter(doc => 
    doc.status === 'uploaded' || doc.status === 'received' || doc.status === 'approved'
  ).length;

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">📋 KYC Document Upload</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="text-xl font-bold text-blue-400">
              {completedCount}/{documents.length} Complete
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / documents.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-300">
            Please upload all required documents to proceed. You can upload files directly or email them to partnerships@digitnine.com
          </p>
          
          {completedCount > 0 && (
            <div className="bg-green-600/20 border border-green-500/30 px-3 py-1 rounded-md">
              <span className="text-green-400 text-sm font-medium">
                ✅ {completedCount} document{completedCount !== 1 ? 's' : ''} uploaded
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Required Documents */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="text-red-400 mr-2">⭐</span>
          Required Documents ({requiredDocs.filter(doc => doc.status === 'pending').length} remaining)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requiredDocs.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onUpload={(file) => handleDocumentUpload(document.id, file)}
            />
          ))}
        </div>
      </div>

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="text-blue-400 mr-2">📋</span>
            Optional Documents
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {optionalDocs.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onUpload={(file) => handleDocumentUpload(document.id, file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
          <span className="text-yellow-400 mr-2">💡</span>
          Need Help?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-medium text-white mb-2">📧 Email Support</p>
            <p>Send documents to: partnerships@digitnine.com</p>
            <p>Include document name in subject line</p>
          </div>
          <div>
            <p className="font-medium text-white mb-2">📞 Phone Support</p>
            <p>Call us at: +1 (555) 123-4567</p>
            <p>Available 9 AM - 6 PM EST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadSection; 