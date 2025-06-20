// Document Management Types
export interface DocumentMetadata {
  id: string;
  name: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number; // in bytes
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  lastModified: Date;
  lastModifiedBy: string;
  version: string;
  status: DocumentStatus;
  tags: string[];
  customFields: Record<string, any>;
}

export interface Document extends DocumentMetadata {
  content?: string; // For text documents
  url?: string; // For file downloads
  thumbnailUrl?: string;
  previewUrl?: string;
  checksum: string;
  encryption?: EncryptionInfo;
  accessLog: AccessLogEntry[];
  approvalWorkflow?: ApprovalWorkflow;
  versionHistory: DocumentVersion[];
  relatedDocuments: string[]; // Document IDs
  expirationDate?: Date;
  retentionPolicy?: RetentionPolicy;
}

export interface DocumentVersion {
  version: string;
  uploadedAt: Date;
  uploadedBy: string;
  changes: string;
  size: number;
  checksum: string;
  url?: string;
  status: DocumentStatus;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  steps: ApprovalStep[];
  currentStep: number;
  status: WorkflowStatus;
  createdAt: Date;
  completedAt?: Date;
  requiredApprovals: number;
  receivedApprovals: number;
  autoApprove?: boolean;
  escalationRules: EscalationRule[];
}

export interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  approvers: string[]; // User IDs
  requiredApprovals: number; // How many approvers needed
  receivedApprovals: ApprovalAction[];
  status: StepStatus;
  dueDate?: Date;
  autoApprove?: boolean;
  conditions?: ApprovalCondition[];
}

export interface ApprovalAction {
  id: string;
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  timestamp: Date;
  comments?: string;
  signature?: string;
  ipAddress?: string;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface EscalationRule {
  id: string;
  triggerAfterHours: number;
  escalateTo: string[]; // User IDs
  notificationTemplate: string;
  autoApprove?: boolean;
}

export interface AccessLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: AccessAction;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  encrypted: boolean;
  encryptedAt?: Date;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  retentionPeriodDays: number;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
  legalHold: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  templateContent: string;
  variables: TemplateVariable[];
  approvalWorkflowId?: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  validation?: ValidationRule;
}

export interface ValidationRule {
  pattern?: string; // Regex pattern
  minLength?: number;
  maxLength?: number;
  min?: number; // For numbers
  max?: number; // For numbers
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  permissions: FolderPermission[];
  createdAt: Date;
  createdBy: string;
  documentCount: number;
  subfolderCount: number;
}

export interface FolderPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: Permission[];
}

export interface DocumentShare {
  id: string;
  documentId: string;
  sharedBy: string;
  sharedWith: string[];
  shareType: 'internal' | 'external' | 'public';
  permissions: Permission[];
  expirationDate?: Date;
  accessCount: number;
  lastAccessed?: Date;
  shareUrl?: string;
  password?: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  parentId?: string; // For replies
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  attachments?: string[];
}

export interface DocumentAnalytics {
  documentId: string;
  views: number;
  downloads: number;
  shares: number;
  comments: number;
  approvals: number;
  rejections: number;
  averageApprovalTime: number; // in hours
  lastActivity: Date;
  topViewers: { userId: string; userName: string; count: number; }[];
  activityTimeline: ActivityTimelineEntry[];
}

export interface ActivityTimelineEntry {
  timestamp: Date;
  action: string;
  userId: string;
  userName: string;
  details?: Record<string, any>;
}

// Enums
export type DocumentType = 
  | 'contract'
  | 'nda'
  | 'proposal'
  | 'invoice'
  | 'report'
  | 'presentation'
  | 'spreadsheet'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'other';

export type DocumentCategory = 
  | 'legal'
  | 'financial'
  | 'technical'
  | 'marketing'
  | 'hr'
  | 'compliance'
  | 'partnership'
  | 'internal'
  | 'external';

export type DocumentStatus = 
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived'
  | 'expired'
  | 'deleted';

export type WorkflowStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'escalated';

export type StepStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'rejected';

export type AccessAction = 
  | 'view'
  | 'download'
  | 'edit'
  | 'delete'
  | 'share'
  | 'comment'
  | 'approve'
  | 'reject'
  | 'upload_version';

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'share'
  | 'approve'
  | 'admin';

// Search and Filter Types
export interface DocumentSearchQuery {
  query?: string;
  type?: DocumentType[];
  category?: DocumentCategory[];
  status?: DocumentStatus[];
  uploadedBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  size?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'name' | 'uploadedAt' | 'lastModified' | 'size' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DocumentSearchResult {
  documents: Document[];
  total: number;
  facets: {
    types: { type: DocumentType; count: number; }[];
    categories: { category: DocumentCategory; count: number; }[];
    statuses: { status: DocumentStatus; count: number; }[];
    tags: { tag: string; count: number; }[];
  };
  suggestions?: string[];
}

// Bulk Operations
export interface BulkOperation {
  id: string;
  type: 'move' | 'delete' | 'approve' | 'reject' | 'tag' | 'share';
  documentIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: Date;
  createdBy: string;
  completedAt?: Date;
  errors?: string[];
}

// Integration Types
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'sharepoint' | 'google_drive' | 'dropbox' | 'box' | 's3' | 'onedrive';
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncErrors?: string[];
}

export interface SyncOperation {
  id: string;
  integrationId: string;
  type: 'import' | 'export' | 'sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  startedAt: Date;
  completedAt?: Date;
  errors?: string[];
} 