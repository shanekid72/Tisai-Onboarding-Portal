import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { usePartnerOnboarding } from '../../context/PartnerOnboardingContext';
import { OnboardingStage } from '../../types/partnerOnboarding';

const PartnerOnboardingProgress: React.FC = () => {
  const { state, calculateProgress } = usePartnerOnboarding();

  // Animation when progress changes
  useEffect(() => {
    if (state) {
      const progress = calculateProgress();
      gsap.to('.progress-bar-fill', {
        width: `${progress}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [state, calculateProgress]);

  if (!state) return null;

  const getStageIcon = (stageId: OnboardingStage) => {
    const icons = {
      'nda': '📄',
      'commercials': '💰',
      'kyc': '🔍',
      'agreement': '✍️',
      'integration': '🔧',
      'uat': '🧪',
      'go-live': '🚀'
    };
    return icons[stageId] || '📋';
  };

  const getStageStatus = (stage: any) => {
    if (stage.completed) return 'completed';
    if (stage.id === state.currentStage) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'active': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const progress = calculateProgress();

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Onboarding Progress</h3>
        <div className="text-2xl font-bold text-blue-400">{progress}% Complete</div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-700 rounded-full mb-8">
        <div 
          className="progress-bar-fill absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
          style={{ width: '0%' }}
        />
      </div>

      {/* Partner Info */}
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-2">Partner Information</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <div><strong>Name:</strong> {state.partnerInfo.name}</div>
          <div><strong>Organization:</strong> {state.partnerInfo.organization}</div>
          <div><strong>Email:</strong> {state.partnerInfo.email}</div>
          {state.partnerInfo.role && (
            <div><strong>Role:</strong> {state.partnerInfo.role}</div>
          )}
        </div>
      </div>

      {/* Stages */}
      <div className="flex-1 space-y-3">
        <h4 className="font-medium mb-3">Onboarding Stages</h4>
        {state.stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const isActive = stage.id === state.currentStage;
          
          return (
            <div 
              key={stage.id}
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive ? 'bg-blue-400/10 border border-blue-400/30' : 'bg-gray-700/30'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-3 ${getStatusColor(status)}`}>
                {status === 'completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{getStageIcon(stage.id)}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${isActive ? 'text-blue-400' : status === 'completed' ? 'text-green-400' : 'text-gray-300'}`}>
                  {stage.title}
                </div>
                <div className="text-xs text-gray-400">
                  {stage.description}
                </div>
                
                {/* Approval Status */}
                {stage.approvals.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {stage.approvals.map((approval) => (
                      <div key={approval.team} className="flex items-center text-xs">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          approval.status === 'approved' ? 'bg-green-400' :
                          approval.status === 'rejected' ? 'bg-red-400' :
                          approval.status === 'not-required' ? 'bg-gray-400' :
                          'bg-yellow-400'
                        }`} />
                        <span className="text-gray-400">
                          {approval.team}: {approval.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {isActive && (
                <div className="text-blue-400 text-xs font-medium">
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
        <div className="text-xs text-gray-400 space-y-1">
          <div>Started: {state.lastActivity.toLocaleDateString()}</div>
          <div>Last Activity: {state.lastActivity.toLocaleTimeString()}</div>
          {state.isCompleted && state.activationDate && (
            <div className="text-green-400">
              Activated: {state.activationDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboardingProgress; 