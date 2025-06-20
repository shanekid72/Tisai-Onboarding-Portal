import React, { useState, useEffect } from 'react';
import PartnerOnboardingChat from './PartnerOnboardingChat';
import PricingProposalSelector from './PricingProposalSelector';

// StaticImportCheck utility function to verify if an import is valid
const isValidComponent = (component: any): boolean => {
  return (
    component !== null && 
    component !== undefined && 
    (typeof component === 'function' || typeof component === 'object')
  );
}

// This component is purely for debugging purposes to help isolate import issues
const DependencyCheck: React.FC = () => {
  const [componentStatus, setComponentStatus] = useState<Record<string, {loaded: boolean, error?: string}>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check components using static imports instead of dynamic imports
    const checkComponents = () => {
      const status: Record<string, {loaded: boolean, error?: string}> = {};
      
      // Check PricingProposalSelector
      try {
        status['PricingProposalSelector'] = { 
          loaded: isValidComponent(PricingProposalSelector),
          error: isValidComponent(PricingProposalSelector) ? undefined : 'Component not properly loaded'
        };
      } catch (error) {
        console.error('Error checking PricingProposalSelector:', error);
        status['PricingProposalSelector'] = { 
          loaded: false, 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
      
      // Check PartnerOnboardingChat
      try {
        status['PartnerOnboardingChat'] = { 
          loaded: isValidComponent(PartnerOnboardingChat),
          error: isValidComponent(PartnerOnboardingChat) ? undefined : 'Component not a valid React component'
        };
      } catch (error) {
        console.error('Error checking PartnerOnboardingChat:', error);
        status['PartnerOnboardingChat'] = { 
          loaded: false, 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
      
      setComponentStatus(status);
      setIsLoading(false);
    };
    
    checkComponents();
  }, []);
  
  if (isLoading) {
    return <div className="p-6 bg-gray-800 text-white">Checking component dependencies...</div>;
  }
  
  const hasErrors = Object.values(componentStatus).some(status => !status.loaded);
  
  return (
    <div className="p-6 bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-4">
        {hasErrors ? (
          <span className="text-red-400">Component Dependency Check Failed</span>
        ) : (
          <span className="text-green-400">All Components Available</span>
        )}
      </h2>
      
      <ul className="space-y-3">
        {Object.entries(componentStatus).map(([name, status]) => (
          <li key={name} className="flex flex-col">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 mr-2 ${status.loaded ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></span>
              <span className={status.loaded ? 'text-white/90' : 'text-red-300'}>{name}</span>
              <span className="ml-2 text-xs text-white/50">{status.loaded ? '✓ loaded' : '✗ failed'}</span>
            </div>
            {!status.loaded && status.error && (
              <div className="ml-5 mt-1 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs font-mono whitespace-pre-wrap text-red-300/80">
                {status.error}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DependencyCheck;
