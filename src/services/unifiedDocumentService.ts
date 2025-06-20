import { documentService } from './documentService';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '../types/documents';
import { PartnerInfo } from '../types/partnerOnboarding';

// Unified Document Service that bridges onboarding and CRM
class UnifiedDocumentService {
  
  // Sync onboarding document to CRM system
  async syncOnboardingDocumentToCRM(
    file: File,
    documentType: 'nda' | 'kyc' | 'agreement' | 'commercial' | 'other',
    partnerInfo: PartnerInfo,
    stageId?: string,
    documentId?: string
  ): Promise<Document | null> {
    try {
      console.log('🔄 Syncing onboarding document to CRM:', {
        fileName: file.name,
        documentType,
        partnerCompany: partnerInfo.organization,
        stageId
      });

      // Create document metadata
      const documentMetadata = this.createUnifiedDocumentMetadata(
        file, 
        documentType, 
        partnerInfo, 
        stageId, 
        documentId
      );
      
      // Add to CRM document management system
      const crmDocument = await this.addToCRMSystem(documentMetadata);
      
      if (crmDocument) {
        console.log('✅ Document successfully synced to CRM:', crmDocument.id);
        
        // Trigger notifications for relevant teams
        await this.triggerDocumentNotifications(crmDocument, partnerInfo, documentType);
      }
      
      return crmDocument;
    } catch (error) {
      console.error('❌ Failed to sync onboarding document to CRM:', error);
      return null;
    }
  }

  private createUnifiedDocumentMetadata(
    file: File,
    documentType: 'nda' | 'kyc' | 'agreement' | 'commercial' | 'other',
    partnerInfo: PartnerInfo,
    stageId?: string,
    documentId?: string
  ): Partial<Document> {
    const now = new Date();
    
    // Enhanced type mapping with better categorization
    const typeMapping: Record<string, { 
      type: DocumentType; 
      category: DocumentCategory; 
      status: DocumentStatus;
      workflowType?: string;
    }> = {
      nda: {
        type: 'nda',
        category: 'legal',
        status: 'pending_review',
        workflowType: 'NDA Quick Approval'
      },
      kyc: {
        type: 'other',
        category: 'compliance',
        status: 'pending_review',
        workflowType: 'Partnership Agreement Approval'
      },
      agreement: {
        type: 'contract',
        category: 'partnership',
        status: 'pending_review',
        workflowType: 'Partnership Agreement Approval'
      },
      commercial: {
        type: 'proposal',
        category: 'financial',
        status: 'pending_review'
      },
      other: {
        type: 'other',
        category: 'partnership',
        status: 'draft'
      }
    };

    const mapping = typeMapping[documentType] || typeMapping.other;
    
    // Generate comprehensive document name
    const documentName = this.generateUnifiedDocumentName(
      file.name, 
      documentType, 
      partnerInfo.organization,
      documentId
    );
    
    return {
      name: documentName,
      description: this.generateDocumentDescription(documentType, partnerInfo, stageId),
      type: mapping.type,
      category: mapping.category,
      size: file.size,
      mimeType: file.type || this.getMimeTypeFromExtension(file.name),
      uploadedAt: now,
      uploadedBy: `${partnerInfo.name} (${partnerInfo.email})`,
      lastModified: now,
      lastModifiedBy: `${partnerInfo.name} (${partnerInfo.email})`,
      version: '1.0',
      status: mapping.status,
      tags: this.generateUnifiedTags(documentType, partnerInfo, stageId, documentId),
      customFields: {
        source: 'partner_onboarding',
        partnerCompany: partnerInfo.organization,
        partnerContact: partnerInfo.name,
        partnerEmail: partnerInfo.email,
        partnerPhone: partnerInfo.phone,
        partnerCountry: partnerInfo.country,
        partnerRole: partnerInfo.role,
        onboardingStage: stageId,
        documentId: documentId,
        uploadedVia: 'onboarding_flow',
        syncedAt: now.toISOString()
      }
    };
  }

  private generateUnifiedDocumentName(
    fileName: string, 
    documentType: string, 
    companyName: string,
    documentId?: string
  ): string {
    const cleanFileName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docIdSuffix = documentId ? ` (${documentId})` : '';
    
    switch (documentType) {
      case 'nda':
        return `NDA - ${companyName} - ${timestamp}${docIdSuffix}`;
      case 'kyc':
        return `KYC - ${companyName} - ${cleanFileName}${docIdSuffix}`;
      case 'agreement':
        return `Partnership Agreement - ${companyName} - ${timestamp}${docIdSuffix}`;
      case 'commercial':
        return `Commercial Terms - ${companyName} - ${timestamp}${docIdSuffix}`;
      default:
        return `${cleanFileName} - ${companyName} - ${timestamp}${docIdSuffix}`;
    }
  }

