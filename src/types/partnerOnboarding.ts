// Partner Onboarding Types
export type OnboardingStage = 
  | 'nda'
  | 'commercials'
  | 'kyc'
  | 'agreement'
  | 'integration'
  | 'uat'
  | 'go-live';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not-required';

export type DocumentStatus = 'pending' | 'uploaded' | 'received' | 'approved' | 'rejected';

export interface ComplianceDocument {
  id: string;
  label: string;
  description: string;
  required: boolean;
  conditional?: boolean;
  conditionDescription?: string;
  status: DocumentStatus;
  fileName?: string;
  uploadDate?: Date;
  rejectionReason?: string;
}

export interface StageApproval {
  team: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
}

export interface OnboardingStageConfig {
  id: OnboardingStage;
  title: string;
  description: string;
  prompt: string;
  requirements?: ComplianceDocument[];
  approvals: StageApproval[];
  completed: boolean;
  canSkip?: boolean;
  skipCondition?: string;
  documents?: ComplianceDocument[];
  progress?: number;
  messagesInitialized?: boolean;
  skipped?: boolean;
  skipReason?: string;
}

export interface PartnerInfo {
  name: string;
  organization: string;
  email: string;
  phone?: string;
  role?: string;
  country?: string;
  crmContactId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'partner' | 'system';
  content: string;
  timestamp: Date;
  type?: 'message' | 'document-request' | 'upload-confirmation' | 'approval-update' | 'stage-completion' | 'commercial-agreement' | 'kyc-documents' | 'agreement-preview' | 'pricing-selection';
  metadata?: {
    stageId?: OnboardingStage;
    documentId?: string;
    approvalTeam?: string;
    [key: string]: any;
  };
}

export interface OnboardingState {
  partnerId: string;
  partnerInfo: PartnerInfo;
  currentStage: OnboardingStage;
  stages: OnboardingStageConfig[];
  messages: ChatMessage[];
  overallProgress: number;
  isCompleted: boolean;
  activationDate?: Date;
  lastActivity: Date;
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    recipients: string[];
    templates: {
      documentUploaded: string;
      approvalRequired: string;
      stageCompleted: string;
      onboardingCompleted: string;
    };
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channels: {
      legal: string;
      compliance: string;
      technical: string;
      business: string;
      partnership: string;
    };
  };
}

// Pricing Selection Types
export interface PricingSelectionItem {
  region: string;
  country: string;
  countryCode: string;
  currency: string;
  service: string;
  unitPrice: number;
  unit: string;
}

// This matches the format used in the PartnerOnboardingContext
export interface PricingSelection {
  regions: any[];
  selectedCountries: string[];
  selectedServices: Record<string, string[]>;
}

// Default compliance documents for KYC stage
export const DEFAULT_KYC_DOCUMENTS: ComplianceDocument[] = [
  {
    id: 'aml-questionnaire',
    label: 'AML Questionnaire',
    description: 'Download, fill and upload the AML questionnaire',
    required: true,
    status: 'pending'
  },
  {
    id: 'certificate-incorporation',
    label: 'Certificate of Incorporation',
    description: 'Upload your company\'s certificate of incorporation',
    required: true,
    status: 'pending'
  },
  {
    id: 'memorandum-articles',
    label: 'Memorandum/Articles of Association',
    description: 'Upload your company\'s memorandum or articles of association',
    required: true,
    status: 'pending'
  },
  {
    id: 'central-bank-license',
    label: 'Central Bank License/Regulator Authorization Letter',
    description: 'Upload central bank license or regulator authorization letter',
    required: true,
    status: 'pending'
  },
  {
    id: 'organization-chart',
    label: 'Organization Chart',
    description: 'Upload your organization chart on company letterhead',
    required: true,
    status: 'pending'
  },
  {
    id: 'shareholder-list',
    label: 'Shareholder List',
    description: 'Upload complete shareholder list on company letterhead',
    required: true,
    status: 'pending'
  },
  {
    id: 'ubo-ids',
    label: 'IDs of UBOs (>15% ownership)',
    description: 'Upload ID copies for Ultimate Beneficial Owners with >15% ownership',
    required: true,
    status: 'pending'
  },
  {
    id: 'director-ids',
    label: 'IDs of Directors',
    description: 'Upload ID copies for all directors on company letterhead',
    required: true,
    status: 'pending'
  },
  {
    id: 'authorized-signatories',
    label: 'IDs of Authorized Signatories',
    description: 'Upload ID copies of authorized signatories on company letterhead',
    required: true,
    status: 'pending'
  },
  {
    id: 'external-audit',
    label: 'External Audit/Assurance Report',
    description: 'Upload your latest external audit or assurance report',
    required: true,
    status: 'pending'
  },
  {
    id: 'aml-policy',
    label: 'AML Policy & Procedures',
    description: 'Upload your AML policy and procedures with board approval',
    required: true,
    status: 'pending'
  },
  {
    id: 'patriot-act',
    label: 'USA PATRIOT Act Certificate',
    description: 'Upload USA PATRIOT Act Certificate (only if applicable to your business)',
    required: false,
    conditional: true,
    conditionDescription: 'Required only if your business operations involve US transactions or customers',
    status: 'pending'
  },
  {
    id: 'audited-financials',
    label: 'Audited Financial Statements (3 years)',
    description: 'Upload audited financial statements for the last 3 years',
    required: true,
    status: 'pending'
  },
  {
    id: 'compliance-officer-id',
    label: 'ID of Compliance Officer/MLRO',
    description: 'Upload ID copy of your Compliance Officer or Money Laundering Reporting Officer',
    required: true,
    status: 'pending'
  }
];

