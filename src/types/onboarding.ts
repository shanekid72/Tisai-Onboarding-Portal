export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface NDAState {
  isDownloaded: boolean;
  isUploaded: boolean;
  fileName?: string;
  uploadDate?: Date;
}

export interface KYCDocument {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  canDownload: boolean;
  status: 'pending' | 'uploaded' | 'approved';
  fileName?: string;
  uploadDate?: Date;
}

export interface OnboardingState {
  currentStep: 'chat' | 'nda' | 'kyc' | 'completed';
  nda: NDAState;
  kycDocuments: KYCDocument[];
  isCompleted: boolean;
} 