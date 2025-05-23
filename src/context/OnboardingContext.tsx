import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingState, KYCDocument, NDAState } from '../types/onboarding';

// Initial KYC document list
const initialKYCDocuments: KYCDocument[] = [
  {
    id: 'aml-questionnaire',
    name: 'AML Questionnaire',
    description: 'Download, fill and upload the AML questionnaire',
    isRequired: true,
    canDownload: true,
    status: 'pending'
  },
  {
    id: 'certificate-of-incorporation',
    name: 'Certificate of Incorporation',
    description: 'Upload your company\'s certificate of incorporation',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'memorandum',
    name: 'Memorandum / Articles of Association',
    description: 'Upload your company\'s memorandum or articles of association',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'central-bank-license',
    name: 'Central Bank License / Regulator Letter',
    description: 'Upload central bank license or regulator letter',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'org-chart',
    name: 'Org Chart (on letterhead)',
    description: 'Upload your organization chart on company letterhead',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'shareholding-pattern',
    name: 'Shareholding Pattern (on letterhead)',
    description: 'Upload shareholding pattern on company letterhead',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'ubo-id-copies',
    name: 'UBO ID copies (>15%)',
    description: 'Upload ID copies for Ultimate Beneficial Owners with >15% ownership',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'director-id-copies',
    name: 'Director ID copies (on letterhead)',
    description: 'Upload ID copies for all directors on company letterhead',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'authorized-signatories',
    name: 'Authorized Signatories (on letterhead)',
    description: 'Upload list of authorized signatories on company letterhead',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'external-audit-report',
    name: 'External Audit Report OR Assurance Report',
    description: 'Upload your latest external audit report or assurance report',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'aml-policy',
    name: 'AML policy w/ board approval',
    description: 'Upload your AML policy with board approval',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'patriot-act-certificate',
    name: 'USA PATRIOT Act Certificate',
    description: 'Upload USA PATRIOT Act Certificate (if applicable)',
    isRequired: false,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'audited-financials',
    name: 'Audited Financials (last 3 years)',
    description: 'Upload audited financial statements for the last 3 years',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  },
  {
    id: 'compliance-officer-id',
    name: 'Compliance Officer/MLRO ID copy',
    description: 'Upload ID copy of your Compliance Officer or MLRO',
    isRequired: true,
    canDownload: false,
    status: 'pending'
  }
];

// Initial NDA state
const initialNDAState: NDAState = {
  isDownloaded: false,
  isUploaded: false
};

// Initial onboarding state
const initialState: OnboardingState = {
  currentStep: 'chat',
  nda: initialNDAState,
  kycDocuments: initialKYCDocuments,
  isCompleted: false
};

// LocalStorage key
const STORAGE_KEY = 'partnerOnboardingState';

// Context type
interface OnboardingContextType {
  state: OnboardingState;
  downloadNDA: () => void;
  uploadNDA: (fileName: string) => void;
  downloadKYCDocument: (documentId: string) => void;
  uploadKYCDocument: (documentId: string, fileName: string) => void;
  moveToNextStep: () => void;
  resetOnboarding: () => void;
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider props
interface OnboardingProviderProps {
  children: ReactNode;
}

// Provider component
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    // Try to get state from localStorage
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : initialState;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Download NDA
  const downloadNDA = () => {
    // Placeholder for actual download logic
    console.log('Downloading NDA...');
    
    setState(prevState => ({
      ...prevState,
      nda: {
        ...prevState.nda,
        isDownloaded: true
      }
    }));
  };

  // Upload NDA
  const uploadNDA = (fileName: string) => {
    setState(prevState => ({
      ...prevState,
      nda: {
        ...prevState.nda,
        isUploaded: true,
        fileName,
        uploadDate: new Date()
      }
    }));
  };

  // Download KYC document
  const downloadKYCDocument = (documentId: string) => {
    // Placeholder for actual download logic
    console.log(`Downloading KYC document: ${documentId}`);
    
    setState(prevState => ({
      ...prevState,
      kycDocuments: prevState.kycDocuments.map(doc => 
        doc.id === documentId 
          ? { ...doc, isDownloaded: true }
          : doc
      )
    }));
  };

  // Upload KYC document
  const uploadKYCDocument = (documentId: string, fileName: string) => {
    setState(prevState => ({
      ...prevState,
      kycDocuments: prevState.kycDocuments.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'uploaded', 
              fileName,
              uploadDate: new Date()
            }
          : doc
      )
    }));
  };

  // Move to next step
  const moveToNextStep = () => {
    console.log('Current step before transition:', state.currentStep);
    console.log(`Moving to next step from current step: ${state.currentStep}`);
    
    if (state.currentStep === 'chat') {
      console.log('Transitioning from chat to NDA step');
      setState(prevState => ({
        ...prevState,
        currentStep: 'nda'
      }));
    } else if (state.currentStep === 'nda' && state.nda.isUploaded) {
      console.log('Transitioning from NDA to KYC step');
      // Clear onboarding component local storage to prevent loops
      localStorage.removeItem('tisai_chat_step');
      localStorage.removeItem('tisai_messages');
      
      setState(prevState => ({
        ...prevState,
        currentStep: 'kyc'
      }));
      
      // Add a delay then navigate to KYC section programmatically
      setTimeout(() => {
        console.log('KYC state set, navigating to KYC UI');
        // Check if we have window to handle SSR scenarios
        if (typeof window !== 'undefined') {
          // Set a redirect flag
          sessionStorage.setItem('redirect_to_kyc', 'true');
          
          // Force refresh if needed to load the KYC UI
          window.location.href = '/tisai-onboarding?step=kyc';
        }
      }, 1000);
    } else if (state.currentStep === 'kyc' && allKYCDocumentsUploaded()) {
      console.log('Transitioning from KYC to completed state');
      setState(prevState => ({
        ...prevState,
        currentStep: 'completed',
        isCompleted: true
      }));
    }
    console.log('Current step after transition:', state.currentStep);
  };

  // Reset onboarding
  const resetOnboarding = () => {
    setState(initialState);
  };

  // Helper function to check if all KYC documents are uploaded
  const allKYCDocumentsUploaded = () => {
    return state.kycDocuments.every(doc => doc.status === 'uploaded');
  };

  // Context value
  const value = {
    state,
    downloadNDA,
    uploadNDA,
    downloadKYCDocument,
    uploadKYCDocument,
    moveToNextStep,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using onboarding context
export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 