  private generateDocumentDescription(
    documentType: string, 
    partnerInfo: PartnerInfo, 
    stageId?: string
  ): string {
    const baseDescription = `${documentType.toUpperCase()} document uploaded by ${partnerInfo.organization}`;
    const stageInfo = stageId ? ` during ${stageId} stage` : '';
    
    return `${baseDescription}${stageInfo} of partner onboarding. Contact: ${partnerInfo.name} (${partnerInfo.email})`;
  }

  private generateUnifiedTags(
    documentType: string, 
    partnerInfo: PartnerInfo, 
    stageId?: string,
    documentId?: string
  ): string[] {
    const baseTags = [
      documentType,
      'onboarding',
      'partner',
      partnerInfo.organization.toLowerCase().replace(/\s+/g, '-'),
      'auto-synced'
    ];

    // Add stage-specific tags
    if (stageId) {
      baseTags.push(`stage-${stageId}`);
    }

    // Add document-specific tags
    if (documentId) {
      baseTags.push(`doc-${documentId}`);
    }

    // Add urgency and workflow tags
    switch (documentType) {
      case 'nda':
        baseTags.push('legal-review', 'confidential', 'high-priority');
        break;
      case 'kyc':
        baseTags.push('compliance-review', 'kyc-required', 'regulatory');
        break;
      case 'agreement':
        baseTags.push('final-agreement', 'signature-required', 'legal-binding');
        break;
      case 'commercial':
        baseTags.push('pricing', 'terms', 'business-review');
        break;
    }

    return baseTags;
  }

