import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

// Define the possible onboarding steps
type OnboardingStep = 
  | 'welcome'
  | 'quick-setup'
  | 'api-connection'
  | 'configuration'
  | 'integration';

interface ProgressTrackerProps {
  mode: 'fast-track';
  currentStep?: OnboardingStep;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  mode, 
  currentStep = 'welcome'
}) => {
  const [activeStep, setActiveStep] = useState<OnboardingStep>(currentStep);

  // Define steps for fast-track mode
  const steps: { id: OnboardingStep; label: string; icon: string }[] = [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'quick-setup', label: 'Quick Setup', icon: '⚡' },
    { id: 'api-connection', label: 'API Connection', icon: '🔗' },
    { id: 'configuration', label: 'Configuration', icon: '⚙️' },
    { id: 'integration', label: 'Integration', icon: '📦' }
  ];

  // Update active step when currentStep prop changes
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  // Animation when step changes
  useEffect(() => {
    // Find the index of the current step
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    
    // Animate the progress
    gsap.to('.progress-bar-fill', {
      width: `${(currentIndex / (steps.length - 1)) * 100}%`,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Highlight current step
    gsap.to(`.step-${activeStep}`, {
      scale: 1.05,
      backgroundColor: 'rgba(255, 87, 51, 0.2)',
      duration: 0.3
    });

    return () => {
      gsap.killTweensOf('.progress-bar-fill');
      gsap.killTweensOf(`.step-${activeStep}`);
    };
  }, [activeStep, steps]);

  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-6">Your Progress</h3>
      
      {/* Progress bar */}
      <div className="relative h-1 bg-white bg-opacity-10 rounded-full mb-8">
        <div className="progress-bar-fill absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-accent rounded-full" style={{ width: '0%' }}></div>
      </div>
      
      {/* Steps */}
      <div className="space-y-3 flex-1">
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          const isCompleted = steps.findIndex(s => s.id === step.id) < steps.findIndex(s => s.id === activeStep);
          
          return (
            <div 
              key={step.id}
              className={`step-${step.id} flex items-center p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-secondary bg-opacity-10' 
                  : isCompleted 
                    ? 'bg-white bg-opacity-5' 
                    : 'bg-transparent'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-3 ${
                isActive 
                  ? 'bg-secondary text-white' 
                  : isCompleted 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-white bg-opacity-10 text-white text-opacity-40'
              }`}>
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span className={`${
                isActive 
                  ? 'font-medium text-white' 
                  : isCompleted 
                    ? 'text-white' 
                    : 'text-white text-opacity-40'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Action buttons or info based on step */}
      <div className="mt-6 p-4 rounded-lg bg-white bg-opacity-5">
        <p className="text-sm text-white text-opacity-70 mb-2">
          {activeStep === 'welcome' && "Let's get you set up with WorldAPI!"}
          {activeStep === 'quick-setup' && "Just the essentials to get you started quickly."}
          {activeStep === 'api-connection' && "We'll establish a connection to the WorldAPI servers."}
          {activeStep === 'configuration' && "Download your config file when ready."}
          {activeStep === 'integration' && "Almost there! Let's integrate your API."}
        </p>
        {activeStep === 'configuration' && (
          <button className="btn btn-sm btn-outline w-full mt-2">
            Download Configuration
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker; 