import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAdminAuth } from './AdminAuthContext';

// Define pricing data types
export type Region = {
  id: string;
  name: string;
  countries: Country[];
};

export type Country = {
  code: string;
  name: string;
  services: Service[];
};

export type Service = {
  id: string;
  name: string;
  type: 'bank-payout' | 'wallet-payout' | 'mobile-money' | 'card-payment';
  currency: string;
  coverage: string;
  transactionLimit: {
    min: number;
    max: number;
  };
  tat: string; // Turnaround Time
  feeStructure: {
    fixed: number;
    percentage: number;
    currency: string;
  };
};

// Mock API functions - would be replaced with real API calls in production
const savePricingData = async (data: Region[]): Promise<boolean> => {
  try {
    localStorage.setItem('pricingData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving pricing data:', error);
    return false;
  }
};

const loadPricingData = async (): Promise<Region[] | null> => {
  try {
    const data = localStorage.getItem('pricingData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading pricing data:', error);
    return null;
  }
};

// Import default pricing data from existing pricing data
import { defaultPricingData } from '../data/defaultPricingData';

// Define context type
interface PricingDataContextType {
  pricingData: Region[];
  isLoading: boolean;
  error: string | null;
  saveChanges: () => Promise<boolean>;
  updateRegion: (regionId: string, updates: Partial<Region>) => void;
  addRegion: (newRegion: Region) => void;
  deleteRegion: (regionId: string) => void;
  updateCountry: (regionId: string, countryCode: string, updates: Partial<Country>) => void;
  addCountry: (regionId: string, newCountry: Country) => void;
  deleteCountry: (regionId: string, countryCode: string) => void;
  updateService: (regionId: string, countryCode: string, serviceId: string, updates: Partial<Service>) => void;
  addService: (regionId: string, countryCode: string, newService: Service) => void;
  deleteService: (regionId: string, countryCode: string, serviceId: string) => void;
  resetToDefault: () => Promise<void>;
  canEdit: boolean;
}

// Create context
const PricingDataContext = createContext<PricingDataContextType | undefined>(undefined);

// Provider component
export const PricingDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricingData, setPricingData] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAdminAuth();
  
  // Check if user can edit pricing data (admin or partnership role)
  const canEdit = Boolean(
    authState.isAuthenticated && 
    authState.user && 
    (authState.user.role === 'super_admin' || 
     authState.user.role === 'partnership' || 
     authState.user.role === 'business')
  );

  // Load pricing data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Try to load data from storage
        const data = await loadPricingData();
        
        if (data) {
          setPricingData(data);
        } else {
          // If no saved data, use default data
          setPricingData(defaultPricingData);
          // Save default data
          await savePricingData(defaultPricingData);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load pricing data');
        console.error('Error loading pricing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Save all pricing data changes
  const saveChanges = async (): Promise<boolean> => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return false;
    }
    
    setIsLoading(true);
    try {
      const success = await savePricingData(pricingData);
      setIsLoading(false);
      if (!success) {
        setError('Failed to save pricing data');
      } else {
        setError(null);
      }
      return success;
    } catch (err) {
      setIsLoading(false);
      setError('Failed to save pricing data');
      return false;
    }
  };

  // Reset to default pricing data
  const resetToDefault = async (): Promise<void> => {
    if (!canEdit) {
      setError('You do not have permission to reset pricing data');
      return;
    }
    
    setIsLoading(true);
    try {
      setPricingData(defaultPricingData);
      await savePricingData(defaultPricingData);
      setError(null);
    } catch (err) {
      setError('Failed to reset pricing data');
    } finally {
      setIsLoading(false);
    }
  };

  // Region operations
  const updateRegion = (regionId: string, updates: Partial<Region>) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => 
        region.id === regionId 
          ? { ...region, ...updates, id: regionId } 
          : region
      )
    );
  };

  const addRegion = (newRegion: Region) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    // Ensure we don't duplicate region IDs
    if (pricingData.some(r => r.id === newRegion.id)) {
      setError(`Region with ID "${newRegion.id}" already exists`);
      return;
    }
    
    setPricingData(prevData => [...prevData, newRegion]);
  };

  const deleteRegion = (regionId: string) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => prevData.filter(region => region.id !== regionId));
  };

  // Country operations
  const updateCountry = (regionId: string, countryCode: string, updates: Partial<Country>) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            countries: region.countries.map(country => 
              country.code === countryCode 
                ? { ...country, ...updates, code: countryCode } 
                : country
            )
          };
        }
        return region;
      })
    );
  };

  const addCountry = (regionId: string, newCountry: Country) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          // Ensure we don't duplicate country codes within a region
          if (region.countries.some(c => c.code === newCountry.code)) {
            setError(`Country with code "${newCountry.code}" already exists in this region`);
            return region;
          }
          
          return {
            ...region,
            countries: [...region.countries, newCountry]
          };
        }
        return region;
      })
    );
  };

  const deleteCountry = (regionId: string, countryCode: string) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            countries: region.countries.filter(country => country.code !== countryCode)
          };
        }
        return region;
      })
    );
  };

  // Service operations
  const updateService = (regionId: string, countryCode: string, serviceId: string, updates: Partial<Service>) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            countries: region.countries.map(country => {
              if (country.code === countryCode) {
                return {
                  ...country,
                  services: country.services.map(service => 
                    service.id === serviceId 
                      ? { ...service, ...updates, id: serviceId } 
                      : service
                  )
                };
              }
              return country;
            })
          };
        }
        return region;
      })
    );
  };

  const addService = (regionId: string, countryCode: string, newService: Service) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            countries: region.countries.map(country => {
              if (country.code === countryCode) {
                // Ensure we don't duplicate service IDs within a country
                if (country.services.some(s => s.id === newService.id)) {
                  setError(`Service with ID "${newService.id}" already exists in this country`);
                  return country;
                }
                
                return {
                  ...country,
                  services: [...country.services, newService]
                };
              }
              return country;
            })
          };
        }
        return region;
      })
    );
  };

  const deleteService = (regionId: string, countryCode: string, serviceId: string) => {
    if (!canEdit) {
      setError('You do not have permission to edit pricing data');
      return;
    }
    
    setPricingData(prevData => 
      prevData.map(region => {
        if (region.id === regionId) {
          return {
            ...region,
            countries: region.countries.map(country => {
              if (country.code === countryCode) {
                return {
                  ...country,
                  services: country.services.filter(service => service.id !== serviceId)
                };
              }
              return country;
            })
          };
        }
        return region;
      })
    );
  };

  // Context value
  const contextValue: PricingDataContextType = {
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
  };

  return (
    <PricingDataContext.Provider value={contextValue}>
      {children}
    </PricingDataContext.Provider>
  );
};

// Custom hook for using pricing data context
export const usePricingData = (): PricingDataContextType => {
  const context = useContext(PricingDataContext);
  if (context === undefined) {
    throw new Error('usePricingData must be used within a PricingDataProvider');
  }
  return context;
};
