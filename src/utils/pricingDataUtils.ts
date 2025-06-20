/**
 * Utility functions for processing pricing data
 */

// Define the types for our pricing data structure
export interface PricingCoverage {
  coverage: string;
  currency: string;
  txnLimit: number;
  tat: string;
  fee: number;
}

export interface PricingData {
  [region: string]: {
    [country: string]: {
      [serviceType: string]: PricingCoverage[];
    };
  };
}

/**
 * Transform raw pricing data from Excel/JSON format to a structured nested object
 */
export function transformPricingData(rawData: any): PricingData {
  const data: PricingData = {};
  
  if (!rawData || !rawData.P2P || !Array.isArray(rawData.P2P)) {
    console.error("Invalid pricing data format");
    return data;
  }
  
  // Skip first two rows (headers)
  const rows = rawData.P2P.slice(2);
  
  let currentRegion = '';
  let currentCountry = '';
  
  rows.forEach((row: Record<string, any>) => {
    // Extract values from row
    const region = row["Unnamed: 1"] || currentRegion;
    const country = row["Unnamed: 2"] || currentCountry;
    const currency = row["Unnamed: 3"];
    const serviceType = row["Unnamed: 4"]?.replace("\n", " ")?.trim();
    const coverage = row["Unnamed: 5"];
    const txnLimit = row["Unnamed: 6"];
    const tat = row["Unnamed: 7"];
    const fee = row["Unnamed: 8"];
    
    // Skip if missing essential fields
    if (!region || !country || !serviceType || !coverage) return;
    
    // Update current region/country for rows with empty values
    currentRegion = region;
    currentCountry = country;
    
    // Create nested structure
    if (!data[region]) {
      data[region] = {};
    }
    
    if (!data[region][country]) {
      data[region][country] = {};
    }
    
    if (!data[region][country][serviceType]) {
      data[region][country][serviceType] = [];
    }
    
    // Add coverage details
    data[region][country][serviceType].push({
      coverage,
      currency,
      txnLimit,
      tat,
      fee
    });
  });
  
  return data;
}

// Mock pricing data for development/testing
export const mockPricingData: PricingData = {
  "Africa": {
    "Nigeria": {
      "Bank payout": [
        {
          coverage: "All Banks",
          currency: "NGN",
          txnLimit: 10000000,
          tat: "T+1",
          fee: 2.5
        }
      ],
      "Wallet payout": [
        {
          coverage: "MTN",
          currency: "NGN",
          txnLimit: 500000,
          tat: "Real Time",
          fee: 1.75
        },
        {
          coverage: "Airtel",
          currency: "NGN",
          txnLimit: 400000,
          tat: "Real Time",
          fee: 1.85
        }
      ]
    },
    "Kenya": {
      "Bank payout": [
        {
          coverage: "All Banks",
          currency: "KES",
          txnLimit: 5000000,
          tat: "T+1",
          fee: 2.2
        }
      ],
      "Mobile Money": [
        {
          coverage: "M-Pesa",
          currency: "KES",
          txnLimit: 300000,
          tat: "Real Time",
          fee: 1.9
        }
      ]
    }
  },
  "Americas": {
    "USA": {
      "Bank payout": [
        {
          coverage: "ACH",
          currency: "USD",
          txnLimit: 100000,
          tat: "T+1",
          fee: 1.5
        },
        {
          coverage: "Wire",
          currency: "USD",
          txnLimit: 1000000,
          tat: "Real Time",
          fee: 3.5
        }
      ]
    },
    "Mexico": {
      "Bank payout": [
        {
          coverage: "SPEI",
          currency: "MXN",
          txnLimit: 800000,
          tat: "Real Time",
          fee: 2.0
        }
      ]
    }
  },
  "Europe": {
    "United Kingdom": {
      "Bank payout": [
        {
          coverage: "Faster Payments",
          currency: "GBP",
          txnLimit: 250000,
          tat: "Real Time",
          fee: 1.8
        },
        {
          coverage: "CHAPS",
          currency: "GBP",
          txnLimit: 1000000,
          tat: "Same Day",
          fee: 3.0
        }
      ]
    },
    "Germany": {
      "Bank payout": [
        {
          coverage: "SEPA",
          currency: "EUR",
          txnLimit: 500000,
          tat: "T+1",
          fee: 1.7
        },
        {
          coverage: "SEPA Instant",
          currency: "EUR",
          txnLimit: 100000,
          tat: "Real Time",
          fee: 2.8
        }
      ]
    }
  },
  "Asia Pacific": {
    "India": {
      "Bank payout": [
        {
          coverage: "IMPS",
          currency: "INR",
          txnLimit: 500000,
          tat: "Real Time",
          fee: 1.95
        },
        {
          coverage: "NEFT",
          currency: "INR",
          txnLimit: 1000000,
          tat: "T+1",
          fee: 1.5
        }
      ],
      "Wallet payout": [
        {
          coverage: "Paytm",
          currency: "INR",
          txnLimit: 100000,
          tat: "Real Time",
          fee: 2.1
        },
        {
          coverage: "PhonePe",
          currency: "INR",
          txnLimit: 100000,
          tat: "Real Time",
          fee: 2.2
        }
      ]
    },
    "Singapore": {
      "Bank payout": [
        {
          coverage: "FAST",
          currency: "SGD",
          txnLimit: 200000,
          tat: "Real Time",
          fee: 1.9
        }
      ]
    }
  }
};

// Function to get all regions
export function getRegions(data: PricingData): string[] {
  return Object.keys(data);
}

// Function to get countries for a specific region
export function getCountriesForRegion(data: PricingData, region: string): string[] {
  if (!region || !data[region]) {
    return [];
  }
  return Object.keys(data[region]);
}

// Function to get services for a specific region and country
export function getServicesForCountry(data: PricingData, region: string, country: string): string[] {
  if (!region || !country || !data[region] || !data[region][country]) {
    return [];
  }
  return Object.keys(data[region][country]);
}

// Function to get coverage options for a specific region, country, and service
export function getCoverageForService(data: PricingData, region: string, country: string, service: string): PricingCoverage[] {
  if (!region || !country || !service || 
      !data[region] || !data[region][country] || !data[region][country][service]) {
    return [];
  }
  return data[region][country][service];
}