  private getMimeTypeFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      txt: 'text/plain',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private async addToCRMSystem(documentMetadata: Partial<Document>): Promise<Document | null> {
    try {
      // Create a new document in the CRM system
      const newDocument: Document = {
        id: `unified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: documentMetadata.name || 'Untitled Document',
        description: documentMetadata.description || '',
        type: documentMetadata.type || 'other',
        category: documentMetadata.category || 'partnership',
        size: documentMetadata.size || 0,
        mimeType: documentMetadata.mimeType || 'application/octet-stream',
        uploadedAt: documentMetadata.uploadedAt || new Date(),
        uploadedBy: documentMetadata.uploadedBy || 'Unknown',
        lastModified: documentMetadata.lastModified || new Date(),
        lastModifiedBy: documentMetadata.lastModifiedBy || 'Unknown',
        version: documentMetadata.version || '1.0',
        status: documentMetadata.status || 'draft',
        tags: documentMetadata.tags || [],
        customFields: documentMetadata.customFields || {},
        url: `/api/documents/${encodeURIComponent(documentMetadata.name || 'document')}/download`,
        thumbnailUrl: `/api/documents/${encodeURIComponent(documentMetadata.name || 'document')}/thumbnail`,
        previewUrl: `/api/documents/${encodeURIComponent(documentMetadata.name || 'document')}/preview`,
        checksum: this.generateChecksum(),
        accessLog: [{
          id: `log-${Date.now()}`,
          userId: 'onboarding-system',
          userName: 'Onboarding System',
          action: 'upload_version',
          timestamp: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Unified Document Service',
          details: {
            source: 'partner_onboarding',
            partnerCompany: documentMetadata.customFields?.partnerCompany
          }
        }],
        versionHistory: [{
          version: '1.0',
          uploadedAt: documentMetadata.uploadedAt || new Date(),
          uploadedBy: documentMetadata.uploadedBy || 'Unknown',
          changes: 'Initial upload from partner onboarding system',
          size: documentMetadata.size || 0,
          checksum: this.generateChecksum(),
          status: documentMetadata.status || 'draft'
        }],
        relatedDocuments: []
      };

      // Add appropriate approval workflow
      await this.attachApprovalWorkflow(newDocument);

      // Add to document service using the public API
      try {
        // Use the createDocument method if available, otherwise access the private array
        const serviceInstance = documentService as any;
        if (typeof serviceInstance.createDocument === 'function') {
          await serviceInstance.createDocument(newDocument);
        } else if (serviceInstance.documents && Array.isArray(serviceInstance.documents)) {
          serviceInstance.documents.unshift(newDocument);
        } else {
          console.warn('⚠️ Unable to add document to CRM - no accessible method found');
          return null;
        }
        
        console.log('✅ Document successfully added to CRM system:', newDocument.name);
        console.log('📄 Document ID:', newDocument.id);
        console.log('🏷️ Document tags:', newDocument.tags);
        console.log('📊 Custom fields:', newDocument.customFields);
        
        // Verify the document was added by searching for it
        setTimeout(async () => {
          try {
            // Try multiple search approaches to verify the document exists
            console.log('🔍 Starting document verification...');
            
            // Search by exact ID
            const idSearchResults = await documentService.searchDocuments({
              query: newDocument.id,
              limit: 5
            });
            console.log('🔍 ID search results:', idSearchResults.documents.length);
            
            // Search by document name
            const nameSearchResults = await documentService.searchDocuments({
              query: newDocument.name,
              limit: 5
            });
            console.log('🔍 Name search results:', nameSearchResults.documents.length);
            
            // Get all documents and check directly
            const allResults = await documentService.searchDocuments({
              query: '',
              limit: 100
            });
            console.log('🔍 Total documents after addition:', allResults.documents.length);
            
            const foundDoc = allResults.documents.find(d => d.id === newDocument.id);
            console.log('✅ Document verification:', foundDoc ? 'FOUND' : 'NOT FOUND');
            
            if (foundDoc) {
              console.log('📄 Verified document details:', {
                id: foundDoc.id,
                name: foundDoc.name,
                type: foundDoc.type,
                status: foundDoc.status
              });
            } else {
              console.warn('⚠️ Document not found in verification search');
              // Try to find it by checking the service directly
              const directDoc = await documentService.getDocument(newDocument.id);
              console.log('🔍 Direct document lookup:', directDoc ? 'FOUND' : 'NOT FOUND');
            }
          } catch (error) {
            console.error('❌ Document verification failed:', error);
          }
        }, 1500); // Increased delay to ensure document is properly indexed
        
      } catch (addError) {
        console.error('❌ Failed to add document to CRM service:', addError);
        return null;
      }

      return newDocument;
    } catch (error) {
      console.error('❌ Failed to create document for CRM system:', error);
      return null;
    }
  }

  private async attachApprovalWorkflow(document: Document): Promise<void> {
    try {
      const workflows = await documentService.getWorkflows();
      
      // Attach appropriate workflow based on document type
      if (document.type === 'nda') {
        const ndaWorkflow = workflows.find(w => w.name === 'NDA Quick Approval');
        if (ndaWorkflow) {
          document.approvalWorkflow = { 
            ...ndaWorkflow,
            id: `workflow-${document.id}`,
            createdAt: new Date()
          };
        }
      } else if (document.type === 'contract' || document.category === 'compliance') {
        const partnershipWorkflow = workflows.find(w => w.name === 'Partnership Agreement Approval');
        if (partnershipWorkflow) {
          document.approvalWorkflow = { 
            ...partnershipWorkflow,
            id: `workflow-${document.id}`,
            createdAt: new Date()
          };
        }
      }
    } catch (error) {
      console.error('Failed to attach approval workflow:', error);
    }
  }

  private async triggerDocumentNotifications(
    document: Document, 
    partnerInfo: PartnerInfo, 
    documentType: string
  ): Promise<void> {
    // In a real implementation, this would trigger actual notifications
    console.log('🔔 Triggering notifications for document:', {
      documentId: document.id,
      documentName: document.name,
      partnerCompany: partnerInfo.organization,
      documentType,
      approvalRequired: !!document.approvalWorkflow
    });

    // Simulate notification dispatch
    const notificationData = {
      type: 'document_uploaded',
      title: `New ${documentType.toUpperCase()} Document Uploaded`,
      message: `${partnerInfo.organization} has uploaded a ${documentType} document: ${document.name}`,
      documentId: document.id,
      partnerInfo,
      timestamp: new Date(),
      requiresApproval: !!document.approvalWorkflow
    };

    // In a real app, this would send to notification service
    console.log('📧 Notification data:', notificationData);
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Get all documents for a specific partner
  async getPartnerDocuments(partnerEmail: string): Promise<Document[]> {
    try {
      const searchResults = await documentService.searchDocuments({
        query: partnerEmail,
        limit: 100
      });
      
      return searchResults.documents.filter(doc => 
        doc.customFields?.partnerEmail === partnerEmail ||
        doc.uploadedBy.includes(partnerEmail)
      );
    } catch (error) {
      console.error('Failed to get partner documents:', error);
      return [];
    }
  }

  // Update document status from onboarding workflow
  async updateDocumentFromOnboarding(
    documentId: string, 
    status: DocumentStatus, 
    comments?: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update the document in the database
      console.log('🔄 Updating document status from onboarding:', {
        documentId,
        status,
        comments
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update document from onboarding:', error);
      return false;
    }
  }

  // Sync partner information updates to all their documents
  async syncPartnerInfoToDocuments(partnerInfo: PartnerInfo): Promise<void> {
    try {
      const partnerDocuments = await this.getPartnerDocuments(partnerInfo.email);
      
      for (const document of partnerDocuments) {
        // Update custom fields with latest partner info
        document.customFields = {
          ...document.customFields,
          partnerCompany: partnerInfo.organization,
          partnerContact: partnerInfo.name,
          partnerPhone: partnerInfo.phone,
          partnerCountry: partnerInfo.country,
          partnerRole: partnerInfo.role,
          lastSyncedAt: new Date().toISOString()
        };
      }
      
      console.log(`✅ Synced partner info to ${partnerDocuments.length} documents`);
    } catch (error) {
      console.error('Failed to sync partner info to documents:', error);
    }
  }
}

// Export singleton instance
export const unifiedDocumentService = new UnifiedDocumentService();
export default unifiedDocumentService; 