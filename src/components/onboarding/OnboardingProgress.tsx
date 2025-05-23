import React from 'react';

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'organization'
  | 'email'
  | 'api-questions'
  | 'nda-download'
  | 'nda-upload'
  | 'kyc'
  | 'completed';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'name', label: 'Company Info', icon: '🏢' },
  { id: 'email', label: 'API Connection', icon: '🔗' },
  { id: 'nda-download', label: 'Configuration', icon: '⚙️' },
  { id: 'nda-upload', label: 'Integration', icon: '🔄' },
];

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  // Determine the active step index
  const currentStepIndex = STEPS.findIndex(step => {
    // Map specific steps to their parent step categories
    if (currentStep === 'organization') return step.id === 'name';
    if (currentStep === 'kyc' || currentStep === 'completed') return step.id === 'nda-upload';
    return step.id === currentStep;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-6 text-white">Your Progress</h2>
      <div className="space-y-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <div 
              key={step.id}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-secondary/20 text-white' 
                  : isComplete 
                    ? 'bg-dark/30 text-white/70' 
                    : 'bg-dark/10 text-white/40'
              }`}
            >
              <div 
                className={`w-10 h-10 flex items-center justify-center rounded-full mr-3 ${
                  isActive 
                    ? 'bg-secondary text-white' 
                    : isComplete 
                      ? 'bg-secondary/20 text-white' 
                      : 'bg-white/5 text-white/40'
                }`}
              >
                {isComplete ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span className="font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress; 