// Stage configuration templates
export const ONBOARDING_STAGES_CONFIG: OnboardingStageConfig[] = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    description: 'Review and sign the NDA to protect confidential information',
    prompt: 'Welcome to WorldAPI Partner Onboarding! Let\'s start by getting the NDA signed. This protects both parties\' confidential information during our partnership discussions.',
    approvals: [
      { team: 'Legal', status: 'pending' }
    ],
    completed: false
  },
  {
    id: 'commercials',
    title: 'Commercial Terms',
    description: 'Discuss and agree on commercial terms and pricing',
    prompt: 'Great job with the NDA! Now let\'s discuss the commercial terms. Our team will present the pricing structure and partnership terms for your review.',
    approvals: [
      { team: 'Business', status: 'pending' },
      { team: 'Pricing', status: 'pending' }
    ],
    completed: false
  },
  {
    id: 'kyc',
    title: 'Know Your Customer (KYC)',
    description: 'Complete compliance documentation and verification',
    prompt: 'Excellent progress! Now we need to complete the KYC process. Please upload the required compliance documents. You can upload them here or email them to partnerships@digitnine.com.',
    requirements: DEFAULT_KYC_DOCUMENTS,
    approvals: [
      { team: 'Compliance', status: 'pending' }
    ],
    completed: false
  },
  {
    id: 'agreement',
    title: 'Partnership Agreement',
    description: 'Review and sign the final partnership agreement',
    prompt: 'Fantastic! Your compliance documentation is approved. Now let\'s finalize the partnership agreement based on our agreed commercial terms.',
    approvals: [
      { team: 'Legal', status: 'pending' },
      { team: 'Partner', status: 'pending' }
    ],
    completed: false
  },
  {
    id: 'integration',
    title: 'Technical Integration',
    description: 'Set up API access and technical integration',
    prompt: 'Perfect! With the agreement signed, let\'s get you set up technically. Our technical team will provide API credentials and integration support.',
    approvals: [
      { team: 'Technical', status: 'pending' }
    ],
    completed: false,
    canSkip: true,
    skipCondition: 'Can be completed after go-live if needed'
  },
  {
    id: 'uat',
    title: 'User Acceptance Testing',
    description: 'Test the integration in our sandbox environment',
    prompt: 'Great! Your technical setup is ready. Now let\'s test everything in our sandbox environment to ensure everything works perfectly.',
    approvals: [
      { team: 'Technical', status: 'pending' },
      { team: 'Partner', status: 'pending' }
    ],
    completed: false,
    canSkip: true,
    skipCondition: 'Can be skipped if integration is deferred'
  },
  {
    id: 'go-live',
    title: 'Go Live & Activation',
    description: 'Final activation and go-live process',
    prompt: 'Congratulations! Everything is tested and ready. Let\'s activate your partnership and go live with WorldAPI!',
    approvals: [
      { team: 'Business', status: 'pending' }
    ],
    completed: false
  }
]; 