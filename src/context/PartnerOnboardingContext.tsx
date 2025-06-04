import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ChatMessage, 
  ComplianceDocument, 
  DocumentStatus, 
  OnboardingStage, 
  OnboardingStageConfig, 
  OnboardingState, 
  PartnerInfo, 
  StageApproval, 
  ONBOARDING_STAGES_CONFIG, 
  NotificationConfig 
} from '../types/partnerOnboarding';

// Storage key
const STORAGE_KEY = 'partner_onboarding_state';

// Default notification config
const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  email: {
    enabled: true,
    recipients: ['partnerships@digitnine.com', 'compliance@digitnine.com'],
    templates: {
      documentUploaded: 'Document uploaded notification',
      approvalRequired: 'Approval required notification',
      stageCompleted: 'Stage completed notification',
      onboardingCompleted: 'Onboarding completed notification'
    }
  },
  slack: {
    enabled: true,
    webhookUrl: import.meta.env.VITE_SLACK_WEBHOOK_URL || '',
    channels: {
      legal: '#legal-approvals',
      compliance: '#compliance-reviews',
      technical: '#technical-integrations',
      business: '#business-partnerships',
      partnership: '#partnership-management'
    }
  }
};

interface PartnerOnboardingContextType {
  state: OnboardingState | null;
  initializeOnboarding: (partnerInfo: PartnerInfo) => void;
  sendMessage: (content: string) => void;
  uploadDocument: (documentId: string, file: File) => Promise<void>;
  skipOptionalDocument: (documentId: string) => Promise<void>;
  markDocumentReceived: (documentId: string, fileName: string) => void;
  updateApprovalStatus: (stageId: OnboardingStage, team: string, status: 'approved' | 'rejected', reason?: string) => void;
  moveToNextStage: () => void;
  skipStage: (stageId: OnboardingStage, reason: string) => void;
  resetOnboarding: (options?: { clearCache?: boolean; resetState?: boolean; reason?: string }) => void;
  getCurrentStageConfig: () => OnboardingStageConfig | null;
  getPendingApprovals: () => StageApproval[];
  isStageCompleted: (stageId: OnboardingStage) => boolean;
  showPricingSelector: () => void;
  hidePricingSelector: () => void;
  savePricingSelection: (selection: PricingSelection) => void;
  isPricingSelectorVisible: boolean;
  pricingSelection: PricingSelection | null;
}

// Define pricing selection type
export interface PricingSelection {
  regions: any[];
  selectedCountries: string[];
  selectedServices: Record<string, string[]>; // countryCode -> serviceNames
}

// Create context
const PartnerOnboardingContext = createContext<PartnerOnboardingContextType | undefined>(undefined);

// Provider props
interface PartnerOnboardingProviderProps {
  children: ReactNode;
}

