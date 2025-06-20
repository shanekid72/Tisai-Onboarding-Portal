import React, { useState, useEffect } from 'react';
import { 
  transformPricingData,
  mockPricingData,
  getRegions, 
  getCountriesForRegion, 
  getServicesForCountry, 
  getCoverageForService,
  PricingData,
  PricingCoverage
} from '../../utils/pricingDataUtils';
import { PricingSelection } from '../../types/partnerOnboarding';
import './PricingProposalSelector.css';

// Types
interface PricingProposalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selections: PricingSelection) => void;
}

// Component definition with named export
export const PricingProposalSelector: React.FC<PricingProposalSelectorProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // Basic state to ensure component loads
  const [activeStep, setActiveStep] = useState(0);
  
  if (!isOpen) return null;
  
  return (
    <div className="pricing-proposal-overlay">
      <div className="pricing-proposal-modal">
        <div className="pricing-proposal-header">
          <h2>Pricing Proposal Selector</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="pricing-proposal-content">
          <p>This is a simplified version of the component to fix loading issues.</p>
          
          <div className="pricing-proposal-actions">
            <button 
              className="primary-button"
              onClick={() => onComplete({ selections: [] })}
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default export to ensure compatibility with both import styles
export default PricingProposalSelector;
