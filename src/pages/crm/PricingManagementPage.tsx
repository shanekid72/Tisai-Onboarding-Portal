import React, { useState, useEffect } from 'react';
import { usePricingData } from '../../context/PricingDataContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Region, Country, Service } from '../../context/PricingDataContext';

// Import manager components
import RegionManager from '../../components/crm/pricing/RegionManager';
import CountryManager from '../../components/crm/pricing/CountryManager';
import ServiceManager from '../../components/crm/pricing/ServiceManager';

import './PricingManagementPage.css';

/**
 * PricingManagementPage component allows CRM admins and partnership users to
 * dynamically manage pricing data including regions, countries, and services.
 */
const PricingManagementPage: React.FC = () => {
  const { 
    pricingData, 
    isLoading, 
    error, 
    saveChanges,
    updateRegion,
    addRegion,
    deleteRegion,
    updateCountry,
    addCountry,
    deleteCountry,
    updateService,
    addService,
    deleteService,
    resetToDefault,
    canEdit
  } = usePricingData();
  
  const { authState } = useAdminAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  
  // Reset selected country when changing region
  useEffect(() => {
    setSelectedCountryCode(null);
  }, [selectedRegionId]);
  
  // Check if user can access this page
  const isAuthorized = 
    authState.isAuthenticated && 
    authState.user && 
    (authState.user.role === 'super_admin' || 
     authState.user.role === 'partnership' || 
     authState.user.role === 'business');
  
  if (!isAuthorized) {
    return (
      <div className="unauthorized-container">
        <h1>Unauthorized Access</h1>
        <p>You do not have permission to access this page.</p>
        <p>This page is restricted to Admin and Partnership team members only.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="loading">Loading pricing data...</div>;
  }
  
  // Get the selected region and country from the pricing data
  const selectedRegion = selectedRegionId 
    ? pricingData.find(region => region.id === selectedRegionId) 
    : null;
    
  const selectedCountry = selectedRegion && selectedCountryCode
    ? selectedRegion.countries.find(country => country.code === selectedCountryCode)
    : null;
  
  const handleSaveChanges = async () => {
    const success = await saveChanges();
    if (success) {
      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset to default pricing data? All changes will be lost.')) {
      await resetToDefault();
      setSelectedRegionId(null);
      setSelectedCountryCode(null);
      setSuccessMessage('Reset to default pricing data successful!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  // Handle region operations
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId === selectedRegionId ? null : regionId);
  };
  
  const handleUpdateRegion = (regionId: string, updates: Partial<Region>) => {
    updateRegion(regionId, updates);
  };
  
  const handleAddRegion = (newRegion: Region) => {
    addRegion(newRegion);
    setSelectedRegionId(newRegion.id);
  };
  
  const handleDeleteRegion = (regionId: string) => {
    deleteRegion(regionId);
    if (selectedRegionId === regionId) {
      setSelectedRegionId(null);
    }
  };
  
  // Handle country operations
  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode === selectedCountryCode ? null : countryCode);
  };
  
  const handleUpdateCountry = (countryCode: string, updates: Partial<Country>) => {
    if (selectedRegionId) {
      updateCountry(selectedRegionId, countryCode, updates);
    }
  };
  
  const handleAddCountry = (newCountry: Country) => {
    if (selectedRegionId) {
      addCountry(selectedRegionId, newCountry);
      setSelectedCountryCode(newCountry.code);
    }
  };
  
  const handleDeleteCountry = (countryCode: string) => {
    if (selectedRegionId) {
      deleteCountry(selectedRegionId, countryCode);
      if (selectedCountryCode === countryCode) {
        setSelectedCountryCode(null);
      }
    }
  };
  
  // Handle service operations
  const handleUpdateService = (serviceId: string, updates: Partial<Service>) => {
    if (selectedRegionId && selectedCountryCode) {
      updateService(selectedRegionId, selectedCountryCode, serviceId, updates);
    }
  };
  
  const handleAddService = (newService: Service) => {
    if (selectedRegionId && selectedCountryCode) {
      addService(selectedRegionId, selectedCountryCode, newService);
    }
  };
  
  const handleDeleteService = (serviceId: string) => {
    if (selectedRegionId && selectedCountryCode) {
      deleteService(selectedRegionId, selectedCountryCode, serviceId);
    }
  };
  
  return (
    <div className="pricing-panels-container" style={{ marginTop: '20px' }}>
      <div className="pricing-management-header">
        <h1>Pricing Data Management</h1>
        <p>Manage regions, countries, and payment services data for the pricing proposal tool</p>
        
        <div className="action-buttons">
          <button 
            className="save-button" 
            onClick={handleSaveChanges}
            disabled={!canEdit}
          >
            Save Changes
          </button>
          <button 
            className="reset-button" 
            onClick={handleReset}
            disabled={!canEdit}
          >
            Reset to Default
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {!canEdit && (
          <div className="view-only-notice">
            <p>You are in view-only mode. Only Admin and Partnership users can edit pricing data.</p>
          </div>
        )}
      </div>
      
      <div className="pricing-management-content">
        <div className="pricing-grid">
          {/* Region Manager */}
          <div className="region-section">
            <RegionManager 
              regions={pricingData}
              selectedRegionId={selectedRegionId}
              onSelectRegion={handleSelectRegion}
              onAddRegion={handleAddRegion}
              onUpdateRegion={handleUpdateRegion}
              onDeleteRegion={handleDeleteRegion}
              canEdit={canEdit}
            />
          </div>
          
          {/* Country Manager */}
          <div className="country-section">
            <div style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '20px',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 700,
                color: 'white',
                textTransform: 'uppercase'
              }}>COUNTRIES</h2>
              {canEdit && (
                <button
                  className="add-button"
                  onClick={() => {
                    // Find the add country button in CountryManager and simulate click
                    const addButton = document.querySelector('.country-section .add-button');
                    if (addButton) {
                      (addButton as HTMLButtonElement).click();
                    }
                  }}
                  disabled={!selectedRegionId}
                >
                  Add Country
                </button>
              )}
            </div>
            <CountryManager 
              countries={selectedRegion?.countries || []}
              selectedCountryCode={selectedCountryCode}
              onSelectCountry={handleSelectCountry}
              onAddCountry={handleAddCountry}
              onUpdateCountry={handleUpdateCountry}
              onDeleteCountry={handleDeleteCountry}
              canEdit={canEdit}
            />
          </div>
          
          {/* Service Manager */}
          <div className="service-section">
            <ServiceManager 
              services={selectedCountry?.services || []}
              onAddService={handleAddService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingManagementPage;
