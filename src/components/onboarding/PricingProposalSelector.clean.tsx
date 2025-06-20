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

interface SelectionState {
  region: string;
  country: string;
  service: string;
  coverage: number | null;
}

interface Selection {
  region: string;
  country: string;
  service: string;
  coverage: PricingCoverage;
}

// Component definition with named export
export const PricingProposalSelector: React.FC<PricingProposalSelectorProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // State management
  const [activeStep, setActiveStep] = useState<number>(0);
  const [processedData, setProcessedData] = useState<PricingData>(mockPricingData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selection, setSelection] = useState<SelectionState>({
    region: '',
    country: '',
    service: '',
    coverage: null
  });
  
  // Derived data based on selections
  const regions = getRegions(processedData);
  const countries = getCountriesForRegion(processedData, selection.region);
  const services = getServicesForCountry(processedData, selection.region, selection.country);
  const coverageOptions = getCoverageForService(
    processedData, 
    selection.region, 
    selection.country, 
    selection.service
  );
  
  // Selected coverage details
  const selectedCoverage = selection.coverage !== null 
    ? coverageOptions[selection.coverage] 
    : null;
  
  // Final selections for review and submission
  const [finalSelections, setFinalSelections] = useState<Selection[]>([]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  
  // Load and process pricing data
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Environment-based data loading strategy
        let data: PricingData;
        
        // Check environment and load data accordingly
        const isProduction = process.env.NODE_ENV === 'production';
        const isTest = process.env.NODE_ENV === 'test';
        
        if (isProduction) {
          // In production, fetch from API endpoint
          try {
            const response = await fetch('/api/pricing/data');
            if (!response.ok) {
              throw new Error(`Failed to fetch pricing data: ${response.status}`);
            }
            const rawData = await response.json();
            data = transformPricingData(rawData);
          } catch (fetchError) {
            console.error('API fetch error:', fetchError);
            // Fallback to mock data if API fails in production
            console.warn('Falling back to mock pricing data');
            data = mockPricingData;
          }
        } else {
          // In development or test, use mock data
          console.log(`Using mock pricing data (${isTest ? 'test' : 'development'} environment)`);
          data = mockPricingData;
        }
        
        console.log('Pricing data loaded successfully');
        setProcessedData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error processing pricing data:", err);
        setError("Failed to load pricing data. Please try again.");
        setLoading(false);
      }
    };
    
    loadPricingData();
  }, []);
  
  // Reset dependent fields when parent selection changes
  useEffect(() => {
    if (!selection.region) {
      setSelection(prev => ({
        ...prev,
        country: '',
        service: '',
        coverage: null
      }));
    }
  }, [selection.region]);
  
  useEffect(() => {
    if (!selection.country) {
      setSelection(prev => ({
        ...prev,
        service: '',
        coverage: null
      }));
    }
  }, [selection.country]);
  
  useEffect(() => {
    if (!selection.service) {
      setSelection(prev => ({
        ...prev,
        coverage: null
      }));
    }
  }, [selection.service]);
  
  // Handlers
  const handleRegionChange = (region: string) => {
    setSelection(prev => ({
      ...prev,
      region,
      country: '',
      service: '',
      coverage: null
    }));
  };
  
  const handleCountryChange = (country: string) => {
    setSelection(prev => ({
      ...prev,
      country,
      service: '',
      coverage: null
    }));
  };
  
  const handleServiceChange = (service: string) => {
    setSelection(prev => ({
      ...prev,
      service,
      coverage: null
    }));
  };
  
  const handleCoverageChange = (coverageIndex: number) => {
    setSelection(prev => ({
      ...prev,
      coverage: coverageIndex
    }));
  };
  
  const handleAddSelection = () => {
    if (selection.region && selection.country && selection.service && selection.coverage !== null) {
      const newSelection: Selection = {
        region: selection.region,
        country: selection.country,
        service: selection.service,
        coverage: coverageOptions[selection.coverage]
      };
      
      setFinalSelections(prev => [...prev, newSelection]);
      
      // Reset selection for adding another
      setSelection({
        region: '',
        country: '',
        service: '',
        coverage: null
      });
    }
  };
  
  const handleRemoveSelection = (index: number) => {
    setFinalSelections(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleReview = () => {
    // If no selections yet but current selection is complete, add it first
    if (finalSelections.length === 0 && 
        selection.region && 
        selection.country && 
        selection.service && 
        selection.coverage !== null) {
      handleAddSelection();
    }
    
    setIsReviewing(true);
  };
  
  const handleBack = () => {
    setIsReviewing(false);
  };
  
  const handleComplete = () => {
    const result: PricingSelection = {
      selections: finalSelections.map(sel => ({
        region: sel.region,
        country: sel.country,
        service: sel.service,
        coverage: sel.coverage.coverage,
        currency: sel.coverage.currency,
        fee: sel.coverage.fee,
        transactionLimit: sel.coverage.transactionLimit,
        tat: sel.coverage.tat
      }))
    };
    
    onComplete(result);
  };

  // Don't render if not open
  if (!isOpen) return null;
  
  return (
    <div className="pricing-proposal-overlay">
      <div className="pricing-proposal-modal">
        <div className="pricing-proposal-header">
          <h2>Pricing Proposal Selector</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="pricing-proposal-content">
          {loading ? (
            <div className="pricing-loading">
              <div className="loading-spinner"></div>
              <p>Loading pricing data...</p>
            </div>
          ) : error ? (
            <div className="pricing-error">
              <p>{error}</p>
              <button 
                className="pricing-btn pricing-btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </div>
          ) : isReviewing ? (
            // Review step
            <div className="pricing-review">
              <h3>Review Your Selections</h3>
              
              {finalSelections.length === 0 ? (
                <p className="no-selections">No selections have been added yet.</p>
              ) : (
                <div className="pricing-selections-list">
                  {finalSelections.map((item, index) => (
                    <div key={index} className="pricing-selection-card">
                      <div className="pricing-selection-details">
                        <h4>{item.region} &gt; {item.country}</h4>
                        <p className="pricing-service">{item.service}</p>
                        <p className="pricing-coverage">{item.coverage.coverage}</p>
                        <div className="pricing-stats">
                          <div className="pricing-stat">
                            <span className="stat-label">Currency:</span> 
                            <span className="stat-value">{item.coverage.currency}</span>
                          </div>
                          <div className="pricing-stat">
                            <span className="stat-label">Fee:</span> 
                            <span className="stat-value">{item.coverage.fee}</span>
                          </div>
                          <div className="pricing-stat">
                            <span className="stat-label">Limit:</span> 
                            <span className="stat-value">{item.coverage.transactionLimit}</span>
                          </div>
                          <div className="pricing-stat">
                            <span className="stat-label">TAT:</span> 
                            <span className="stat-value">{item.coverage.tat}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="pricing-remove-btn"
                        onClick={() => handleRemoveSelection(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pricing-navigation">
                <button 
                  className="pricing-btn pricing-btn-secondary"
                  onClick={handleBack}
                >
                  Back to Selection
                </button>
                
                <button 
                  className="pricing-btn pricing-btn-primary"
                  onClick={handleComplete}
                  disabled={finalSelections.length === 0}
                >
                  Complete
                </button>
              </div>
            </div>
          ) : (
            // Selection step
            <div className="pricing-selection">
              <div className="selection-grid">
                {/* Region Selection */}
                <div className="selection-column">
                  <h3>Region</h3>
                  <div className="selection-options">
                    {regions.map((region, idx) => (
                      <div 
                        key={idx}
                        className={`selection-option ${selection.region === region ? 'selected' : ''}`}
                        onClick={() => handleRegionChange(region)}
                      >
                        {region}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Country Selection */}
                <div className="selection-column">
                  <h3>Country</h3>
                  <div className="selection-options">
                    {selection.region ? (
                      countries.map((country, idx) => (
                        <div 
                          key={idx}
                          className={`selection-option ${selection.country === country ? 'selected' : ''}`}
                          onClick={() => handleCountryChange(country)}
                        >
                          {country}
                        </div>
                      ))
                    ) : (
                      <p className="selection-prompt">Select a region first</p>
                    )}
                  </div>
                </div>
                
                {/* Service Selection */}
                <div className="selection-column">
                  <h3>Service</h3>
                  <div className="selection-options">
                    {selection.country ? (
                      services.map((service, idx) => (
                        <div 
                          key={idx}
                          className={`selection-option ${selection.service === service ? 'selected' : ''}`}
                          onClick={() => handleServiceChange(service)}
                        >
                          {service}
                        </div>
                      ))
                    ) : (
                      <p className="selection-prompt">Select a country first</p>
                    )}
                  </div>
                </div>
                
                {/* Coverage Selection */}
                <div className="selection-column">
                  <h3>Coverage</h3>
                  <div className="selection-options">
                    {selection.service ? (
                      coverageOptions.map((coverage, idx) => (
                        <div 
                          key={idx}
                          className={`selection-option coverage-option ${selection.coverage === idx ? 'selected' : ''}`}
                          onClick={() => handleCoverageChange(idx)}
                        >
                          <div className="coverage-header">
                            <span className="coverage-name">{coverage.coverage}</span>
                            <span className="coverage-currency">{coverage.currency}</span>
                          </div>
                          <div className="coverage-details">
                            <div className="coverage-detail">
                              <span className="detail-label">Fee:</span>
                              <span className="detail-value">{coverage.fee}</span>
                            </div>
                            <div className="coverage-detail">
                              <span className="detail-label">Limit:</span>
                              <span className="detail-value">{coverage.transactionLimit}</span>
                            </div>
                            <div className="coverage-detail">
                              <span className="detail-label">TAT:</span>
                              <span className="detail-value">{coverage.tat}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="selection-prompt">Select a service first</p>
                    )}
                  </div>
                </div>
              </div>
              
              {finalSelections.length > 0 && (
                <div className="selections-summary">
                  <h3>Added Selections:</h3>
                  <div className="selections-list">
                    {finalSelections.map((item, index) => (
                      <div key={index} className="pricing-selection-summary">
                        {item.country} - {item.service} ({item.coverage.coverage})
                        <button
                          className="pricing-remove-btn-small"
                          onClick={() => handleRemoveSelection(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pricing-navigation">
                <div className="pricing-actions-group">
                  <button
                    className="pricing-btn pricing-btn-secondary"
                    onClick={handleAddSelection}
                    disabled={!selection.region || !selection.country || !selection.service || selection.coverage === null}
                  >
                    Add Selection
                  </button>
                  
                  <button
                    className="pricing-btn pricing-btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
                
                <button
                  className="pricing-btn pricing-btn-primary"
                  onClick={handleReview}
                  disabled={(finalSelections.length === 0 && 
                    (!selection.region || !selection.country || !selection.service || selection.coverage === null))}
                >
                  Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default export to ensure compatibility with both import styles
export default PricingProposalSelector;
