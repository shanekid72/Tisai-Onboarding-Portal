import { Region } from '../context/PricingDataContext';

// Export the default pricing data from PricingProposalPage
export const defaultPricingData: Region[] = [
  {
    id: 'europe',
    name: 'Europe',
    countries: [
      { 
        code: 'GB', 
        name: 'United Kingdom',
        services: [
          { 
            id: 'bank-payout-gb-fps', 
            name: 'Faster Payments', 
            type: 'bank-payout',
            currency: 'GBP',
            coverage: 'All UK banks',
            transactionLimit: {
              min: 1,
              max: 250000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 0,
              currency: 'GBP'
            }
          },
          { 
            id: 'bank-payout-gb-bacs', 
            name: 'BACS', 
            type: 'bank-payout',
            currency: 'GBP',
            coverage: 'All UK banks',
            transactionLimit: {
              min: 1,
              max: 1000000
            },
            tat: 'T+3',
            feeStructure: {
              fixed: 0.15,
              percentage: 0,
              currency: 'GBP'
            }
          }
        ]
      },
      { 
        code: 'DE', 
        name: 'Germany',
        services: [
          { 
            id: 'bank-payout-de-sepa', 
            name: 'SEPA Credit Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA-enabled banks',
            transactionLimit: {
              min: 0.01,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.25,
              percentage: 0,
              currency: 'EUR'
            }
          },
          { 
            id: 'bank-payout-de-instant', 
            name: 'SEPA Instant', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'Participating SEPA banks',
            transactionLimit: {
              min: 0.01,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'EUR'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'north-america',
    name: 'North America',
    countries: [
      { 
        code: 'US', 
        name: 'United States',
        services: [
          { 
            id: 'bank-payout-us-ach', 
            name: 'ACH', 
            type: 'bank-payout',
            currency: 'USD',
            coverage: 'All US banks',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.25,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-us-wire', 
            name: 'Wire Transfer', 
            type: 'bank-payout',
            currency: 'USD',
            coverage: 'All US banks',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 5.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-us-paypal', 
            name: 'PayPal', 
            type: 'wallet-payout',
            currency: 'USD',
            coverage: 'All PayPal users',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.9,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'CA', 
        name: 'Canada',
        services: [
          { 
            id: 'bank-payout-ca-eft', 
            name: 'EFT', 
            type: 'bank-payout',
            currency: 'CAD',
            coverage: 'All Canadian banks',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.30,
              percentage: 0,
              currency: 'CAD'
            }
          },
          { 
            id: 'bank-payout-ca-interac', 
            name: 'Interac e-Transfer', 
            type: 'bank-payout',
            currency: 'CAD',
            coverage: 'All Canadian banks',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'CAD'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'asia',
    name: 'Asia',
    countries: [
      { 
        code: 'IN', 
        name: 'India',
        services: [
          { 
            id: 'bank-payout-in-imps', 
            name: 'IMPS', 
            type: 'bank-payout',
            currency: 'INR',
            coverage: 'All Indian banks',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 5.00,
              percentage: 0,
              currency: 'INR'
            }
          },
          { 
            id: 'bank-payout-in-neft', 
            name: 'NEFT', 
            type: 'bank-payout',
            currency: 'INR',
            coverage: 'All Indian banks',
            transactionLimit: {
              min: 1,
              max: 1000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 2.50,
              percentage: 0,
              currency: 'INR'
            }
          },
          { 
            id: 'wallet-payout-in-paytm', 
            name: 'Paytm', 
            type: 'wallet-payout',
            currency: 'INR',
            coverage: 'All Paytm users',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 2.00,
              percentage: 0.5,
              currency: 'INR'
            }
          }
        ]
      },
      { 
        code: 'SG', 
        name: 'Singapore',
        services: [
          { 
            id: 'bank-payout-sg-fast', 
            name: 'FAST', 
            type: 'bank-payout',
            currency: 'SGD',
            coverage: 'All Singapore banks',
            transactionLimit: {
              min: 0.01,
              max: 200000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'SGD'
            }
          },
          { 
            id: 'bank-payout-sg-giro', 
            name: 'GIRO', 
            type: 'bank-payout',
            currency: 'SGD',
            coverage: 'All Singapore banks',
            transactionLimit: {
              min: 0.01,
              max: 1000000
            },
            tat: 'T+2',
            feeStructure: {
              fixed: 0.20,
              percentage: 0,
              currency: 'SGD'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'africa',
    name: 'Africa',
    countries: [
      { 
        code: 'NG', 
        name: 'Nigeria',
        services: [
          { 
            id: 'bank-payout-ng', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'NGN',
            coverage: 'All Nigerian banks',
            transactionLimit: {
              min: 1000,
              max: 10000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'mobile-money-ng', 
            name: 'Mobile Money', 
            type: 'mobile-money',
            currency: 'NGN',
            coverage: 'All major telcos',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.80,
              percentage: 1.2,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'KE', 
        name: 'Kenya',
        services: [
          { 
            id: 'bank-payout-ke', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'KES',
            coverage: 'All Kenyan banks',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'mobile-money-ke-mpesa', 
            name: 'M-Pesa', 
            type: 'mobile-money',
            currency: 'KES',
            coverage: 'All M-Pesa users',
            transactionLimit: {
              min: 10,
              max: 300000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 1.0,
              currency: 'USD'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'south-america',
    name: 'South America',
    countries: [
      { 
        code: 'BR', 
        name: 'Brazil',
        services: [
          { 
            id: 'bank-payout-br-ted', 
            name: 'TED', 
            type: 'bank-payout',
            currency: 'BRL',
            coverage: 'All Brazilian banks',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-br-pix', 
            name: 'PIX', 
            type: 'bank-payout',
            currency: 'BRL',
            coverage: 'All PIX participants',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'CO', 
        name: 'Colombia',
        services: [
          { 
            id: 'bank-payout-co', 
            name: 'PSE', 
            type: 'bank-payout',
            currency: 'COP',
            coverage: 'All Colombian banks',
            transactionLimit: {
              min: 1000,
              max: 50000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'oceania',
    name: 'Oceania',
    countries: [
      { 
        code: 'AU', 
        name: 'Australia',
        services: [
          { 
            id: 'bank-payout-au-direct-entry', 
            name: 'Direct Entry', 
            type: 'bank-payout',
            currency: 'AUD',
            coverage: 'All Australian banks',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.30,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-au-payid', 
            name: 'PayID', 
            type: 'bank-payout',
            currency: 'AUD',
            coverage: 'All PayID-enabled banks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-au-bpay', 
            name: 'BPAY', 
            type: 'bank-payout',
            currency: 'AUD',
            coverage: 'All BPAY billers',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.40,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'NZ', 
        name: 'New Zealand',
        services: [
          { 
            id: 'bank-payout-nz', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'NZD',
            coverage: 'All New Zealand banks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 0.30,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      }
    ]
  }
];
