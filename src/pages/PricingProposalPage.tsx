import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingProposalPage.css';

// Define default values to avoid TypeScript errors
const defaultTransactionLimit = {
  min: 0,
  max: 10000
};

const defaultFeeStructure = {
  fixed: 0,
  percentage: 0,
  currency: 'USD'
};

// Define detailed types for our data structures
type Region = {
  id: string;
  name: string;
  countries: Country[];
};

type Country = {
  code: string;
  name: string;
  services: Service[];
};

type Service = {
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

type Selection = {
  regionIds: string[];
  countryIds: string[];
  serviceIds: string[];
};

// Helper function to add default values to services that don't have all required fields
const enrichService = (service: Partial<Service>): Service => {
  return {
    id: service.id || '',
    name: service.name || '',
    type: service.type || 'bank-payout',
    currency: service.currency || 'USD',
    coverage: service.coverage || 'Selected banks',
    transactionLimit: service.transactionLimit || { min: 1000, max: 10000 },
    tat: service.tat || 'T+1',
    feeStructure: service.feeStructure || { fixed: 2.0, percentage: 0, currency: 'USD' }
  };
};

// Comprehensive data with all 6 regions
const pricingData: Region[] = [
  {
    id: 'africa',
    name: 'Africa',
    countries: [
      { 
        code: 'NG', 
        name: 'Nigeria',
        services: [
          { 
            id: 'bank-credit-ng', 
            name: 'Bank Credit', 
            type: 'bank-payout',
            currency: 'NGN',
            coverage: 'All Banks',
            transactionLimit: {
              min: 1000,
              max: 20000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
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
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'KES',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 1000000
            },
            tat: 'Same Day/T+1 (Cutoff: 1400 hours EAT)',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ke', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'KES',
            coverage: 'Airtel, M-Pesa',
            transactionLimit: {
              min: 1000,
              max: 150000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'ZA', 
        name: 'South Africa',
        services: [
          { 
            id: 'bank-payout-za', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'ZAR',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 300000
            },
            tat: 'Same Day/T+1 (Cutoff: 1400 hours GMT+2)',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'GH', 
        name: 'Ghana',
        services: [
          { 
            id: 'bank-payout-gh', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'GHS',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 150000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-gh', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'GHS',
            coverage: 'MTN, Airtel-Tigo, Vodafone',
            transactionLimit: {
              min: 1000,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'EG', 
        name: 'Egypt',
        services: [
          { 
            id: 'bank-payout-eg', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'EGP/USD',
            coverage: 'All Banks',
            transactionLimit: {
              min: 1000,
              max: 182500
            },
            tat: 'Same Day/T+1 after bank cut-off time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-eg', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'EGP',
            coverage: 'Vodafone, Orange, Etisalat, WE',
            transactionLimit: {
              min: 1000,
              max: 30000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'ET', 
        name: 'Ethiopia',
        services: [
          { 
            id: 'bank-payout-et', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'ETB',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 1000000000
            },
            tat: 'Same Day/T+1 (Cutoff: 1600 hours EAT)',
            feeStructure: {
              fixed: 1.70,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'CD', 
        name: 'DRC',
        services: [
          { 
            id: 'wallet-payout-cd', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'USD',
            coverage: 'Airtel',
            transactionLimit: {
              min: 1,
              max: 1000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'TZ', 
        name: 'Tanzania',
        services: [
          { 
            id: 'bank-payout-tz', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'TZS',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 10000000
            },
            tat: 'Same Day/T+1 (Cutoff: 1400 hours EAT)',
            feeStructure: {
              fixed: 1.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-tz', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'TZS',
            coverage: 'Airtel, Vodacom, Tigo',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.70,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'MA', 
        name: 'Morocco',
        services: [
          { 
            id: 'bank-payout-ma', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'MAD',
            coverage: 'All Banks',
            transactionLimit: {
              min: 1000,
              max: 80000
            },
            tat: 'Attijariwafa Bank: Same day, Others: T+1 (cutoff: 3PM local)',
            feeStructure: {
              fixed: 2.10,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'UG', 
        name: 'Uganda',
        services: [
          { 
            id: 'bank-payout-ug', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'UGX',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 20000000
            },
            tat: 'Same Day/T+1 (Cutoff: 1400 hours EAT)',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ug', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'UGX',
            coverage: 'MTN, Airtel',
            transactionLimit: {
              min: 1000,
              max: 7000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'DZ', 
        name: 'Algeria',
        services: [
          { 
            id: 'bank-payout-dz', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'DZD',
            coverage: 'Selected banks',
            transactionLimit: {
              min: 1000,
              max: 200000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SD', 
        name: 'Sudan',
        services: [
          { 
            id: 'bank-payout-sd', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'SDG',
            coverage: 'Selected banks',
            transactionLimit: {
              min: 1000,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'AO', 
        name: 'Angola',
        services: [
          { 
            id: 'bank-payout-ao', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'AOA',
            coverage: 'Selected banks',
            transactionLimit: {
              min: 1000,
              max: 500000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'MZ', 
        name: 'Mozambique',
        services: [
          { 
            id: 'wallet-payout-mz', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'MZN',
            coverage: 'Mkesh, M-Pesa',
            transactionLimit: {
              min: 1000,
              max: 25000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'CI', 
        name: 'Ivory Coast',
        services: [
          { 
            id: 'bank-payout-ci', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'XOF',
            coverage: 'UBA Bank',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ci', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'Orange, MTN, Moov',
            transactionLimit: {
              min: 1000,
              max: 1500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'CM', 
        name: 'Cameroon',
        services: [
          { 
            id: 'bank-payout-cm', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'XAF',
            coverage: 'UBA Bank',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-cm', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XAF',
            coverage: 'MTN, Orange',
            transactionLimit: {
              min: 1000,
              max: 1000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'MG', 
        name: 'Madagascar',
        services: [
          { 
            id: 'wallet-payout-mg', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'MGA',
            coverage: 'Airtel',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SN', 
        name: 'Senegal',
        services: [
          { 
            id: 'wallet-payout-sn', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'Orange, Tigo',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 2.10,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'ML', 
        name: 'Mali',
        services: [
          { 
            id: 'wallet-payout-ml', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'Orange, Malitel',
            transactionLimit: {
              min: 1000,
              max: 2000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'BF', 
        name: 'Burkina Faso',
        services: [
          { 
            id: 'bank-payout-bf', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'XOF',
            coverage: 'UBA Bank',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-bf', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'Orange, Onatel',
            transactionLimit: {
              min: 1000,
              max: 2000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'ZW', 
        name: 'Zimbabwe',
        services: [
          { 
            id: 'wallet-payout-zw', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'USD',
            coverage: 'Ecocash',
            transactionLimit: {
              min: 1,
              max: 2000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.02,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'RW', 
        name: 'Rwanda',
        services: [
          { 
            id: 'bank-payout-rw', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'RWF',
            coverage: 'All banks',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'Same Day/T+1 (Cutoff: 1400 hours EAT)',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-rw', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'RWF',
            coverage: 'MTN, Airtel-Tigo',
            transactionLimit: {
              min: 1000,
              max: 2000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'NE', 
        name: 'Niger',
        services: [
          { 
            id: 'wallet-payout-ne', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'Orange Money',
            transactionLimit: {
              min: 1000,
              max: 1500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'TN', 
        name: 'Tunisia',
        services: [
          { 
            id: 'bank-payout-tn', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'TND',
            coverage: 'Selected banks',
            transactionLimit: {
              min: 1000,
              max: 15000
            },
            tat: 'T+2',
            feeStructure: {
              fixed: 2.10,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'BJ', 
        name: 'Benin',
        services: [
          { 
            id: 'bank-payout-bj', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'XOF',
            coverage: 'via UBA bank',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-bj', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XOF',
            coverage: 'via MTN',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          },
        ]
      },
      { 
        code: 'ZM', 
        name: 'Zambia',
        services: [
          { 
            id: 'wallet-payout-zm', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'ZMW',
            coverage: 'Airtel, MTN',
            transactionLimit: {
              min: 1000,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SS', 
        name: 'South Sudan',
        services: [
          { 
            id: 'wallet-payout-ss', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'SSP',
            coverage: 'MTN',
            transactionLimit: {
              min: 100,
              max: 300000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'LY', 
        name: 'Libya',
        services: [
          { 
            id: 'bank-payout-ly', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'LYD',
            coverage: 'Selected banks',
            transactionLimit: {
              min: 100,
              max: 10000
            },
            tat: 'T+2',
            feeStructure: {
              fixed: 2.10,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'MW', 
        name: 'Malawi',
        services: [
          { 
            id: 'wallet-payout-mw', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'MWK',
            coverage: 'Airtel, TNM',
            transactionLimit: {
              min: 5000,
              max: 750000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'TD', 
        name: 'Chad',
        services: [
          { 
            id: 'wallet-payout-td', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'XAF',
            coverage: 'Airtel, Tigo',
            transactionLimit: {
              min: 1000,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.90,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SO', 
        name: 'Somalia',
        services: [
          { 
            id: 'wallet-payout-so', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'USD',
            coverage: 'Hormuud, Telesom, Somtel',
            transactionLimit: {
              min: 1,
              max: 500
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SL', 
        name: 'Sierra Leone',
        services: [
          { 
            id: 'wallet-payout-sl', 
            name: 'Wallet Payout', 
            type: 'wallet-payout',
            currency: 'SLL',
            coverage: 'Orange',
            transactionLimit: {
              min: 10000,
              max: 5000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
    ]
  },
  {
    id: 'europe',
    name: 'Europe',
    countries: [
      { 
        code: 'GB', 
        name: 'United Kingdom',
        services: [
          { 
            id: 'bank-payout-gb-fp', 
            name: 'Faster Payments', 
            type: 'bank-payout',
            currency: 'GBP',
            coverage: 'All UK banks',
            transactionLimit: {
              min: 1,
              max: 25000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-gb', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'GBP',
            coverage: 'All UK banks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.30,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-gb', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'GBP',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.20,
              percentage: 2.5,
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
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-de-giropay', 
            name: 'Giropay', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All German banks',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-de', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'FR', 
        name: 'France',
        services: [
          { 
            id: 'bank-payout-fr-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-fr-cb', 
            name: 'Cartes Bancaires', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All French banks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.0,
              currency: 'EUR'
            }
          },
          { 
            id: 'card-payment-fr', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'IT', 
        name: 'Italy',
        services: [
          { 
            id: 'bank-payout-it-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-it-mybank', 
            name: 'MyBank', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'MyBank participating banks',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-it', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'ES', 
        name: 'Spain',
        services: [
          { 
            id: 'bank-payout-es-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-es-bizum', 
            name: 'Bizum', 
            type: 'wallet-payout',
            currency: 'EUR',
            coverage: 'All Spanish banks',
            transactionLimit: {
              min: 1,
              max: 1000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-es', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'NL', 
        name: 'Netherlands',
        services: [
          enrichService({ id: 'sepa-nl', name: 'SEPA Transfer', type: 'bank-payout', currency: 'EUR' }),
          enrichService({ id: 'ideal-nl', name: 'iDEAL', type: 'bank-payout', currency: 'EUR' }),
          enrichService({ id: 'credit-card-nl', name: 'Credit Card', type: 'card-payment', currency: 'EUR' }),
        ]
      },
      { 
        code: 'SE', 
        name: 'Sweden',
        services: [
          { 
            id: 'bank-payout-se-bankgirot', 
            name: 'Bankgirot', 
            type: 'bank-payout',
            currency: 'SEK',
            coverage: 'All Swedish banks',
            transactionLimit: {
              min: 10,
              max: 500000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-se-swish', 
            name: 'Swish', 
            type: 'wallet-payout',
            currency: 'SEK',
            coverage: 'All Swedish banks',
            transactionLimit: {
              min: 1,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-se', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'SEK',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'SEK'
            }
          }
        ]
      },
      { 
        code: 'PL', 
        name: 'Poland',
        services: [
          { 
            id: 'bank-payout-pl-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'PLN',
            coverage: 'All Polish banks',
            transactionLimit: {
              min: 5,
              max: 200000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-pl-blik', 
            name: 'BLIK', 
            type: 'wallet-payout',
            currency: 'PLN',
            coverage: 'All Polish banks',
            transactionLimit: {
              min: 5,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-pl', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'PLN',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 5,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'PLN'
            }
          }
        ]
      },
      { 
        code: 'CH', 
        name: 'Switzerland',
        services: [
          { 
            id: 'bank-payout-ch', 
            name: 'Bank Payout', 
            type: 'bank-payout',
            currency: 'CHF',
            coverage: 'All Swiss banks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ch-twint', 
            name: 'TWINT', 
            type: 'wallet-payout',
            currency: 'CHF',
            coverage: 'All Swiss banks with TWINT',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-ch', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'CHF',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'CHF'
            }
          }
        ]
      },
      { 
        code: 'PT', 
        name: 'Portugal',
        services: [
          { 
            id: 'bank-payout-pt-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-pt-multibanco', 
            name: 'Multibanco', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All Portuguese banks',
            transactionLimit: {
              min: 1,
              max: 10000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-pt', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'IE', 
        name: 'Ireland',
        services: [
          { 
            id: 'bank-payout-ie-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-ie', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'BE', 
        name: 'Belgium',
        services: [
          { 
            id: 'bank-payout-be-sepa', 
            name: 'SEPA Transfer', 
            type: 'bank-payout',
            currency: 'EUR',
            coverage: 'All SEPA countries',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-be-bancontact', 
            name: 'Bancontact', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All Belgian banks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.20,
              percentage: 1.5,
              currency: 'EUR'
            }
          },
          { 
            id: 'card-payment-be', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'EUR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'EUR'
            }
          }
        ]
      },
      { 
        code: 'NO', 
        name: 'Norway',
        services: [
          enrichService({ id: 'vipps-no', name: 'Vipps', type: 'mobile-money', currency: 'NOK' }),
          enrichService({ id: 'credit-card-no', name: 'Credit Card', type: 'card-payment', currency: 'NOK' }),
        ]
      },
      { 
        code: 'RO', 
        name: 'Romania',
        services: [
          enrichService({ id: 'sepa-ro', name: 'SEPA Transfer', type: 'bank-payout', currency: 'RON' }),
          enrichService({ id: 'credit-card-ro', name: 'Credit Card', type: 'card-payment', currency: 'RON' }),
        ]
      },
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
            name: 'ACH Transfer', 
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
              min: 1,
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
            id: 'bank-payout-us-rtp', 
            name: 'RTP', 
            type: 'bank-payout',
            currency: 'USD',
            coverage: 'RTP-enabled banks',
            transactionLimit: {
              min: 1,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-us-zelle', 
            name: 'Zelle', 
            type: 'bank-payout',
            currency: 'USD',
            coverage: 'Zelle-enabled banks',
            transactionLimit: {
              min: 1,
              max: 5000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-us', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'USD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 50000
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
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-ca-eft', 
            name: 'EFT', 
            type: 'bank-payout',
            currency: 'CAD',
            coverage: 'All Canadian banks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-ca', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'CAD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 25000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.8,
              currency: 'CAD'
            }
          }
        ]
      },
      { 
        code: 'MX', 
        name: 'Mexico',
        services: [
          { 
            id: 'bank-payout-mx-spei', 
            name: 'SPEI', 
            type: 'bank-payout',
            currency: 'MXN',
            coverage: 'All Mexican banks',
            transactionLimit: {
              min: 10,
              max: 1000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 0.75,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-mx-oxxo', 
            name: 'OXXO', 
            type: 'wallet-payout',
            currency: 'MXN',
            coverage: 'All OXXO locations',
            transactionLimit: {
              min: 10,
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-mx', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'MXN',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.8,
              currency: 'MXN'
            }
          }
        ]
      },
      { 
        code: 'PR', 
        name: 'Puerto Rico',
        services: [
          enrichService({ id: 'ach-pr', name: 'ACH Transfer', type: 'bank-payout', currency: 'USD' }),
          enrichService({ id: 'credit-card-pr', name: 'Credit Card', type: 'card-payment', currency: 'USD' }),
        ]
      },
      { 
        code: 'PA', 
        name: 'Panama',
        services: [
          enrichService({ id: 'ach-pa', name: 'ACH Transfer', type: 'bank-payout', currency: 'PAB' }),
          enrichService({ id: 'credit-card-pa', name: 'Credit Card', type: 'card-payment', currency: 'PAB' }),
        ]
      },
      { 
        code: 'CR', 
        name: 'Costa Rica',
        services: [
          enrichService({ id: 'sinpe-cr', name: 'SINPE', type: 'bank-payout', currency: 'CRC' }),
          enrichService({ id: 'credit-card-cr', name: 'Credit Card', type: 'card-payment', currency: 'CRC' }),
        ]
      },
      { 
        code: 'GT', 
        name: 'Guatemala',
        services: [
          enrichService({ id: 'bank-transfer-gt', name: 'Bank Transfer', type: 'bank-payout', currency: 'GTQ' }),
          enrichService({ id: 'credit-card-gt', name: 'Credit Card', type: 'card-payment', currency: 'GTQ' }),
        ]
      },
      { 
        code: 'DO', 
        name: 'Dominican Republic',
        services: [
          enrichService({ id: 'bank-transfer-do', name: 'Bank Transfer', type: 'bank-payout', currency: 'DOP' }),
          enrichService({ id: 'credit-card-do', name: 'Credit Card', type: 'card-payment', currency: 'DOP' }),
        ]
      },
      { 
        code: 'HN', 
        name: 'Honduras',
        services: [
          enrichService({ id: 'bank-transfer-hn', name: 'Bank Transfer', type: 'bank-payout', currency: 'HNL' }),
        ]
      },
      { 
        code: 'JM', 
        name: 'Jamaica',
        services: [
          enrichService({ id: 'bank-transfer-jm', name: 'Bank Transfer', type: 'bank-payout', currency: 'JMD' }),
        ]
      },
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
            id: 'bank-payout-br-pix', 
            name: 'PIX', 
            type: 'bank-payout',
            currency: 'BRL',
            coverage: 'All Brazilian banks',
            transactionLimit: {
              min: 1,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-br-ted', 
            name: 'TED Transfer', 
            type: 'bank-payout',
            currency: 'BRL',
            coverage: 'All Brazilian banks',
            transactionLimit: {
              min: 1,
              max: 1000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-br-boleto', 
            name: 'Boleto', 
            type: 'bank-payout',
            currency: 'BRL',
            coverage: 'All Brazilian banks',
            transactionLimit: {
              min: 5,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-br', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'BRL',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 5,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.2,
              currency: 'BRL'
            }
          }
        ]
      },
      { 
        code: 'CO', 
        name: 'Colombia',
        services: [
          { 
            id: 'bank-payout-co-pse', 
            name: 'PSE', 
            type: 'bank-payout',
            currency: 'COP',
            coverage: 'All Colombian banks',
            transactionLimit: {
              min: 5000,
              max: 50000000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 0.70,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-co-efecty', 
            name: 'Efecty', 
            type: 'wallet-payout',
            currency: 'COP',
            coverage: 'All Efecty locations',
            transactionLimit: {
              min: 5000,
              max: 10000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-co', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'COP',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 5000,
              max: 20000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.0,
              currency: 'COP'
            }
          }
        ]
      },
      { 
        code: 'AR', 
        name: 'Argentina',
        services: [
          { 
            id: 'bank-payout-ar', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'ARS',
            coverage: 'All Argentine banks',
            transactionLimit: {
              min: 100,
              max: 10000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.85,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-ar-rapipago', 
            name: 'Rapipago', 
            type: 'wallet-payout',
            currency: 'ARS',
            coverage: 'All Rapipago locations',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-ar-pagofacil', 
            name: 'Pago Fácil', 
            type: 'wallet-payout',
            currency: 'ARS',
            coverage: 'All Pago Fácil locations',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-ar', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'ARS',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 100,
              max: 5000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.5,
              currency: 'ARS'
            }
          }
        ]
      },
      { 
        code: 'PE', 
        name: 'Peru',
        services: [
          { 
            id: 'bank-payout-pe-bcp', 
            name: 'BCP Transfer', 
            type: 'bank-payout',
            currency: 'PEN',
            coverage: 'All Peruvian banks',
            transactionLimit: {
              min: 10,
              max: 200000
            },
            tat: 'Same Day',
            feeStructure: {
              fixed: 0.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-pe-yape', 
            name: 'Yape', 
            type: 'wallet-payout',
            currency: 'PEN',
            coverage: 'All Yape users',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-pe', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'PEN',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.2,
              currency: 'PEN'
            }
          }
        ]
      },
      { 
        code: 'CL', 
        name: 'Chile',
        services: [
          { 
            id: 'bank-payout-cl', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'CLP',
            coverage: 'All Chilean banks',
            transactionLimit: {
              min: 1000,
              max: 50000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-cl-webpay', 
            name: 'WebPay', 
            type: 'bank-payout',
            currency: 'CLP',
            coverage: 'All WebPay users',
            transactionLimit: {
              min: 1000,
              max: 10000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-cl-servipag', 
            name: 'ServiPag', 
            type: 'wallet-payout',
            currency: 'CLP',
            coverage: 'All ServiPag locations',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-cl', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'CLP',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1000,
              max: 10000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.0,
              currency: 'CLP'
            }
          }
        ]
      },
      { 
        code: 'VE', 
        name: 'Venezuela',
        services: [
          enrichService({ id: 'bank-transfer-ve', name: 'Bank Transfer', type: 'bank-payout', currency: 'VEF' }),
        ]
      },
      { 
        code: 'EC', 
        name: 'Ecuador',
        services: [
          enrichService({ id: 'bank-transfer-ec', name: 'Bank Transfer', type: 'bank-payout', currency: 'USD' }),
          enrichService({ id: 'credit-card-ec', name: 'Credit Card', type: 'card-payment', currency: 'USD' }),
        ]
      },
      { 
        code: 'BO', 
        name: 'Bolivia',
        services: [
          enrichService({ id: 'bank-transfer-bo', name: 'Bank Transfer', type: 'bank-payout', currency: 'BOB' }),
        ]
      },
      { 
        code: 'UY', 
        name: 'Uruguay',
        services: [
          enrichService({ id: 'redpagos-uy', name: 'RedPagos', type: 'bank-payout', currency: 'UYU' }),
          enrichService({ id: 'credit-card-uy', name: 'Credit Card', type: 'card-payment', currency: 'UYU' }),
        ]
      },
      { 
        code: 'PY', 
        name: 'Paraguay',
        services: [
          enrichService({ id: 'bank-transfer-py', name: 'Bank Transfer', type: 'bank-payout', currency: 'PYG' }),
        ]
      },
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
            id: 'bank-payout-in-upi', 
            name: 'UPI', 
            type: 'bank-payout',
            currency: 'INR',
            coverage: 'All UPI-enabled banks',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-in-netbanking', 
            name: 'Netbanking', 
            type: 'bank-payout',
            currency: 'INR',
            coverage: 'All major Indian banks',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-in-paytm', 
            name: 'Paytm', 
            type: 'wallet-payout',
            currency: 'INR',
            coverage: 'All Paytm users',
            transactionLimit: {
              min: 100,
              max: 200000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-in', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'INR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 100,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.0,
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
            id: 'bank-payout-sg-paynow', 
            name: 'PayNow', 
            type: 'bank-payout',
            currency: 'SGD',
            coverage: 'All Singaporean banks',
            transactionLimit: {
              min: 1,
              max: 200000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-sg-giro', 
            name: 'GIRO', 
            type: 'bank-payout',
            currency: 'SGD',
            coverage: 'All Singaporean banks',
            transactionLimit: {
              min: 1,
              max: 500000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-sg', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'SGD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.8,
              currency: 'SGD'
            }
          }
        ]
      },
      { 
        code: 'JP', 
        name: 'Japan',
        services: [
          { 
            id: 'bank-payout-jp', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'JPY',
            coverage: 'All Japanese banks',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-jp-konbini', 
            name: 'Konbini', 
            type: 'bank-payout',
            currency: 'JPY',
            coverage: 'All major convenience stores',
            transactionLimit: {
              min: 100,
              max: 300000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-jp-paypay', 
            name: 'PayPay', 
            type: 'wallet-payout',
            currency: 'JPY',
            coverage: 'All PayPay users',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-jp', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'JPY',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.8,
              currency: 'JPY'
            }
          }
        ]
      },
      { 
        code: 'CN', 
        name: 'China',
        services: [
          { 
            id: 'wallet-payout-cn-alipay', 
            name: 'Alipay', 
            type: 'wallet-payout',
            currency: 'CNY',
            coverage: 'All Alipay users',
            transactionLimit: {
              min: 10,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-cn-wechat', 
            name: 'WeChat Pay', 
            type: 'wallet-payout',
            currency: 'CNY',
            coverage: 'All WeChat Pay users',
            transactionLimit: {
              min: 10,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-cn-unionpay', 
            name: 'UnionPay', 
            type: 'card-payment',
            currency: 'CNY',
            coverage: 'All UnionPay cardholders',
            transactionLimit: {
              min: 10,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.25,
              percentage: 2.5,
              currency: 'CNY'
            }
          }
        ]
      },
      { 
        code: 'KR', 
        name: 'South Korea',
        services: [
          { 
            id: 'bank-payout-kr', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'KRW',
            coverage: 'All Korean banks',
            transactionLimit: {
              min: 1000,
              max: 10000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-kr-kakaopay', 
            name: 'KakaoPay', 
            type: 'wallet-payout',
            currency: 'KRW',
            coverage: 'All KakaoPay users',
            transactionLimit: {
              min: 1000,
              max: 2000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-kr-naverpay', 
            name: 'NaverPay', 
            type: 'wallet-payout',
            currency: 'KRW',
            coverage: 'All NaverPay users',
            transactionLimit: {
              min: 1000,
              max: 2000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-kr', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'KRW',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1000,
              max: 5000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.8,
              currency: 'KRW'
            }
          }
        ]
      },
      { 
        code: 'ID', 
        name: 'Indonesia',
        services: [
          { 
            id: 'bank-payout-id', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'IDR',
            coverage: 'All Indonesian banks',
            transactionLimit: {
              min: 10000,
              max: 50000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-id-gopay', 
            name: 'GoPay', 
            type: 'wallet-payout',
            currency: 'IDR',
            coverage: 'All GoPay users',
            transactionLimit: {
              min: 10000,
              max: 10000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-id-ovo', 
            name: 'OVO', 
            type: 'wallet-payout',
            currency: 'IDR',
            coverage: 'All OVO users',
            transactionLimit: {
              min: 10000,
              max: 10000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'TH', 
        name: 'Thailand',
        services: [
          { 
            id: 'bank-payout-th-promptpay', 
            name: 'PromptPay', 
            type: 'bank-payout',
            currency: 'THB',
            coverage: 'All Thai banks',
            transactionLimit: {
              min: 100,
              max: 1000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-th', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'THB',
            coverage: 'All Thai banks',
            transactionLimit: {
              min: 100,
              max: 2000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-th', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'THB',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.5,
              currency: 'THB'
            }
          }
        ]
      },
      { 
        code: 'VN', 
        name: 'Vietnam',
        services: [
          { 
            id: 'bank-payout-vn', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'VND',
            coverage: 'All Vietnamese banks',
            transactionLimit: {
              min: 50000,
              max: 100000000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-vn-momo', 
            name: 'MoMo', 
            type: 'wallet-payout',
            currency: 'VND',
            coverage: 'All MoMo users',
            transactionLimit: {
              min: 50000,
              max: 20000000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.10,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'PH', 
        name: 'Philippines',
        services: [
          { 
            id: 'bank-payout-ph', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'PHP',
            coverage: 'All Philippine banks',
            transactionLimit: {
              min: 100,
              max: 500000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.90,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ph-gcash', 
            name: 'GCash', 
            type: 'wallet-payout',
            currency: 'PHP',
            coverage: 'All GCash users',
            transactionLimit: {
              min: 100,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'wallet-payout-ph-paymaya', 
            name: 'PayMaya', 
            type: 'wallet-payout',
            currency: 'PHP',
            coverage: 'All PayMaya users',
            transactionLimit: {
              min: 100,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'MY', 
        name: 'Malaysia',
        services: [
          { 
            id: 'bank-payout-my', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'MYR',
            coverage: 'All Malaysian banks',
            transactionLimit: {
              min: 10,
              max: 200000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.80,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'bank-payout-my-fpx', 
            name: 'FPX', 
            type: 'bank-payout',
            currency: 'MYR',
            coverage: 'All FPX-enabled banks',
            transactionLimit: {
              min: 10,
              max: 100000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 1.00,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-my', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'MYR',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.5,
              currency: 'MYR'
            }
          }
        ]
      },
      { 
        code: 'AE', 
        name: 'United Arab Emirates',
        services: [
          { 
            id: 'bank-payout-ae', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'AED',
            coverage: 'All UAE banks',
            transactionLimit: {
              min: 10,
              max: 200000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.50,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-ae', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'AED',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.40,
              percentage: 2.8,
              currency: 'AED'
            }
          }
        ]
      },
      { 
        code: 'IL', 
        name: 'Israel',
        services: [
          { 
            id: 'bank-payout-il', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'ILS',
            coverage: 'All Israeli banks',
            transactionLimit: {
              min: 10,
              max: 200000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-il', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'ILS',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.5,
              currency: 'ILS'
            }
          }
        ]
      },
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
          },
          { 
            id: 'payment-au-poli', 
            name: 'POLi', 
            type: 'bank-payout',
            currency: 'AUD',
            coverage: 'All POLi-enabled banks',
            transactionLimit: {
              min: 1,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-au', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'AUD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.0,
              currency: 'AUD'
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
              max: 100000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 0.40,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'payment-nz-poli', 
            name: 'POLi', 
            type: 'bank-payout',
            currency: 'NZD',
            coverage: 'All POLi-enabled banks',
            transactionLimit: {
              min: 1,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.60,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-nz', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'NZD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 1,
              max: 50000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 2.2,
              currency: 'NZD'
            }
          }
        ]
      },
      { 
        code: 'FJ', 
        name: 'Fiji',
        services: [
          { 
            id: 'bank-payout-fj', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'FJD',
            coverage: 'All Fiji banks',
            transactionLimit: {
              min: 5,
              max: 50000
            },
            tat: 'T+1',
            feeStructure: {
              fixed: 1.20,
              percentage: 0,
              currency: 'USD'
            }
          },
          { 
            id: 'card-payment-fj', 
            name: 'Card Payment', 
            type: 'card-payment',
            currency: 'FJD',
            coverage: 'All major card networks',
            transactionLimit: {
              min: 5,
              max: 20000
            },
            tat: 'Real Time',
            feeStructure: {
              fixed: 0.30,
              percentage: 3.0,
              currency: 'FJD'
            }
          }
        ]
      },
      { 
        code: 'PG', 
        name: 'Papua New Guinea',
        services: [
          { 
            id: 'bank-payout-pg', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'PGK',
            coverage: 'Major PNG banks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'T+2',
            feeStructure: {
              fixed: 2.00,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
      { 
        code: 'SB', 
        name: 'Solomon Islands',
        services: [
          { 
            id: 'bank-payout-sb', 
            name: 'Bank Transfer', 
            type: 'bank-payout',
            currency: 'SBD',
            coverage: 'Major Solomon Islands banks',
            transactionLimit: {
              min: 10,
              max: 50000
            },
            tat: 'T+2',
            feeStructure: {
              fixed: 2.50,
              percentage: 0,
              currency: 'USD'
            }
          }
        ]
      },
    ]
  },
];

const PricingProposalPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize state with empty selections - user must select regions of interest
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  
  // Initialize with no countries selected
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  // Initialize with empty services
  const initialServices: Record<string, string[]> = {};
  
  // Initialize selected services as empty object
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(initialServices);

  // Navigate back to onboarding
  const handleBack = () => {
    navigate('/partner-onboarding');
  };
  
  // Handle region selection/deselection
  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionId)) {
        // Remove region and its countries
        const region = pricingData.find(r => r.id === regionId);
        const countryCodes = region?.countries.map(c => c.code) || [];
        
        // Update selected countries
        const newSelectedCountries = selectedCountries.filter(code => 
          !countryCodes.includes(code)
        );
        setSelectedCountries(newSelectedCountries);
        
        // Update selected services
        const newServices = {...selectedServices};
        countryCodes.forEach(code => {
          delete newServices[code];
        });
        setSelectedServices(newServices);
        
        return prev.filter(r => r !== regionId);
      } else {
        return [...prev, regionId];
      }
    });
  };

  // Handle country selection/deselection
  const toggleCountry = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        // Remove country and its services
        const newServices = {...selectedServices};
        delete newServices[countryCode];
        setSelectedServices(newServices);
        
        return prev.filter(code => code !== countryCode);
      } else {
        return [...prev, countryCode];
      }
    });
  };
  
  // Handle service toggle
  const toggleService = (country: string, service: string) => {
    setSelectedServices(prev => {
      const currentServices = prev[country] || [];
      let updatedServices;
      
      if (currentServices.includes(service)) {
        updatedServices = currentServices.filter(s => s !== service);
      } else {
        updatedServices = [...currentServices, service];
      }
      
      return { ...prev, [country]: updatedServices };
    });
  };
  
  // Save selection and navigate back
  const handleComplete = () => {
    // Convert the selected services object to an array of service IDs
    const serviceIds = Object.values(selectedServices).flat();
    
    const selection: Selection = {
      regionIds: selectedRegions,
      countryIds: selectedCountries,
      serviceIds: serviceIds
    };
    
    // Log the selection for debugging
    console.log('Selected pricing options:', selection);
    
    // Store in localStorage for demo purposes
    try {
      localStorage.setItem('pricingSelection', JSON.stringify(selection));
      console.log('Saved pricing selection to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
    
    // Navigate back to onboarding
    navigate('/partner-onboarding');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0e1624',
      color: '#fff',
      overflowY: 'auto',
      padding: '0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0e1624',
        zIndex: 10,
      }}>
        <button
          onClick={handleBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '15px',
            padding: '8px 0',
          }}
        >
          ← Back
        </button>
        <h2 style={{ 
          margin: '0 auto', 
          fontSize: '18px', 
          fontWeight: 600,
          letterSpacing: '0.3px',
        }}>Select Pricing Options</h2>
      </div>

      {/* Main content - scrollable area */}
      <div style={{
        padding: '24px',
        flex: 1,
        overflow: 'auto',
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          backgroundColor: '#1a2231', 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {/* Regions section */}
          <div style={{ 
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              fontWeight: 600,
            }}>Regions</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px',
            }}>
              {pricingData.map(region => (
                <div
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  style={{
                    backgroundColor: selectedRegions.includes(region.id) ? '#2563eb' : 'rgba(255,255,255,0.08)',
                    color: selectedRegions.includes(region.id) ? 'white' : '#e2e8f0',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                    fontWeight: selectedRegions.includes(region.id) ? 500 : 400,
                  }}
                >
                  {region.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Countries section */}
          <div style={{ 
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              fontWeight: 600,
            }}>Countries</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {pricingData
                .filter(region => selectedRegions.includes(region.id))
                .flatMap(region => region.countries)
                .map(country => (
                  <div
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    style={{
                      backgroundColor: selectedCountries.includes(country.code) ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.04)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      border: selectedCountries.includes(country.code) ? '1px solid #2563eb' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ 
                      marginRight: '8px', 
                      fontSize: '14px', 
                      opacity: 0.7,
                      fontWeight: 600,
                    }}>
                      {country.code}
                    </span>
                    <span style={{ 
                      flex: '1',
                      fontSize: '15px',
                    }}>
                      {country.name}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Services by country section */}
          <div style={{ padding: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '24px',
              fontWeight: 600,
            }}>Payment Services</h3>
            
            {/* Services are organized by country */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}>
              {selectedCountries.map(countryCode => {
                // Find country details
                const country = pricingData
                  .flatMap(r => r.countries)
                  .find(c => c.code === countryCode);
                  
                if (!country) return null;
                
                // Get all payment methods for this country
                const availableServices = [...country.services]; 
                
                return (
                  <div key={countryCode} style={{ 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}>
                      <div style={{ 
                        width: '36px',
                        height: '26px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        {countryCode}
                      </div>
                      <h4 style={{ 
                        fontSize: '16px',
                        fontWeight: 600,
                        margin: 0,
                      }}>
                        {country.name}
                      </h4>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gap: '10px',
                    }}>
                      {availableServices.map(service => {
                        const isSelected = (selectedServices[countryCode] || []).includes(service.name);
                        
                        return (
                          <div 
                            key={service.id}
                            onClick={() => toggleService(countryCode, service.name)}
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.04)',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              border: isSelected ? '1px solid #2563eb' : '1px solid transparent',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {/* Checkbox style indicator */}
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isSelected ? '0' : '1px solid rgba(255,255,255,0.3)',
                              backgroundColor: isSelected ? '#2563eb' : 'transparent',
                              marginRight: '10px',
                              position: 'relative',
                            }}>
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: 'white',
                                  borderRadius: '2px'
                                }}></div>
                              )}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{
                                  backgroundColor: service.type === 'bank-payout' ? '#4f46e5' :
                                                service.type === 'wallet-payout' ? '#2563eb' :
                                                service.type === 'mobile-money' ? '#7c3aed' : '#0891b2',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  marginRight: '8px',
                                }}>
                                  {service.type}
                                </div>
                                <div style={{ fontWeight: 500, fontSize: '15px' }}>{service.name}</div>
                              </div>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '13px', opacity: 0.8 }}>
                                {service.currency && (
                                  <span style={{ color: '#a5f3fc' }}>{service.currency}</span>
                                )}
                                {service.coverage && (
                                  <span>Coverage: {service.coverage}</span>
                                )}
                                {service.transactionLimit && (
                                  <span>Limit: {service.currency} {service.transactionLimit.min} - {service.transactionLimit.max}</span>
                                )}
                                {service.tat && (
                                  <span>TAT: {service.tat}</span>
                                )}
                                {service.feeStructure && (
                                  <span>Fee: {service.feeStructure.fixed} + {service.feeStructure.percentage}%</span>
                                )}
                              </div>
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
        </div>
      </div>

      {/* Footer bar with action buttons */}
      <div style={{ 
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#111927',
      }}>
        <button 
          onClick={handleBack}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'background-color 0.15s ease',
          }}
        >
          Cancel
        </button>
        <button 
          onClick={handleComplete}
          style={{
            backgroundColor: '#2563eb',
            border: 'none',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'background-color 0.15s ease',
          }}
        >
          Save Selection
        </button>
      </div>
    </div>
  );
};

export default PricingProposalPage;
