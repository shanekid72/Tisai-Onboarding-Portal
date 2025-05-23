import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import NDAStep from './NDAStep';
import KYCStep from './KYCStep';
import CompletedStep from './CompletedStep';
import ChatInterface from './ChatInterface';
import { gsap } from 'gsap';

const OnboardingFlow: React.FC = () => {
  const { state } = useOnboarding();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle step transitions with animations
  useEffect(() => {
    if (isAnimating) {
      gsap.to('.step-container', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          setIsAnimating(false);
        }
      });
    } else {
      gsap.fromTo('.step-container',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, [state.currentStep, isAnimating]);

  // Render current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'chat':
        return <ChatInterface />;
      case 'nda':
        return <NDAStep />;
      case 'kyc':
        return <KYCStep />;
      case 'completed':
        return <CompletedStep />;
      default:
        return <ChatInterface />;
    }
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { id: 'chat', label: 'Setup' },
      { id: 'nda', label: 'NDA' },
      { id: 'kyc', label: 'KYC' },
      { id: 'completed', label: 'Completed' }
    ];

    const getCurrentStepIndex = () => {
      return steps.findIndex(step => step.id === state.currentStep);
    };

    const currentIndex = getCurrentStepIndex();

    return (
      <div className="mb-10">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="relative">
                <div 
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full 
                    ${index <= currentIndex ? 'bg-indigo-600' : 'bg-gray-700'}
                    ${index === currentIndex ? 'ring-4 ring-indigo-300/30' : ''}
                    transition-all duration-300
                  `}
                >
                  {index < currentIndex ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-white font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* Step label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span 
                    className={`
                      text-sm font-medium 
                      ${index <= currentIndex ? 'text-indigo-400' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-16 h-1 mx-1
                    ${index < currentIndex ? 'bg-indigo-600' : 'bg-gray-700'}
                    transition-all duration-300
                  `}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 px-4">
      {renderProgressIndicator()}
      
      <div className="step-container">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow; 