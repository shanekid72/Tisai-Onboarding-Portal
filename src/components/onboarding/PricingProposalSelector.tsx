import React, { useState, useEffect } from 'react';
import './PricingProposalSelector.css';

// Define interfaces for the data structure
interface Region {
  name: string;
  countries: Country[];
}

interface Country {
  name: string;
  flagUrl: string;
  code: string;
  currency: string;
  services: Service[];
}

interface Service {
  name: string;
  unitPrice: number;
  unit: string;
}

interface PricingSelectionItem {
  region: string;
  country: string;
  countryCode: string;
  currency: string;
  service: string;
  unitPrice: number;
  unit: string;
}

// Import the context PricingSelection type
import { PricingSelection } from '../../types/partnerOnboarding';

// This is the internal component's selection item format
interface ComponentPricingSelection {
  items: PricingSelectionItem[];
}

interface PricingProposalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selection: PricingSelection) => void;
}

const steps = [
  { id: 'regions', title: 'Select Regions', description: 'Choose the regions you operate in' },
  { id: 'countries', title: 'Select Countries', description: 'Choose countries within selected regions' },
  { id: 'services', title: 'Select Services', description: 'Choose services in selected countries' },
  { id: 'review', title: 'Review & Submit', description: 'Review your selections' }
];

const PricingProposalSelector: React.FC<PricingProposalSelectorProps> = ({ isOpen, onClose, onComplete }) => {
  console.log('Rendering PricingProposalSelector', { isOpen });
  // State for each step
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // Start with loading false
  const [error, setError] = useState<string | null>(null);
  
  // Data state - initialize with hardcoded data
  const [regions, setRegions] = useState<Region[]>([
    {
      name: 'North America',
      countries: [
        {
          name: 'United States',
          code: 'US',
          flagUrl: 'https://flagcdn.com/us.svg',
          currency: 'USD',
          services: [
            { name: 'SMS', unitPrice: 0.01, unit: 'message' },
            { name: 'Voice', unitPrice: 0.02, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.05, unit: 'verification' }
          ]
        },
        {
          name: 'Canada',
          code: 'CA',
          flagUrl: 'https://flagcdn.com/ca.svg',
          currency: 'CAD',
          services: [
            { name: 'SMS', unitPrice: 0.015, unit: 'message' },
            { name: 'Voice', unitPrice: 0.025, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.06, unit: 'verification' }
          ]
        }
      ]
    },
    {
      name: 'Europe',
      countries: [
        {
          name: 'United Kingdom',
          code: 'GB',
          flagUrl: 'https://flagcdn.com/gb.svg',
          currency: 'GBP',
          services: [
            { name: 'SMS', unitPrice: 0.012, unit: 'message' },
            { name: 'Voice', unitPrice: 0.022, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.055, unit: 'verification' }
          ]
        },
        {
          name: 'Germany',
          code: 'DE',
          flagUrl: 'https://flagcdn.com/de.svg',
          currency: 'EUR',
          services: [
            { name: 'SMS', unitPrice: 0.011, unit: 'message' },
            { name: 'Voice', unitPrice: 0.021, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.052, unit: 'verification' }
          ]
        }
      ]
    },
    {
      name: 'Asia Pacific',
      countries: [
        {
          name: 'Japan',
          code: 'JP',
          flagUrl: 'https://flagcdn.com/jp.svg',
          currency: 'JPY',
          services: [
            { name: 'SMS', unitPrice: 0.014, unit: 'message' },
            { name: 'Voice', unitPrice: 0.024, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.058, unit: 'verification' }
          ]
        },
        {
          name: 'Australia',
          code: 'AU',
          flagUrl: 'https://flagcdn.com/au.svg',
          currency: 'AUD',
          services: [
            { name: 'SMS', unitPrice: 0.013, unit: 'message' },
            { name: 'Voice', unitPrice: 0.023, unit: 'minute' },
            { name: 'Verification', unitPrice: 0.056, unit: 'verification' }
          ]
        }
      ]
    }
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>({});
  
  // No need for loadMockData since we're initializing with data directly
  useEffect(() => {
    // Log for debugging
    console.log('PricingProposalSelector mounted with initial data', { regions });
  }, []);
  
  // Handle region selection
  const handleRegionToggle = (regionName: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionName)) {
        // Remove region and its countries
        const region = regions.find(r => r.name === regionName);
        if (region) {
          const countryCodes = region.countries.map(country => country.code);
          setSelectedCountries(prev => prev.filter(code => !countryCodes.includes(code)));
          
          // Remove services for these countries
          const newSelectedServices = { ...selectedServices };
          countryCodes.forEach(code => {
            delete newSelectedServices[code];
          });
          setSelectedServices(newSelectedServices);
        }
        return prev.filter(r => r !== regionName);
      } else {
        return [...prev, regionName];
      }
    });
  };
  
  // Handle country selection
  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        // Remove country and its services
        const newSelectedServices = { ...selectedServices };
        delete newSelectedServices[countryCode];
        setSelectedServices(newSelectedServices);
        
        return prev.filter(code => code !== countryCode);
      } else {
        return [...prev, countryCode];
      }
    });
  };
  
  // Handle service selection
  const handleServiceToggle = (countryCode: string, serviceName: string) => {
    setSelectedServices(prev => {
      const newSelectedServices = { ...prev };
      
      if (!newSelectedServices[countryCode]) {
        newSelectedServices[countryCode] = [];
      }
      
      if (newSelectedServices[countryCode].includes(serviceName)) {
        newSelectedServices[countryCode] = newSelectedServices[countryCode].filter(s => s !== serviceName);
      } else {
        newSelectedServices[countryCode] = [...newSelectedServices[countryCode], serviceName];
      }
      
      return newSelectedServices;
    });
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Navigate to previous step
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  // Complete the selection process
  const handleComplete = () => {
    // Gather all selected services
    const selectedItems: PricingSelectionItem[] = [];
    
    // These will be used for the context format
    const selectedRegionObjects: any[] = [];
    const uniqueSelectedCountries: string[] = [];
    const servicesMap: Record<string, string[]> = {};
    
    for (const region of regions) {
      if (selectedRegions.includes(region.name)) {
        // Add region to the context format
        selectedRegionObjects.push(region);
        
        for (const country of region.countries) {
          if (selectedCountries.includes(country.code)) {
            // Add country to the unique list
            if (!uniqueSelectedCountries.includes(country.code)) {
              uniqueSelectedCountries.push(country.code);
            }
            
            const countryServices = selectedServices[country.code] || [];
            // Add services to the map
            servicesMap[country.code] = countryServices;
            
            for (const serviceId of countryServices) {
              const service = country.services.find(s => s.name === serviceId);
              if (service) {
                selectedItems.push({
                  region: region.name,
                  country: country.name,
                  countryCode: country.code,
                  currency: country.currency,
                  service: service.name,
                  unitPrice: service.unitPrice,
                  unit: service.unit
                });
              }
            }
          }
        }
      }
    }
    
    // Convert to the expected PricingSelection format
    const pricingSelection: PricingSelection = {
      regions: selectedRegionObjects,
      selectedCountries: uniqueSelectedCountries,
      selectedServices: servicesMap
    };
    
    onComplete(pricingSelection);
    onClose();
  };
  
  // Check if a region is selected
  const isRegionSelected = (regionName: string) => {
    return selectedRegions.includes(regionName);
  };
  
  // Check if a country is selected
  const isCountrySelected = (countryCode: string) => {
    return selectedCountries.includes(countryCode);
  };
  
  // Check if a service is selected for a country
  const isServiceSelected = (countryCode: string, serviceName: string) => {
    return selectedServices[countryCode]?.includes(serviceName) || false;
  };
  
  // Get available countries based on selected regions
  const getAvailableCountries = () => {
    if (selectedRegions.length === 0) return [];
    
    return regions
      .filter(region => selectedRegions.includes(region.name))
      .flatMap(region => region.countries);
  };
  
  // Get the step content based on active step
  const getStepContent = () => {
    console.log('Rendering step content', { activeStep, regions, selectedRegions, selectedCountries });
    
    // Debug check for data
    if (regions.length === 0 && !loading) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>No regions available. Please try refreshing.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      );
    }
    
    const stepContainerStyle = {
      padding: '20px',
      backgroundColor: 'white',
    };
    
    const stepTitleStyle = {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px'
    };
    
    const gridStyle = {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
      gap: '16px'  
    };
    
    const cardStyle = (selected: boolean) => ({
      border: `1px solid ${selected ? '#1890ff' : '#ddd'}`,
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      backgroundColor: selected ? '#e6f7ff' : 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    });
    
    switch (activeStep) {
      case 0: // Select regions
        return (
          <div style={stepContainerStyle}>
            <h2 style={stepTitleStyle}>Select Regions</h2>
            <div style={gridStyle}>
              {regions.map(region => (
                <div
                  key={region.name}
                  style={cardStyle(isRegionSelected(region.name))}
                  onClick={() => handleRegionToggle(region.name)}
                >
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{region.name}</h3>
                  <p style={{ color: '#666' }}>{region.countries.length} countries available</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 1: // Select countries
        return (
          <div style={stepContainerStyle}>
            <h2 style={stepTitleStyle}>Select Countries</h2>
            <div style={gridStyle}>
              {getAvailableCountries().map(country => (
                <div
                  key={country.code}
                  style={cardStyle(isCountrySelected(country.code))}
                  onClick={() => handleCountryToggle(country.code)}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <img src={country.flagUrl} alt={`${country.name} flag`} style={{ width: '32px', height: '24px', marginRight: '8px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{country.name}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>{country.currency} • {country.services.length} services</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2: // Select services
        return (
          <div style={stepContainerStyle}>
            <h2 style={stepTitleStyle}>Select Services</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedCountries.map(countryCode => {
                const country = getAvailableCountries().find(c => c.code === countryCode);
                if (!country) return null;
                
                return (
                  <div key={country.code} style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      padding: '10px 0', 
                      borderBottom: '1px solid #eee', 
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <img 
                        src={country.flagUrl} 
                        alt={`${country.name} flag`} 
                        style={{ width: '24px', marginRight: '8px' }} 
                      />
                      {country.name}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      {country.services.map(service => (
                        <div
                          key={`${country.code}-${service.name}`}
                          style={{
                            border: `1px solid ${isServiceSelected(country.code, service.name) ? '#1890ff' : '#ddd'}`,
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: isServiceSelected(country.code, service.name) ? '#e6f7ff' : 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => handleServiceToggle(country.code, service.name)}
                        >
                          <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                          <div style={{ color: '#666' }}>
                            {service.unitPrice} {country.currency}/{service.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 3: // Review
        return (
          <div style={stepContainerStyle}>
            <h2 style={stepTitleStyle}>Review Your Selection</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.keys(selectedServices).map(countryCode => {
                const country = getAvailableCountries().find(c => c.code === countryCode);
                if (!country || selectedServices[countryCode].length === 0) return null;
                
                return (
                  <div key={country.code} style={{ 
                    padding: '16px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center', 
                      borderBottom: '1px solid #eee',
                      paddingBottom: '8px'
                    }}>
                      <img src={country.flagUrl} alt={`${country.name} flag`} style={{ width: '24px', marginRight: '8px' }} />
                      {country.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedServices[countryCode].map(serviceName => {
                        const service = country.services.find(s => s.name === serviceName);
                        if (!service) return null;
                        
                        return (
                          <div 
                            key={`${country.code}-${service.name}`} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #eee'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                            <div style={{ color: '#666' }}>
                              {service.unitPrice} {country.currency}/{service.unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Only render if the modal is open
  if (!isOpen) return null;
  
  // Count total selected services
  const totalSelectedServices = Object.values(selectedServices).reduce(
    (total, services) => total + services.length, 0
  );
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      color: '#333'
    }}>
      <div style={{ width: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Pricing Proposal Selector</h1>
          <button style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="pricing-content">
          {/* Steps indicator */}
          <div className="pricing-steps-indicator">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`pps-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}
              >
                <div className="pricing-step-number">{index + 1}</div>
                <div className="pricing-step-info">
                  <div className="pricing-step-title">{step.title}</div>
                  <div className="pricing-step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Step content */}
          {loading ? (
            <div className="pricing-loading">
              <div className="pricing-spinner"></div>
              <p>Loading pricing data...</p>
            </div>
          ) : error ? (
            <div className="pricing-error">
              <p>{error}</p>
              <button className="pricing-btn" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : (
            getStepContent()
          )}
        </div>
        
        {/* Footer with navigation buttons */}
        <div style={{
          borderTop: '1px solid #eee',
          marginTop: '20px',
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {activeStep > 0 && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>{selectedRegions.length} regions</span>
                {activeStep > 1 && <span>{selectedCountries.length} countries</span>}
                {activeStep > 2 && <span>{totalSelectedServices} services</span>}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={activeStep === 0 ? onClose : handleBack}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#1890ff',
                border: '1px solid #1890ff',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: (activeStep === 0 && selectedRegions.length === 0 ||
                          activeStep === 1 && selectedCountries.length === 0 ||
                          activeStep === 2 && totalSelectedServices === 0) ? '0.5' : '1'
              }}
              onClick={activeStep === steps.length - 1 ? handleComplete : handleNext}
              disabled={activeStep === 0 && selectedRegions.length === 0 ||
                       activeStep === 1 && selectedCountries.length === 0 ||
                       activeStep === 2 && totalSelectedServices === 0}
            >
              {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingProposalSelector;