// Helper function to generate unique message IDs
const generateMessageId = (prefix: string = 'msg') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Provider component
export const PartnerOnboardingProvider: React.FC<PartnerOnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isPricingSelectorVisible, setIsPricingSelectorVisible] = useState(false);
  const [pricingSelection, setPricingSelection] = useState<PricingSelection | null>(null);

  // Load state from localStorage on component mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState) as OnboardingState;
        
        // Check for cache expiration - default to 7 days
        const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const lastActivityDate = parsedState.lastActivity ? new Date(parsedState.lastActivity) : null;
        const now = new Date();
        
        if (lastActivityDate && (now.getTime() - lastActivityDate.getTime() > MAX_CACHE_AGE_MS)) {
          console.log('⏰ Cached onboarding session expired (inactive for >7 days). Creating fresh session.');
          localStorage.removeItem(STORAGE_KEY); // Direct removal instead of calling resetOnboarding to avoid circular dep
          return;
        }
        
        // Validate the parsed state to ensure it has the expected structure
        if (
          parsedState && 
          parsedState.partnerId && 
          parsedState.partnerInfo && 
          parsedState.stages && 
          Array.isArray(parsedState.stages) && 
          parsedState.messages && 
          Array.isArray(parsedState.messages)
        ) {
          console.log('📂 Restored onboarding state from local storage for partner:', parsedState.partnerInfo.name);
          
          // Convert string dates back to Date objects
          const processedState = {
            ...parsedState,
            lastActivity: parsedState.lastActivity ? new Date(parsedState.lastActivity) : new Date(),
            messages: parsedState.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            })),
            stages: parsedState.stages.map(stage => ({
              ...stage,
              documents: stage.documents?.map(doc => ({
                ...doc,
                uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : undefined
              })) || []
            }))
          };
          
          setState(processedState);
        } else {
          console.warn('Invalid saved onboarding state structure, initializing fresh state');
          localStorage.removeItem(STORAGE_KEY); // Direct removal
        }
      } else {
        console.log('No saved onboarding state found, will initialize fresh state when needed');
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
      localStorage.removeItem(STORAGE_KEY); // Direct removal
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('💾 Saved onboarding state to local storage');
      } catch (error) {
        console.error('Error saving onboarding state:', error);
      }
    }
  }, [state]);

  // Initialize onboarding for a new partner or resume existing onboarding
  const initializeOnboarding = (partnerInfo: PartnerInfo): void => {
    // If there's already an active onboarding session, don't reinitialize
    if (state) {
      console.log('🔒 Resuming existing onboarding session for:', state.partnerInfo.name);
      
      // Optionally add a resumption message
      const resumptionMessage: ChatMessage = {
        id: generateMessageId('resume'),
        sender: 'agent',
        content: `Welcome back, ${state.partnerInfo.name}! We're continuing your onboarding process from where you left off.\n\nYou're currently at the **${state.stages.find(s => s.id === state.currentStage)?.title || 'Current'}** stage.`,
        timestamp: new Date(),
        type: 'message'
      };
      
      setState(prev => prev ? {
        ...prev,
        messages: [...prev.messages, resumptionMessage],
        lastActivity: new Date()
      } : null);
      
      return;
    }
    
    // Create a new onboarding session if none exists
    console.log('🌱 Initializing new onboarding process for:', partnerInfo.name);
    const partnerId = `partner_${Date.now()}`;

    const initialMessage: ChatMessage = {
      id: generateMessageId('init'),
      sender: 'agent',
      content: `Hello ${partnerInfo.name}! Welcome to WorldAPI Partner Onboarding. I'm your dedicated onboarding agent, and I'll guide you through each step of becoming a WorldAPI partner. 

🎯 **Your information has been recorded in our system:**
• Name: ${partnerInfo.name}
• Company: ${partnerInfo.organization}
• Email: ${partnerInfo.email}

Let's start with the NDA to protect our confidential discussions.`,
      timestamp: new Date(),
      type: 'message'
    };

    const newState: OnboardingState = {
      partnerId,
      partnerInfo,
      currentStage: 'nda',
      stages: ONBOARDING_STAGES_CONFIG.map(stage => ({ ...stage })),
      messages: [initialMessage],
      overallProgress: 0,
      isCompleted: false,
      lastActivity: new Date()
    };

    setState(newState);

    // Send NDA download info immediately after initial message
    setTimeout(() => {
      const ndaDownloadContent = "📄 **NDA Document Download**\n\n" +
        "Please download, review, and sign our Non-Disclosure Agreement:\n\n" +
        "🔗 **[Download NDA Document](/WorldAPI_NDA.docx)**\n\n" +
        "**Next Steps:**\n" +
        "1. Download the NDA document\n" +
        "2. Review the terms carefully\n" +
        "3. Sign the document\n" +
        "4. Upload the signed copy back here or email to partnerships@digitnine.com\n\n" +
        "💡 **Need Help?**\n" +
        "If you have any questions about the NDA terms, please ask and I'll be happy to clarify!";

      const ndaMessage: ChatMessage = {
        id: generateMessageId('nda'),
        sender: 'agent',
        content: ndaDownloadContent,
        timestamp: new Date(),
        type: 'document-request',
        metadata: { stageId: 'nda' }
      };

      setState((prev: OnboardingState | null) => prev ? {
        ...prev,
        messages: [...prev.messages, ndaMessage],
        lastActivity: new Date()
      } : null);
    }, 1500);
  };

  // Send a message in the chat
  const sendMessage = (content: string, sender: 'partner' | 'agent' | 'system' = 'partner', type: 'message' | 'document-request' | 'commercial-agreement' | 'kyc-documents' | 'agreement-preview' | 'stage-completion' | 'pricing-selection' | 'upload-confirmation' | 'approval-update' = 'message'): void => {
    if (!state) return;

    const newMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      sender,
      timestamp: new Date(),
      type
    };

    setState((prev: OnboardingState | null) => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastActivity: new Date()
    } : null);

    // Simple response for now
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        content: "Thank you for your message. I'm here to help guide you through the onboarding process.",
        timestamp: new Date(),
        type: 'message'
      };

      setState((prev: OnboardingState | null) => prev ? {
        ...prev,
        messages: [...prev.messages, responseMessage],
        lastActivity: new Date()
      } : null);
    }, 1000);
  };

  // Document upload management functions
  const uploadDocument = async (documentId: string, file: File): Promise<void> => {
    console.log('🚀 Uploading document:', documentId, file.name);

    if (!state) return;

    // Find current stage
    const currentStageConfig = state.stages.find((s: OnboardingStageConfig) => s.id === state.currentStage);
    if (!currentStageConfig) return;

    // Find the document to update
    if (currentStageConfig.documents) {
      const docIndex = currentStageConfig.documents.findIndex(doc => doc.id === documentId);

      if (docIndex !== -1) {
        // Update state with document info
        setState((prev: OnboardingState | null) => {
          if (!prev) return null;

          // Clone stages array
          const updatedStages = [...prev.stages];

          // Find current stage
          const stageIndex = updatedStages.findIndex((s: OnboardingStageConfig) => s.id === prev.currentStage);
          if (stageIndex === -1) return prev;

          // Clone stage config
          const stageConfig = { ...updatedStages[stageIndex] };

          // Clone documents array
          if (stageConfig.documents) {
            const documents = [...stageConfig.documents];
            // Create updated document with proper typing
            const updatedDoc: ComplianceDocument = {
              ...documents[docIndex],
              status: 'uploaded' as DocumentStatus,
              fileName: file.name,
              uploadDate: new Date()
            };
            documents[docIndex] = updatedDoc;

            // Update stage config with new documents array
            stageConfig.documents = documents;

            // Calculate progress for this stage
            const totalDocs = documents.length;
            const completedDocs = documents.filter((d: ComplianceDocument) => 
              d.status === 'uploaded' || d.status === 'approved' || d.status === 'received'
            ).length;
            stageConfig.progress = Math.round((completedDocs / totalDocs) * 100);

            // Check if all required documents are uploaded
            const allRequiredDocsUploaded = documents
              .filter((doc: ComplianceDocument) => doc.required)
              .every((doc: ComplianceDocument) => 
                doc.status === 'uploaded' || doc.status === 'approved' || doc.status === 'received'
              );

            if (allRequiredDocsUploaded) {
              stageConfig.completed = true;
            }

            // Update stages array
            updatedStages[stageIndex] = stageConfig;

            // Calculate overall progress
            const completedStages = updatedStages.filter((stage: OnboardingStageConfig) => stage.completed).length;
            const overallProgress = Math.round((completedStages / updatedStages.length) * 100);

            // Only update lastActivity, don't send a message to the chat
            // Return properly typed state update
            const updatedState: OnboardingState = {
              ...prev,
              stages: updatedStages as OnboardingStageConfig[],
              overallProgress,
              lastActivity: new Date()
            };
            return updatedState;
          }

          return prev;
        });

        console.log(`✅ Document "${file.name}" uploaded successfully.`);
        return;
      }
    }

    // Don't send confirmation message in chat since we already show status in the document card
    // Just update the lastActivity timestamp to mark the change
    setState((prev: OnboardingState | null) => {
      if (!prev) return null;
      return {
        ...prev,
        lastActivity: new Date()
      } as OnboardingState;
    });
  };

  const skipOptionalDocument = async (documentId: string): Promise<void> => {
    console.log('⏭️ Skip document:', documentId);

    if (!state) return;

    setState((prev: OnboardingState | null) => {
      if (!prev) return null;

      // Find the current stage
      const currentStage = prev.stages.find((s: OnboardingStageConfig) => s.id === prev.currentStage);
      if (!currentStage || !currentStage.documents) return prev;

      // Make sure this is an optional document
      const document = currentStage.documents.find((d: ComplianceDocument) => d.id === documentId);
      if (!document || document.required) {
        console.warn('Cannot skip required document:', documentId);
        return prev;
      }

      // Create a copy of the stages array to work with
      const updatedStages = [...prev.stages];

      // Find the index of the current stage
      const stageIndex = updatedStages.findIndex((s: OnboardingStageConfig) => s.id === prev.currentStage);
      if (stageIndex === -1) return prev;

      // Create a copy of the current stage
      const updatedStage = { ...updatedStages[stageIndex] };

      // Create a copy of the documents array
      if (!updatedStage.documents) return prev;
      const updatedDocuments = [...updatedStage.documents];

      // Find the document index
      const docIndex = updatedDocuments.findIndex((d: ComplianceDocument) => d.id === documentId);
      if (docIndex === -1) return prev;

      // Update the document with 'approved' status
      updatedDocuments[docIndex] = {
        ...updatedDocuments[docIndex],
        status: 'approved' as DocumentStatus,
        fileName: 'Skipped (Optional)',
        uploadDate: new Date()
      };

      // Update the documents array in the stage
      updatedStage.documents = updatedDocuments;

      // Calculate progress for this stage
      const totalDocs = updatedDocuments.length;
      const completedDocs = updatedDocuments.filter((d: ComplianceDocument) => 
        d.status === 'uploaded' || d.status === 'approved' || d.status === 'received'
      ).length;
      updatedStage.progress = Math.round((completedDocs / totalDocs) * 100);

      // Check if all required documents are uploaded
      const allRequiredDocsUploaded = updatedDocuments
        .filter((doc: ComplianceDocument) => doc.required)
        .every((doc: ComplianceDocument) => 
          doc.status === 'uploaded' || doc.status === 'approved' || doc.status === 'received'
        );

      if (allRequiredDocsUploaded) {
        updatedStage.completed = true;
      }

      // Update the stage in the stages array
      updatedStages[stageIndex] = updatedStage;

      // Calculate overall progress
      const completedStages = updatedStages.filter((stage: OnboardingStageConfig) => stage.completed).length;
      const overallProgress = Math.round((completedStages / updatedStages.length) * 100);

      // Return the updated state
      return {
        ...prev,
        stages: updatedStages,
        overallProgress,
        lastActivity: new Date()
      };
    });
  };

  const markDocumentReceived = (documentId: string, fileName: string): void => {
    console.log('📝 Mark document as received:', documentId, fileName);

    if (!state) return;

    setState((prev: OnboardingState | null) => {
      if (!prev) return null;

      // Find the current stage
      const currentStage = prev.stages.find((s: OnboardingStageConfig) => s.id === prev.currentStage);
      if (!currentStage || !currentStage.documents) return prev;

      // Find the document in the current stage
      const documentIndex = currentStage.documents.findIndex((d: ComplianceDocument) => d.id === documentId);
      if (documentIndex === -1) return prev;

      // Create a copy of the stages array to work with
      const updatedStages = [...prev.stages];

      // Find the index of the current stage
      const stageIndex = updatedStages.findIndex((s: OnboardingStageConfig) => s.id === prev.currentStage);
      if (stageIndex === -1) return prev;

      // Create a copy of the current stage
      const updatedStage = { ...updatedStages[stageIndex] };

      // Create a copy of the documents array
      if (!updatedStage.documents) return prev;
      const updatedDocuments = [...updatedStage.documents];

      // Update the document with 'received' status
      updatedDocuments[documentIndex] = {
        ...updatedDocuments[documentIndex],
        status: 'received' as DocumentStatus,
        fileName: fileName,
        uploadDate: new Date()
      };

      // Update the documents array in the stage
      updatedStage.documents = updatedDocuments;

      // Calculate progress for this stage
      const totalDocs = updatedDocuments.length;
      const completedDocs = updatedDocuments.filter((d: ComplianceDocument) => 
        d.status === 'uploaded' || d.status === 'approved' || d.status === 'received'
      ).length;
      updatedStage.progress = Math.round((completedDocs / totalDocs) * 100);

      // Check if all required documents are uploaded
      const allRequiredDocsUploaded = updatedDocuments
        .filter((doc: ComplianceDocument) => doc.required)
        .every((doc: ComplianceDocument) => 
          doc.status === 'uploaded' || doc.status === 'approved' || doc.status === 'received'
        );

      if (allRequiredDocsUploaded) {
        updatedStage.completed = true;
      }

      // Update the stage in the stages array
      updatedStages[stageIndex] = updatedStage;

      // Calculate overall progress
      const completedStages = updatedStages.filter((stage: OnboardingStageConfig) => stage.completed).length;
      const overallProgress = Math.round((completedStages / updatedStages.length) * 100);

      // Return the updated state
      return {
        ...prev,
        stages: updatedStages,
        overallProgress,
        lastActivity: new Date()
      };
    });
  };

  const updateApprovalStatus = (stageId: OnboardingStage, team: string, status: 'approved' | 'rejected', reason?: string): void => {
    if (!state) return;

    console.log('🔄 Updating approval status:', stageId, team, status, reason);

    setState((prev: OnboardingState | null) => {
      if (!prev) return null;

      const updatedStages = prev.stages.map((stage: OnboardingStageConfig) => {
        if (stage.id === stageId) {
          const updatedApprovals = stage.approvals.map((approval: StageApproval) => {
            if (approval.team === team) {
              return {
                ...approval,
                status,
                approvedBy: status === 'approved' ? 'System' : undefined,
                approvedDate: status === 'approved' ? new Date() : undefined,
                rejectionReason: status === 'rejected' ? reason : undefined
              };
            }
            return approval;
          });

          // Check if all approvals for this stage are completed
          const allApproved = updatedApprovals.every((approval: StageApproval) => approval.status === 'approved');

          return {
            ...stage,
            approvals: updatedApprovals,
            completed: allApproved
          };
        }
        return stage;
      });

      return {
        ...prev,
        stages: updatedStages,
        lastActivity: new Date()
      };
    });
  };

  const moveToNextStage = (): void => {
    if (!state) return;

    console.log('🚀 Moving to next stage from:', state.currentStage);

    const currentStageIndex = state.stages.findIndex((s: OnboardingStageConfig) => s.id === state.currentStage);
    if (currentStageIndex === -1 || currentStageIndex >= state.stages.length - 1) {
      console.log('❌ Cannot move to next stage - at end or invalid stage');
      return;
    }

    const currentStage = state.stages[currentStageIndex];
    const nextStage = state.stages[currentStageIndex + 1];

    console.log('📊 Current stage:', currentStage.title);
    console.log('📊 Next stage:', nextStage.title);

    // Mark current stage as completed
    setState((prev: OnboardingState | null) => {
      if (!prev) return null;

      const updatedStages = prev.stages.map((stage: OnboardingStageConfig, index: number) => {
        if (index === currentStageIndex) {
          return { ...stage, completed: true };
        }
        return stage;
      });

      // Calculate new progress
      const completedStages = updatedStages.filter((s: OnboardingStageConfig) => s.completed).length;
      const newProgress = Math.round((completedStages / updatedStages.length) * 100);

      return {
        ...prev,
        currentStage: nextStage.id,
        stages: updatedStages,
        overallProgress: newProgress,
        lastActivity: new Date()
      };
    });

    // Send stage completion message
    setTimeout(() => {
      const completionMessage: ChatMessage = {
        id: generateMessageId('completion'),
        sender: 'agent',
        content: `🎉 **${currentStage.title} Completed!**\n\nGreat job! You've successfully completed the ${currentStage.title} stage.\n\n**Next Step: ${nextStage.title}**\n${nextStage.description}`,
        timestamp: new Date(),
        type: 'stage-completion',
        metadata: { 
          completedStage: currentStage.id,
          nextStage: nextStage.id 
        }
      };

      setState((prev: OnboardingState | null) => {
        if (!prev) return null;

        // Add the completion message
        return {
          ...prev,
          messages: [...prev.messages, completionMessage],
          lastActivity: new Date()
        };
      });

      // IMPORTANT: Handle stage-specific messages in a separate setState call to avoid duplicate messages
      // This is critical because we want to make sure the completion message is already in the state
      // when we do the duplicate check in sendStageSpecificMessage
      setTimeout(() => {
        // Check if the next stage already has a stage-specific message
        if (nextStage && !state.stages.some(s => s.id === nextStage.id && s.messagesInitialized)) {
          // Call sendStageSpecificMessage directly without another setTimeout
          sendStageSpecificMessage(nextStage.id);
        } else {
          console.log('🔄 Stage messages already initialized for:', nextStage.title);
        }
      }, 800);
    }, 500);
  };

  // Helper function to send stage-specific messages
  const sendStageSpecificMessage = (stageId: OnboardingStage): void => {
    if (!state) return;

    console.log('📢 Checking if stage message needed for:', stageId);

    // Check if the stage is already marked as having its messages initialized
    const stageConfig = state.stages.find(s => s.id === stageId);
    if (stageConfig?.messagesInitialized) {
      console.log('💬 Stage messages already initialized for:', stageId);
      return;
    }

    // Perform thorough duplicate check to be extra safe
    const hasStageSpecificMessage = state.messages.some(msg => {
      // Check for metadata explicitly containing this stage ID
      const hasStageMetadata = msg.metadata && 'stageId' in msg.metadata && msg.metadata.stageId === stageId;

      // Check for specific stage-related message types
      const isStageTypeMessage = 
        (msg.type === 'commercial-agreement' && stageId === 'commercials') ||
        (msg.type === 'kyc-documents' && stageId === 'kyc') ||
        (msg.type === 'agreement-preview' && stageId === 'agreement') ||
        (msg.type === 'pricing-selection' && stageId === 'commercials'); // Also check for pricing selection messages

      // Check content for stage-specific keywords to further prevent duplicates
      const hasStageContent = 
        (stageId === 'commercials' && (msg.content?.includes('Commercial Terms') || msg.content?.includes('Pricing Proposal'))) ||
        (stageId === 'kyc' && msg.content?.includes('Know Your Customer')) ||
        (stageId === 'agreement' && msg.content?.includes('Partnership Agreement'));

      return hasStageMetadata || isStageTypeMessage || hasStageContent;
    });

    if (hasStageSpecificMessage) {
      console.log('🚫 Stage-specific message already sent for:', stageId);
      // Mark the stage as initialized even though we're not sending a new message
      setState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stages: prev.stages.map(s => s.id === stageId ? { ...s, messagesInitialized: true } : s)
        };
      });
      return;
    }

    let stageMessage: ChatMessage | null = null;

    switch (stageId) {
      case 'commercials':
        stageMessage = {
          id: generateMessageId('commercials'),
          sender: 'agent',
          content: `💰 **Commercial Terms Discussion**\n\nNow that we have the NDA in place, let's discuss the commercial terms for our partnership.\n\n**First Step: Pricing Selection**\n\nBefore we proceed, please select the countries and services you're interested in from our pricing proposal. This will help us tailor the commercial terms to your specific needs.\n\nClick the "Select Pricing Options" button below to begin.\n\n**What we'll cover after your selection:**\n• Revenue sharing model\n• Pricing structure\n• Payment terms\n• Volume commitments\n\nOur business team will reach out to you within 24 hours to schedule a commercial discussion. In the meantime, please let me know if you have any initial questions about our partnership model.`,
          timestamp: new Date(),
          type: 'commercial-agreement',
          metadata: { stageId: 'commercials' }
        };
        break;

      case 'kyc':
        stageMessage = {
          id: generateMessageId('kyc'),
          sender: 'agent',
          content: `🔍 **Know Your Customer (KYC) Documentation**\n\nExcellent! With commercial terms agreed, we now need to complete the KYC process for compliance.\n\n**Required Documents:**\n• Certificate of Incorporation\n• Business License\n• Tax Registration Certificate\n• Bank Account Verification\n• Director/Shareholder Information\n\n**Optional Documents:**\n• Financial Statements\n• References\n• Insurance Certificates\n\nYou can upload documents below or email them to partnerships@digitnine.com`,
          timestamp: new Date(),
          type: 'kyc-documents',
          metadata: { stageId: 'kyc' }
        };
        break;

      case 'agreement':
        stageMessage = {
          id: generateMessageId('agreement'),
          sender: 'agent',
          content: `✍️ **Partnership Agreement Review**\n\nFantastic! Your KYC documentation has been approved by our compliance team.\n\n**Next Steps:**\n• Review the Partnership Agreement draft\n• Legal review and approval\n• Digital signature process\n\nOur legal team is preparing the Partnership Agreement based on your KYC information and agreed commercial terms. You'll receive the draft agreement for review within 2-3 business days.\n\nWould you like to preview the agreement structure while compliance review is in progress?`,
          timestamp: new Date(),
          type: 'agreement-preview',
          metadata: { stageId: 'agreement' }
        };
        break;

      case 'integration':
        stageMessage = {
          id: generateMessageId('integration'),
          sender: 'agent',
          content: `🔧 **Technical Integration Setup**\n\nCongratulations! The Partnership Agreement is fully executed.\n\n**Technical Setup Includes:**\n• API credentials and access\n• Sandbox environment setup\n• Integration documentation\n• Technical support contact\n\nOur technical team will provide:\n• API keys and endpoints\n• Integration guides\n• Code samples\n• Testing environment access\n\nWould you like to start the technical integration now or schedule it for later?`,
          timestamp: new Date(),
          type: 'message',
          metadata: { stageId: 'integration' }
        };
        break;

      case 'uat':
        stageMessage = {
          id: generateMessageId('uat'),
          sender: 'agent',
          content: `🧪 **User Acceptance Testing**\n\nGreat! Your technical integration is set up.\n\n**Testing Phase:**\n• Sandbox environment testing\n• Transaction flow validation\n• Error handling verification\n• Performance testing\n\nOur technical team will guide you through comprehensive testing to ensure everything works perfectly before going live.`,
          timestamp: new Date(),
          type: 'message',
          metadata: { stageId: 'uat' }
        };
        break;

      case 'go-live':
        stageMessage = {
          id: generateMessageId('golive'),
          sender: 'agent',
          content: `🚀 **Ready for Go-Live!**\n\nExcellent! All testing is complete and successful.\n\n**Final Steps:**\n• Production environment activation\n• Live transaction monitoring\n• Support team introduction\n• Partnership launch celebration!\n\nYou're now ready to go live with WorldAPI! Our support team will monitor your first transactions to ensure everything runs smoothly.`,
          timestamp: new Date(),
          type: 'message',
          metadata: { stageId: 'go-live' }
        };
        break;
    }

    if (stageMessage) {
      // Update state with the new message and mark the stage as having its messages initialized
      setState((prev: OnboardingState | null) => {
        if (!prev) return null;

        // Mark the stage as initialized
        const updatedStages = prev.stages.map(s => {
          if (s.id === stageId) {
            return { ...s, messagesInitialized: true };
          }
          return s;
        });

        return {
          ...prev,
          stages: updatedStages,
          messages: [...prev.messages, stageMessage as ChatMessage],
          lastActivity: new Date()
        };
      });

      console.log('✅ Sent stage-specific message for:', stageId);
    }
  };

  const skipStage = (stageId: OnboardingStage, reason: string): void => {
    console.log('⏭️ Skip stage:', stageId, reason);

    if (!state) return;

    setState((prev: OnboardingState | null) => {
      if (!prev) return null;

      // Find the stage to skip
      const stageIndex = prev.stages.findIndex((s: OnboardingStageConfig) => s.id === stageId);
      if (stageIndex === -1) return prev;

      // Create a copy of the stages array
      const updatedStages = [...prev.stages];

      // Mark the stage as skipped
      updatedStages[stageIndex] = {
        ...updatedStages[stageIndex],
        completed: true,
        // Using type assertion since these properties might not be in the original type
        skipped: true,
        skipReason: reason
      } as OnboardingStageConfig;

      // Determine next stage (if applicable)
      let newCurrentStage = prev.currentStage;
      if (prev.currentStage === stageId && stageIndex < updatedStages.length - 1) {
        newCurrentStage = updatedStages[stageIndex + 1].id;
      }

      // Calculate overall progress
      const completedStages = updatedStages.filter((s: OnboardingStageConfig) => s.completed).length;
      const overallProgress = Math.round((completedStages / updatedStages.length) * 100);

      // Add a system message about skipping
      const skipMessage: ChatMessage = {
        id: generateMessageId('skip'),
        sender: 'system',
        content: `⏭️ **Stage Skipped**: ${updatedStages[stageIndex].title} was skipped.\n\n**Reason**: ${reason}`,
        timestamp: new Date(),
        type: 'message', // Using supported message type
        metadata: { stageId, reason, skipEvent: true }
      };

      return {
        ...prev,
        stages: updatedStages,
        currentStage: newCurrentStage,
        overallProgress,
        messages: [...prev.messages, skipMessage],
        lastActivity: new Date()
      };
    });
  };

  /**
   * Reset the onboarding process with different options
   * @param options Configuration options for reset
   * - clearCache: Whether to clear the localStorage cache (default: true)
   * - resetState: Whether to reset the current state (default: true)
   * - reason: Optional reason for logging
   */
  const resetOnboarding = (options?: { clearCache?: boolean; resetState?: boolean; reason?: string }): void => {
    const { clearCache = true, resetState = true, reason = 'manual reset' } = options || {};

    console.log(`🔄 Resetting onboarding process. Reason: ${reason}`);

    if (clearCache) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Cleared onboarding cache from localStorage');
    }

    if (resetState) {
      setState(null);
      console.log('🔄 Reset current onboarding state');
    }
  };

  const getCurrentStageConfig = (): OnboardingStageConfig | null => {
    if (!state) return null;
    return state.stages.find((s: OnboardingStageConfig) => s.id === state.currentStage) || null;
  };

  const getPendingApprovals = (): StageApproval[] => {
    if (!state) return [];
    const pendingApprovals: StageApproval[] = [];
    state.stages.forEach((stage: OnboardingStageConfig) => {
      stage.approvals.forEach((approval: StageApproval) => {
        if (approval.status === 'pending') {
          pendingApprovals.push(approval);
        }
      });
    });
    return pendingApprovals;
  };

  const isStageCompleted = (stageId: OnboardingStage): boolean => {
    if (!state) return false;
    const stage = state.stages.find((s: OnboardingStageConfig) => s.id === stageId);
    return stage?.completed || false;
  };

  // Pricing selector functions
  const showPricingSelector = () => {
    setIsPricingSelectorVisible(true);
  };

  const hidePricingSelector = () => {
    setIsPricingSelectorVisible(false);
  };

  const savePricingSelection = (selection: PricingSelection) => {
    setPricingSelection(selection);

    // Add a message showing the selection summary
    const countriesCount = selection.selectedCountries.length;
    const servicesCount = Object.values(selection.selectedServices)
      .reduce((total, services) => total + services.length, 0);

    const content = `📋 **Pricing Proposal Selection Summary**

You've selected ${countriesCount} countries with a total of ${servicesCount} services.

**Countries Selected:**
${selection.selectedCountries.map(code => {
  const countryName = selection.regions
    .flatMap((r: any) => r.countries)
    .find((c: any) => c.code === code)?.name || code;
  return `• ${countryName}`;
}).join('\n')}

This selection has been saved to your profile and will be used to prepare your commercial proposal.`;

    sendMessage(content, 'agent', 'pricing-selection');
    hidePricingSelector();
  };

  const contextValue: PartnerOnboardingContextType = {
    state,
    initializeOnboarding,
    sendMessage,
    uploadDocument,
    skipOptionalDocument,
    markDocumentReceived,
    updateApprovalStatus,
    moveToNextStage,
    skipStage,
    resetOnboarding,
    getCurrentStageConfig,
    getPendingApprovals,
    isStageCompleted,
    showPricingSelector,
    hidePricingSelector,
    savePricingSelection,
    isPricingSelectorVisible,
    pricingSelection
  };

  return (
    <PartnerOnboardingContext.Provider value={contextValue}>
      {children}
    </PartnerOnboardingContext.Provider>
  );
};

// Custom hook for using partner onboarding context
export function usePartnerOnboarding(): PartnerOnboardingContextType {
  const context = useContext(PartnerOnboardingContext);
  if (context === undefined) {
    throw new Error('usePartnerOnboarding must be used within a PartnerOnboardingProvider');
  }
  return context;
}