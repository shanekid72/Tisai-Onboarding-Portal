import { 
  Document, 
  DocumentMetadata, 
  DocumentType, 
  DocumentCategory, 
  DocumentStatus,
  ApprovalWorkflow,
  ApprovalStep,
  ApprovalAction,
  DocumentFolder,
  DocumentTemplate,
  DocumentSearchQuery,
  DocumentSearchResult,
  DocumentAnalytics,
  DocumentComment,
  DocumentShare,
  BulkOperation,
  AccessLogEntry,
  DocumentVersion
} from '../types/documents';

// Mock data generators
class DocumentService {
  private documents: Document[] = [];
  private folders: DocumentFolder[] = [];
  private templates: DocumentTemplate[] = [];
  private workflows: ApprovalWorkflow[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Try to load from localStorage first
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('crm_documents') : null;
    if (stored) {
      try {
        this.documents = JSON.parse(stored).map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          lastModified: new Date(doc.lastModified),
          expirationDate: doc.expirationDate ? new Date(doc.expirationDate) : undefined
        }));
        return;
      } catch (e) {
        console.warn('Failed to parse documents from localStorage, using mock data.');
      }
    }
    // Generate mock folders
    this.folders = this.generateMockFolders();
    
    // Generate mock templates
    this.templates = this.generateMockTemplates();
    
    // Generate mock workflows
    this.workflows = this.generateMockWorkflows();
    
    // Generate mock documents
    this.documents = this.generateMockDocuments();
    this.saveDocumentsToStorage();
  }

  private saveDocumentsToStorage() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('crm_documents', JSON.stringify(this.documents));
    }
  }

  private generateMockFolders(): DocumentFolder[] {
    return [
      {
        id: 'folder-1',
        name: 'Legal Documents',
        description: 'All legal documents and contracts',
        path: '/legal',
        permissions: [
          { userId: 'user-1', role: 'owner', permissions: ['read', 'write', 'delete', 'share', 'admin'] }
        ],
        createdAt: new Date('2024-01-15'),
        createdBy: 'Legal Team',
        documentCount: 25,
        subfolderCount: 3
      },
      {
        id: 'folder-2',
        name: 'Partnership Agreements',
        description: 'Partnership contracts and NDAs',
        parentId: 'folder-1',
        path: '/legal/partnerships',
        permissions: [
          { userId: 'user-1', role: 'owner', permissions: ['read', 'write', 'delete', 'share', 'admin'] }
        ],
        createdAt: new Date('2024-01-20'),
        createdBy: 'Partnership Team',
        documentCount: 12,
        subfolderCount: 0
      },
      {
        id: 'folder-3',
        name: 'Financial Reports',
        description: 'Financial statements and reports',
        path: '/financial',
        permissions: [
          { userId: 'user-2', role: 'owner', permissions: ['read', 'write', 'delete', 'share', 'admin'] }
        ],
        createdAt: new Date('2024-02-01'),
        createdBy: 'Finance Team',
        documentCount: 18,
        subfolderCount: 2
      },
      {
        id: 'folder-4',
        name: 'Technical Documentation',
        description: 'API docs, integration guides, and technical specs',
        path: '/technical',
        permissions: [
          { userId: 'user-3', role: 'owner', permissions: ['read', 'write', 'delete', 'share', 'admin'] }
        ],
        createdAt: new Date('2024-02-10'),
        createdBy: 'Tech Team',
        documentCount: 35,
        subfolderCount: 4
      }
    ];
  }

  private generateMockTemplates(): DocumentTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Partnership Agreement Template',
        description: 'Standard template for partnership agreements',
        category: 'legal',
        templateContent: `
PARTNERSHIP AGREEMENT

This Partnership Agreement is entered into on {{date}} between {{company1}} and {{company2}}.

1. PARTNERSHIP TERMS
   - Duration: {{duration}}
   - Revenue Share: {{revenueShare}}%
   - Territory: {{territory}}

2. RESPONSIBILITIES
   {{company1}} Responsibilities:
   - {{responsibility1}}
   
   {{company2}} Responsibilities:
   - {{responsibility2}}

3. FINANCIAL TERMS
   - Initial Investment: {{initialInvestment}}
   - Payment Terms: {{paymentTerms}}

Signatures:
_________________    _________________
{{company1}}         {{company2}}
        `,
        variables: [
          { name: 'date', type: 'date', required: true },
          { name: 'company1', type: 'text', required: true },
          { name: 'company2', type: 'text', required: true },
          { name: 'duration', type: 'select', required: true, options: ['1 year', '2 years', '3 years', '5 years'] },
          { name: 'revenueShare', type: 'number', required: true, validation: { min: 0, max: 100 } },
          { name: 'territory', type: 'text', required: true },
          { name: 'responsibility1', type: 'text', required: true },
          { name: 'responsibility2', type: 'text', required: true },
          { name: 'initialInvestment', type: 'text', required: false },
          { name: 'paymentTerms', type: 'text', required: true }
        ],
        approvalWorkflowId: 'workflow-1',
        createdAt: new Date('2024-01-10'),
        createdBy: 'Legal Team',
        isActive: true
      },
      {
        id: 'template-2',
        name: 'NDA Template',
        description: 'Non-disclosure agreement template',
        category: 'legal',
        templateContent: `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into on {{date}} between {{disclosingParty}} and {{receivingParty}}.

1. CONFIDENTIAL INFORMATION
   The parties agree that confidential information includes: {{confidentialInfo}}

2. OBLIGATIONS
   - The receiving party agrees to maintain confidentiality
   - Information shall not be disclosed to third parties
   - Duration of confidentiality: {{duration}}

3. EXCEPTIONS
   This agreement does not apply to information that:
   - Is publicly available
   - Was known prior to disclosure
   - Is independently developed

Signatures:
_________________    _________________
{{disclosingParty}}  {{receivingParty}}
        `,
        variables: [
          { name: 'date', type: 'date', required: true },
          { name: 'disclosingParty', type: 'text', required: true },
          { name: 'receivingParty', type: 'text', required: true },
          { name: 'confidentialInfo', type: 'text', required: true },
          { name: 'duration', type: 'select', required: true, options: ['1 year', '2 years', '3 years', 'Indefinite'] }
        ],
        approvalWorkflowId: 'workflow-2',
        createdAt: new Date('2024-01-15'),
        createdBy: 'Legal Team',
        isActive: true
      }
    ];
  }

  private generateMockWorkflows(): ApprovalWorkflow[] {
    return [
      {
        id: 'workflow-1',
        name: 'Partnership Agreement Approval',
        steps: [
          {
            id: 'step-1',
            name: 'Legal Review',
            description: 'Legal team reviews the partnership agreement',
            approvers: ['legal-team-1', 'legal-team-2'],
            requiredApprovals: 1,
            receivedApprovals: [],
            status: 'pending',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            conditions: [
              { field: 'documentType', operator: 'equals', value: 'contract' }
            ]
          },
          {
            id: 'step-2',
            name: 'Finance Approval',
            description: 'Finance team approves financial terms',
            approvers: ['finance-team-1'],
            requiredApprovals: 1,
            receivedApprovals: [],
            status: 'pending',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          },
          {
            id: 'step-3',
            name: 'Executive Approval',
            description: 'Executive team final approval',
            approvers: ['exec-1', 'exec-2'],
            requiredApprovals: 2,
            receivedApprovals: [],
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          }
        ],
        currentStep: 0,
        status: 'pending',
        createdAt: new Date(),
        requiredApprovals: 4,
        receivedApprovals: 0,
        escalationRules: [
          {
            id: 'escalation-1',
            triggerAfterHours: 72,
            escalateTo: ['manager-1'],
            notificationTemplate: 'Document approval overdue'
          }
        ]
      },
      {
        id: 'workflow-2',
        name: 'NDA Quick Approval',
        steps: [
          {
            id: 'step-1',
            name: 'Legal Review',
            description: 'Quick legal review for standard NDA',
            approvers: ['legal-team-1'],
            requiredApprovals: 1,
            receivedApprovals: [],
            status: 'pending',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
            autoApprove: true
          }
        ],
        currentStep: 0,
        status: 'pending',
        createdAt: new Date(),
        requiredApprovals: 1,
        receivedApprovals: 0,
        autoApprove: true,
        escalationRules: []
      }
    ];
  }

  private generateMockDocuments(): Document[] {
    const documents: Document[] = [];
    const documentTypes: DocumentType[] = ['contract', 'nda', 'proposal', 'report', 'presentation'];
    const categories: DocumentCategory[] = ['legal', 'financial', 'technical', 'partnership'];
    const statuses: DocumentStatus[] = ['draft', 'pending_review', 'approved', 'published'];

    for (let i = 1; i <= 50; i++) {
      const type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const uploadDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Random date within last 90 days

      documents.push({
        id: `doc-${i}`,
        name: this.generateDocumentName(type, i),
        description: `${type} document for ${category} purposes`,
        type,
        category,
        size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        mimeType: this.getMimeType(type),
        uploadedAt: uploadDate,
        uploadedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
        lastModified: new Date(uploadDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastModifiedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
        version: `1.${Math.floor(Math.random() * 10)}`,
        status,
        tags: this.generateTags(type, category),
        customFields: {},
        url: `/api/documents/doc-${i}/download`,
        thumbnailUrl: `/api/documents/doc-${i}/thumbnail`,
        previewUrl: `/api/documents/doc-${i}/preview`,
        checksum: this.generateChecksum(),
        accessLog: this.generateAccessLog(i),
        approvalWorkflow: status === 'pending_review' ? this.workflows[0] : undefined,
        versionHistory: this.generateVersionHistory(uploadDate),
        relatedDocuments: [],
        expirationDate: type === 'contract' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined
      });
    }

    return documents;
  }

  private generateDocumentName(type: DocumentType, index: number): string {
    const names: Record<DocumentType, string[]> = {
      contract: [`Partnership Agreement ${index}`, `Service Contract ${index}`, `Vendor Agreement ${index}`],
      nda: [`NDA with Company ${index}`, `Confidentiality Agreement ${index}`, `Non-Disclosure ${index}`],
      proposal: [`Business Proposal ${index}`, `Project Proposal ${index}`, `Partnership Proposal ${index}`],
      report: [`Monthly Report ${index}`, `Financial Report ${index}`, `Performance Report ${index}`],
      presentation: [`Pitch Deck ${index}`, `Company Overview ${index}`, `Product Demo ${index}`],
      invoice: [`Invoice ${index}`, `Bill ${index}`, `Payment Request ${index}`],
      spreadsheet: [`Data Sheet ${index}`, `Analysis ${index}`, `Report ${index}`],
      image: [`Image ${index}`, `Photo ${index}`, `Diagram ${index}`],
      video: [`Video ${index}`, `Recording ${index}`, `Presentation ${index}`],
      audio: [`Audio ${index}`, `Recording ${index}`, `Meeting ${index}`],
      archive: [`Archive ${index}`, `Backup ${index}`, `Package ${index}`],
      other: [`Document ${index}`, `File ${index}`, `Misc ${index}`]
    };

    const typeNames = names[type];
    return typeNames[Math.floor(Math.random() * typeNames.length)];
  }

  private getMimeType(type: DocumentType): string {
    const mimeTypes: Record<DocumentType, string> = {
      contract: 'application/pdf',
      nda: 'application/pdf',
      proposal: 'application/pdf',
      report: 'application/pdf',
      presentation: 'application/vnd.ms-powerpoint',
      invoice: 'application/pdf',
      spreadsheet: 'application/vnd.ms-excel',
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/mp3',
      archive: 'application/zip',
      other: 'application/octet-stream'
    };

    return mimeTypes[type];
  }

  private generateTags(type: DocumentType, category: DocumentCategory): string[] {
    const baseTags: string[] = [type, category];
    const additionalTags = ['important', 'confidential', 'urgent', 'draft', 'final', 'reviewed'];
    
    const numAdditionalTags = Math.floor(Math.random() * 3);
    for (let i = 0; i < numAdditionalTags; i++) {
      const tag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
      if (!baseTags.includes(tag)) {
        baseTags.push(tag);
      }
    }

    return baseTags;
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateAccessLog(docIndex: number): AccessLogEntry[] {
    const actions: Array<'view' | 'download' | 'edit' | 'share'> = ['view', 'download', 'edit', 'share'];
    const log: AccessLogEntry[] = [];

    const numEntries = Math.floor(Math.random() * 20) + 5; // 5-25 entries
    for (let i = 0; i < numEntries; i++) {
      log.push({
        id: `log-${docIndex}-${i}`,
        userId: `user-${Math.floor(Math.random() * 5) + 1}`,
        userName: `User ${Math.floor(Math.random() * 5) + 1}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }

    return log.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateVersionHistory(uploadDate: Date): DocumentVersion[] {
    const versions: DocumentVersion[] = [];
    const numVersions = Math.floor(Math.random() * 5) + 1; // 1-5 versions

    for (let i = 0; i < numVersions; i++) {
      const versionDate = new Date(uploadDate.getTime() + i * 7 * 24 * 60 * 60 * 1000); // Weekly versions
      versions.push({
        version: `1.${i}`,
        uploadedAt: versionDate,
        uploadedBy: `user-${Math.floor(Math.random() * 3) + 1}`,
        changes: i === 0 ? 'Initial version' : `Updated content and formatting (v1.${i})`,
        size: Math.floor(Math.random() * 1000000) + 500000,
        checksum: this.generateChecksum(),
        status: i === numVersions - 1 ? 'approved' : 'archived'
      });
    }

    return versions;
  }

  // Public API methods
  async searchDocuments(query: DocumentSearchQuery): Promise<DocumentSearchResult> {
    let filteredDocs = [...this.documents];

    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.id.toLowerCase().includes(searchTerm) ||
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.description?.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm) ||
        (doc.customFields?.partnerCompany && doc.customFields.partnerCompany.toLowerCase().includes(searchTerm)) ||
        (doc.customFields?.partnerEmail && doc.customFields.partnerEmail.toLowerCase().includes(searchTerm))
      );
    }

    if (query.type && query.type.length > 0) {
      filteredDocs = filteredDocs.filter(doc => query.type!.includes(doc.type));
    }

    if (query.category && query.category.length > 0) {
      filteredDocs = filteredDocs.filter(doc => query.category!.includes(doc.category));
    }

    if (query.status && query.status.length > 0) {
      filteredDocs = filteredDocs.filter(doc => query.status!.includes(doc.status));
    }

    if (query.dateRange) {
      filteredDocs = filteredDocs.filter(doc => 
        doc.uploadedAt >= query.dateRange!.start && 
        doc.uploadedAt <= query.dateRange!.end
      );
    }

    if (query.tags && query.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc => 
        query.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    // Apply sorting
    if (query.sortBy) {
      filteredDocs.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (query.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'uploadedAt':
            aValue = a.uploadedAt.getTime();
            bValue = b.uploadedAt.getTime();
            break;
          case 'lastModified':
            aValue = a.lastModified.getTime();
            bValue = b.lastModified.getTime();
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          default:
            return 0;
        }

        if (query.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // Apply pagination
    const total = filteredDocs.length;
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paginatedDocs = filteredDocs.slice(offset, offset + limit);

    // Generate facets
    const facets = this.generateFacets(this.documents);

    return {
      documents: paginatedDocs,
      total,
      facets,
      suggestions: query.query ? this.generateSearchSuggestions(query.query) : undefined
    };
  }

  private generateFacets(documents: Document[]) {
    const types = new Map<DocumentType, number>();
    const categories = new Map<DocumentCategory, number>();
    const statuses = new Map<DocumentStatus, number>();
    const tags = new Map<string, number>();

    documents.forEach(doc => {
      types.set(doc.type, (types.get(doc.type) || 0) + 1);
      categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
      statuses.set(doc.status, (statuses.get(doc.status) || 0) + 1);
      
      doc.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
    });

    return {
      types: Array.from(types.entries()).map(([type, count]) => ({ type, count })),
      categories: Array.from(categories.entries()).map(([category, count]) => ({ category, count })),
      statuses: Array.from(statuses.entries()).map(([status, count]) => ({ status, count })),
      tags: Array.from(tags.entries()).map(([tag, count]) => ({ tag, count })).slice(0, 10) // Top 10 tags
    };
  }

  private generateSearchSuggestions(query: string): string[] {
    const suggestions = [
      'partnership agreement',
      'nda template',
      'financial report',
      'technical documentation',
      'contract review',
      'proposal draft'
    ];

    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase()) && 
      suggestion.toLowerCase() !== query.toLowerCase()
    ).slice(0, 5);
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async createDocument(document: Document): Promise<Document> {
    this.documents.unshift(document);
    this.saveDocumentsToStorage();
    
    console.log('📄 Document created in CRM system:', document.name);
    console.log('📊 Document ID:', document.id);
    console.log('📊 Total documents in system:', this.documents.length);
    console.log('🔍 Document position in array:', this.documents.findIndex(d => d.id === document.id));
    
    // Verify the document was added correctly
    const verifyDoc = this.documents.find(d => d.id === document.id);
    if (verifyDoc) {
      console.log('✅ Document successfully added and verified in array');
    } else {
      console.error('❌ Document not found in array after addition');
    }
    
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      console.error('❌ Document not found for deletion:', id);
      return false;
    }
    
    const deletedDoc = this.documents[index];
    this.documents.splice(index, 1);
    this.saveDocumentsToStorage();
    
    console.log('🗑️ Document deleted:', deletedDoc.name);
    console.log('📊 Total documents remaining:', this.documents.length);
    
    return true;
  }

  async deleteMultipleDocuments(ids: string[]): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];
    
    for (const id of ids) {
      try {
        const deleted = await this.deleteDocument(id);
        if (deleted) {
          success.push(id);
        } else {
          failed.push(id);
        }
      } catch (error) {
        console.error('❌ Error deleting document:', id, error);
        failed.push(id);
      }
    }
    
    this.saveDocumentsToStorage();
    console.log(`📊 Bulk delete complete: ${success.length} succeeded, ${failed.length} failed`);
    
    return { success, failed };
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) return null;

    Object.assign(document, updates);
    this.saveDocumentsToStorage();
    return document;
  }

  async getFolders(): Promise<DocumentFolder[]> {
    return [...this.folders];
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    return [...this.templates];
  }

  async getWorkflows(): Promise<ApprovalWorkflow[]> {
    return [...this.workflows];
  }

  async getDocumentAnalytics(documentId: string): Promise<DocumentAnalytics | null> {
    const document = await this.getDocument(documentId);
    if (!document) return null;

    return {
      documentId,
      views: document.accessLog.filter(log => log.action === 'view').length,
      downloads: document.accessLog.filter(log => log.action === 'download').length,
      shares: document.accessLog.filter(log => log.action === 'share').length,
      comments: Math.floor(Math.random() * 10),
      approvals: document.approvalWorkflow?.receivedApprovals || 0,
      rejections: 0,
      averageApprovalTime: 24 + Math.random() * 48, // 24-72 hours
      lastActivity: document.lastModified,
      topViewers: this.generateTopViewers(document.accessLog),
      activityTimeline: this.generateActivityTimeline(document.accessLog)
    };
  }

  private generateTopViewers(accessLog: AccessLogEntry[]) {
    const viewerCounts = new Map<string, { userName: string; count: number }>();
    
    accessLog.filter(log => log.action === 'view').forEach(log => {
      const existing = viewerCounts.get(log.userId);
      if (existing) {
        existing.count++;
      } else {
        viewerCounts.set(log.userId, { userName: log.userName, count: 1 });
      }
    });

    return Array.from(viewerCounts.entries())
      .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateActivityTimeline(accessLog: AccessLogEntry[]) {
    return accessLog.slice(0, 20).map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      userId: log.userId,
      userName: log.userName,
      details: { ipAddress: log.ipAddress }
    }));
  }

  async approveDocument(documentId: string, approverId: string, comments?: string): Promise<boolean> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document || !document.approvalWorkflow) return false;

    const workflow = document.approvalWorkflow;
    const currentStep = workflow.steps[workflow.currentStep];
    
    if (!currentStep.approvers.includes(approverId)) return false;

    const approval: ApprovalAction = {
      id: `approval-${Date.now()}`,
      approverId,
      approverName: `User ${approverId}`,
      action: 'approved',
      timestamp: new Date(),
      comments,
      ipAddress: '192.168.1.100'
    };

    currentStep.receivedApprovals.push(approval);
    workflow.receivedApprovals++;

    // Check if step is complete
    if (currentStep.receivedApprovals.length >= currentStep.requiredApprovals) {
      currentStep.status = 'completed';
      workflow.currentStep++;

      // Check if workflow is complete
      if (workflow.currentStep >= workflow.steps.length) {
        workflow.status = 'completed';
        workflow.completedAt = new Date();
        document.status = 'approved';
      } else {
        workflow.steps[workflow.currentStep].status = 'in_progress';
      }
    }

    return true;
  }

  async rejectDocument(documentId: string, approverId: string, comments: string): Promise<boolean> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document || !document.approvalWorkflow) return false;

    const workflow = document.approvalWorkflow;
    const currentStep = workflow.steps[workflow.currentStep];
    
    if (!currentStep.approvers.includes(approverId)) return false;

    const rejection: ApprovalAction = {
      id: `rejection-${Date.now()}`,
      approverId,
      approverName: `User ${approverId}`,
      action: 'rejected',
      timestamp: new Date(),
      comments,
      ipAddress: '192.168.1.100'
    };

    currentStep.receivedApprovals.push(rejection);
    currentStep.status = 'rejected';
    workflow.status = 'rejected';
    document.status = 'rejected';

    return true;
  }

  async createDocumentFromTemplate(templateId: string, variables: Record<string, any>): Promise<Document | null> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return null;

    let content = template.templateContent;
    
    // Replace template variables
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || '';
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, value.toString());
    });

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: `Generated from ${template.name}`,
      type: 'contract',
      category: template.category,
      size: content.length,
      mimeType: 'text/plain',
      uploadedAt: new Date(),
      uploadedBy: 'current-user',
      lastModified: new Date(),
      lastModifiedBy: 'current-user',
      version: '1.0',
      status: 'draft',
      tags: ['generated', 'template'],
      customFields: variables,
      content,
      checksum: this.generateChecksum(),
      accessLog: [],
      versionHistory: [],
      relatedDocuments: []
    };

    // Add approval workflow if template has one
    if (template.approvalWorkflowId) {
      const workflow = this.workflows.find(w => w.id === template.approvalWorkflowId);
      if (workflow) {
        newDocument.approvalWorkflow = { ...workflow };
        newDocument.status = 'pending_review';
      }
    }

    this.documents.unshift(newDocument);
    this.saveDocumentsToStorage();
    return newDocument;
  }

  // Get dashboard metrics
  getDocumentMetrics() {
    const total = this.documents.length;
    const pending = this.documents.filter(doc => doc.status === 'pending_review').length;
    const approved = this.documents.filter(doc => doc.status === 'approved').length;
    const rejected = this.documents.filter(doc => doc.status === 'rejected').length;
    
    const recentUploads = this.documents.filter(doc => {
      const daysSinceUpload = (Date.now() - doc.uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpload <= 7;
    }).length;

    const totalSize = this.documents.reduce((sum, doc) => sum + doc.size, 0);
    
    return {
      total,
      pending,
      approved,
      rejected,
      recentUploads,
      totalSize,
      averageApprovalTime: 36, // hours
      mostActiveFolder: 'Legal Documents',
      topDocumentType: 'contract'
    };
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService; 