import { ApiEndpoint } from '../types/documentation';

/**
 * WorldAPI Payments as a Service - For Financial Institutions
 * API endpoints extracted from the official PDF documentation
 */
export const worldApiEndpointsFromPDF: ApiEndpoint[] = [
  // ACCOUNT MANAGEMENT
  {
    name: 'Create Account',
    method: 'POST',
    path: '/api/v1/accounts',
    description: 'Create a new customer account for payment services',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createAccount',
    body: [
      {
        name: 'account_holder_name',
        type: 'string',
        required: true,
        description: 'Full legal name of the account holder',
        example: 'John Smith'
      },
      {
        name: 'account_type',
        type: 'string',
        required: true,
        description: 'Type of account to create',
        enum: ['individual', 'business'],
        example: 'individual'
      },
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Email address for account notifications',
        example: 'john.smith@example.com'
      },
      {
        name: 'phone_number',
        type: 'string',
        required: true,
        description: 'Phone number for account verification',
        example: '+1234567890'
      },
      {
        name: 'date_of_birth',
        type: 'string',
        required: true,
        description: 'Date of birth in YYYY-MM-DD format',
        example: '1990-01-15'
      },
      {
        name: 'address',
        type: 'object',
        required: true,
        description: 'Account holder address information'
      },
      {
        name: 'identity_document',
        type: 'object',
        required: true,
        description: 'Government-issued identity document details'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "account_id": "acc_1234567890",
          "account_holder_name": "John Smith",
          "account_type": "individual",
          "status": "pending_verification",
          "created_at": "2024-01-15T10:30:00Z",
          "verification_requirements": [
            "identity_document_verification",
            "address_verification"
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "VALIDATION_ERROR",
          "message": "Account holder name is required",
          "details": {
            "field": "account_holder_name",
            "reason": "missing_required_field"
          }
        }
      }, null, 2)
    }
  },
  {
    name: 'Get Account Balance',
    method: 'GET',
    path: '/api/v1/accounts/{account_id}/balance',
    description: 'Retrieve current balance and available funds for an account',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getAccountBalance',
    params: [
      {
        name: 'account_id',
        type: 'string',
        required: true,
        description: 'Unique identifier for the account',
        in: 'path',
        example: 'acc_1234567890'
      },
      {
        name: 'currency',
        type: 'string',
        required: false,
        description: 'Currency code to filter balances',
        in: 'query',
        example: 'USD'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "account_id": "acc_1234567890",
          "balances": [
            {
              "currency": "USD",
              "available_balance": 1500.00,
              "pending_balance": 250.00,
              "total_balance": 1750.00
            },
            {
              "currency": "EUR",
              "available_balance": 800.00,
              "pending_balance": 0.00,
              "total_balance": 800.00
            }
          ],
          "last_updated": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "ACCOUNT_NOT_FOUND",
          "message": "Account with the provided ID does not exist"
        }
      }, null, 2)
    }
  },
  // PAYMENT PROCESSING
  {
    name: 'Initiate Payment',
    method: 'POST',
    path: '/api/v1/payments',
    description: 'Initiate a payment transaction between accounts or to external recipients',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'initiatePayment',
    body: [
      {
        name: 'source_account_id',
        type: 'string',
        required: true,
        description: 'Account ID of the payment sender',
        example: 'acc_1234567890'
      },
      {
        name: 'destination_type',
        type: 'string',
        required: true,
        description: 'Type of payment destination',
        enum: ['internal_account', 'bank_transfer', 'mobile_money', 'cash_pickup'],
        example: 'bank_transfer'
      },
      {
        name: 'destination_details',
        type: 'object',
        required: true,
        description: 'Details of payment destination (varies by destination_type)'
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Payment amount in minor currency units (cents)',
        example: 10000
      },
      {
        name: 'currency',
        type: 'string',
        required: true,
        description: 'Payment currency code (ISO 4217)',
        example: 'USD'
      },
      {
        name: 'purpose_code',
        type: 'string',
        required: true,
        description: 'Purpose of payment for compliance',
        enum: ['family_support', 'business_payment', 'education', 'medical', 'other'],
        example: 'family_support'
      },
      {
        name: 'reference',
        type: 'string',
        required: false,
        description: 'Optional payment reference',
        example: 'Monthly allowance'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "payment_id": "pay_9876543210",
          "transaction_reference": "TXN-20240115-001",
          "status": "processing",
          "amount": 10000,
          "currency": "USD",
          "fee": 150,
          "estimated_delivery": "2024-01-17T10:30:00Z",
          "tracking_number": "WLD123456789"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INSUFFICIENT_FUNDS",
          "message": "Account balance is insufficient for this payment",
          "details": {
            "available_balance": 5000,
            "required_amount": 10150
          }
        }
      }, null, 2)
    }
  },
  {
    name: 'Get Payment Status',
    method: 'GET',
    path: '/api/v1/payments/{payment_id}',
    description: 'Retrieve the current status and details of a payment transaction',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getPaymentStatus',
    params: [
      {
        name: 'payment_id',
        type: 'string',
        required: true,
        description: 'Unique identifier for the payment',
        in: 'path',
        example: 'pay_9876543210'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "payment_id": "pay_9876543210",
          "transaction_reference": "TXN-20240115-001",
          "status": "completed",
          "amount": 10000,
          "currency": "USD",
          "fee": 150,
          "source_account_id": "acc_1234567890",
          "destination_type": "bank_transfer",
          "created_at": "2024-01-15T10:30:00Z",
          "completed_at": "2024-01-17T09:15:00Z",
          "tracking_number": "WLD123456789",
          "status_history": [
            {
              "status": "initiated",
              "timestamp": "2024-01-15T10:30:00Z"
            },
            {
              "status": "processing",
              "timestamp": "2024-01-15T10:31:00Z"
            },
            {
              "status": "completed",
              "timestamp": "2024-01-17T09:15:00Z"
            }
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "PAYMENT_NOT_FOUND",
          "message": "Payment with the provided ID does not exist"
        }
      }, null, 2)
    }
  },
  // EXCHANGE RATES
  {
    name: 'Get Exchange Rates',
    method: 'GET',
    path: '/api/v1/exchange-rates',
    description: 'Retrieve current exchange rates for currency conversion',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getExchangeRates',
    params: [
      {
        name: 'from_currency',
        type: 'string',
        required: true,
        description: 'Source currency code',
        in: 'query',
        example: 'USD'
      },
      {
        name: 'to_currency',
        type: 'string',
        required: false,
        description: 'Target currency code (returns all if not specified)',
        in: 'query',
        example: 'EUR'
      },
      {
        name: 'amount',
        type: 'number',
        required: false,
        description: 'Amount to convert for fee calculation',
        in: 'query',
        example: 1000
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "base_currency": "USD",
          "timestamp": "2024-01-15T10:30:00Z",
          "rates": [
            {
              "currency": "EUR",
              "rate": 0.8502,
              "fee_percentage": 1.5,
              "minimum_fee": 200,
              "maximum_fee": 5000
            },
            {
              "currency": "GBP",
              "rate": 0.7589,
              "fee_percentage": 1.8,
              "minimum_fee": 250,
              "maximum_fee": 6000
            }
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_CURRENCY",
          "message": "Unsupported currency code provided"
        }
      }, null, 2)
    }
  },
  // COMPLIANCE & KYC
  {
    name: 'Submit KYC Documents',
    method: 'POST',
    path: '/api/v1/accounts/{account_id}/kyc',
    description: 'Submit Know Your Customer (KYC) documents for account verification',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'submitKycDocuments',
    params: [
      {
        name: 'account_id',
        type: 'string',
        required: true,
        description: 'Account ID for KYC submission',
        in: 'path',
        example: 'acc_1234567890'
      }
    ],
    body: [
      {
        name: 'document_type',
        type: 'string',
        required: true,
        description: 'Type of identity document',
        enum: ['passport', 'drivers_license', 'national_id', 'proof_of_address'],
        example: 'passport'
      },
      {
        name: 'document_number',
        type: 'string',
        required: true,
        description: 'Document identification number',
        example: 'P123456789'
      },
      {
        name: 'document_image_front',
        type: 'string',
        required: true,
        description: 'Base64 encoded front image of document',
        example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'
      },
      {
        name: 'document_image_back',
        type: 'string',
        required: false,
        description: 'Base64 encoded back image of document (if applicable)',
        example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'
      },
      {
        name: 'expiry_date',
        type: 'string',
        required: true,
        description: 'Document expiry date in YYYY-MM-DD format',
        example: '2030-12-31'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "submission_id": "kyc_abc123def456",
          "account_id": "acc_1234567890",
          "document_type": "passport",
          "status": "under_review",
          "submitted_at": "2024-01-15T10:30:00Z",
          "estimated_review_time": "24-48 hours"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_DOCUMENT_FORMAT",
          "message": "Document image must be in JPEG or PNG format",
          "details": {
            "supported_formats": ["image/jpeg", "image/png"],
            "max_file_size": "5MB"
          }
        }
      }, null, 2)
    }
  },
  // TRANSACTION HISTORY
  {
    name: 'Get Transaction History',
    method: 'GET',
    path: '/api/v1/accounts/{account_id}/transactions',
    description: 'Retrieve transaction history for an account with filtering options',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getTransactionHistory',
    params: [
      {
        name: 'account_id',
        type: 'string',
        required: true,
        description: 'Account ID to retrieve transactions for',
        in: 'path',
        example: 'acc_1234567890'
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Start date for transaction filter (YYYY-MM-DD)',
        in: 'query',
        example: '2024-01-01'
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'End date for transaction filter (YYYY-MM-DD)',
        in: 'query',
        example: '2024-01-31'
      },
      {
        name: 'transaction_type',
        type: 'string',
        required: false,
        description: 'Filter by transaction type',
        in: 'query',
        enum: ['payment_sent', 'payment_received', 'fee', 'refund'],
        example: 'payment_sent'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of transactions to return (max 100)',
        in: 'query',
        example: '25'
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Number of transactions to skip',
        in: 'query',
        example: '0'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "account_id": "acc_1234567890",
          "transactions": [
            {
              "transaction_id": "txn_001",
              "payment_id": "pay_9876543210",
              "type": "payment_sent",
              "amount": -10150,
              "currency": "USD",
              "description": "International transfer to John Doe",
              "status": "completed",
              "created_at": "2024-01-15T10:30:00Z",
              "reference": "Monthly allowance"
            },
            {
              "transaction_id": "txn_002",
              "type": "payment_received",
              "amount": 25000,
              "currency": "USD",
              "description": "Incoming wire transfer",
              "status": "completed",
              "created_at": "2024-01-10T14:20:00Z",
              "reference": "Salary payment"
            }
          ],
          "pagination": {
            "total": 45,
            "limit": 25,
            "offset": 0,
            "has_more": true
          }
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_DATE_RANGE",
          "message": "End date must be after start date"
        }
      }, null, 2)
    }
  },
  // BENEFICIARY MANAGEMENT
  {
    name: 'Add Beneficiary',
    method: 'POST',
    path: '/api/v1/accounts/{account_id}/beneficiaries',
    description: 'Add a new payment beneficiary for quick future payments',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'addBeneficiary',
    params: [
      {
        name: 'account_id',
        type: 'string',
        required: true,
        description: 'Account ID to add beneficiary for',
        in: 'path',
        example: 'acc_1234567890'
      }
    ],
    body: [
      {
        name: 'beneficiary_name',
        type: 'string',
        required: true,
        description: 'Full name of the beneficiary',
        example: 'Jane Smith'
      },
      {
        name: 'beneficiary_type',
        type: 'string',
        required: true,
        description: 'Type of beneficiary',
        enum: ['individual', 'business'],
        example: 'individual'
      },
      {
        name: 'country',
        type: 'string',
        required: true,
        description: 'Country code where beneficiary is located',
        example: 'GB'
      },
      {
        name: 'payment_method',
        type: 'string',
        required: true,
        description: 'Preferred payment method for this beneficiary',
        enum: ['bank_transfer', 'mobile_money', 'cash_pickup'],
        example: 'bank_transfer'
      },
      {
        name: 'bank_details',
        type: 'object',
        required: false,
        description: 'Bank account details (required for bank_transfer)'
      },
      {
        name: 'mobile_details',
        type: 'object',
        required: false,
        description: 'Mobile money details (required for mobile_money)'
      },
      {
        name: 'pickup_details',
        type: 'object',
        required: false,
        description: 'Cash pickup location details (required for cash_pickup)'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "beneficiary_id": "ben_xyz789abc123",
          "account_id": "acc_1234567890",
          "beneficiary_name": "Jane Smith",
          "beneficiary_type": "individual",
          "country": "GB",
          "payment_method": "bank_transfer",
          "status": "active",
          "created_at": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_BANK_DETAILS",
          "message": "Bank account number format is invalid for the specified country"
        }
      }, null, 2)
    }
  },
  // QUOTE MANAGEMENT
  {
    name: 'Create Quote',
    method: 'POST',
    path: '/api/v1/quotes',
    description: 'Create a quote to lock exchange rate and fees for a payment transaction',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createQuote',
    body: [
      {
        name: 'sending_country_code',
        type: 'string',
        required: true,
        description: 'ISO country code of sending country',
        example: 'US'
      },
      {
        name: 'sending_currency_code',
        type: 'string',
        required: true,
        description: 'ISO currency code of sending currency',
        example: 'USD'
      },
      {
        name: 'receiving_country_code',
        type: 'string',
        required: true,
        description: 'ISO country code of receiving country',
        example: 'GB'
      },
      {
        name: 'receiving_currency_code',
        type: 'string',
        required: true,
        description: 'ISO currency code of receiving currency',
        example: 'GBP'
      },
      {
        name: 'sending_amount',
        type: 'number',
        required: true,
        description: 'Amount to send in minor currency units',
        example: 100000
      },
      {
        name: 'receiving_mode',
        type: 'string',
        required: true,
        description: 'Method of receiving payment',
        enum: ['bank_transfer', 'mobile_money', 'cash_pickup', 'wallet'],
        example: 'bank_transfer'
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Type of transfer',
        enum: ['personal', 'business'],
        example: 'personal'
      },
      {
        name: 'instrument',
        type: 'string',
        required: true,
        description: 'Payment instrument type',
        enum: ['card', 'bank_account', 'wallet'],
        example: 'bank_account'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "quote_id": "quote_abc123def456",
          "sending_amount": 100000,
          "sending_currency": "USD",
          "receiving_amount": 75890,
          "receiving_currency": "GBP",
          "exchange_rate": 0.7589,
          "fee": 1500,
          "total_amount": 101500,
          "expires_at": "2024-01-15T11:30:00Z",
          "estimated_delivery": "2024-01-17T10:00:00Z",
          "created_at": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "UNSUPPORTED_CORRIDOR",
          "message": "Payment corridor from US to specified country is not supported",
          "details": {
            "supported_countries": ["GB", "DE", "FR", "CA", "AU"]
          }
        }
      }, null, 2)
    }
  },
  {
    name: 'Create Transaction',
    method: 'POST',
    path: '/api/v1/transactions',
    description: 'Create a payment transaction using a quote and sender/receiver information',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createTransaction',
    body: [
      {
        name: 'quote_id',
        type: 'string',
        required: true,
        description: 'Quote ID from previously created quote',
        example: 'quote_abc123def456'
      },
      {
        name: 'sender_information',
        type: 'object',
        required: true,
        description: 'Detailed information about the sender'
      },
      {
        name: 'receiver_information',
        type: 'object',
        required: true,
        description: 'Detailed information about the receiver'
      },
      {
        name: 'purpose_of_payment',
        type: 'string',
        required: true,
        description: 'Purpose of the payment for compliance',
        enum: ['family_support', 'business_payment', 'education', 'medical', 'gift', 'investment'],
        example: 'family_support'
      },
      {
        name: 'source_of_funds',
        type: 'string',
        required: true,
        description: 'Source of funds for compliance',
        enum: ['salary', 'business_income', 'investment', 'savings', 'other'],
        example: 'salary'
      },
      {
        name: 'payment_reference',
        type: 'string',
        required: false,
        description: 'Optional reference for the payment',
        example: 'Monthly support payment'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "txn_xyz789abc123",
          "transaction_ref_number": "WLD-20240115-001",
          "quote_id": "quote_abc123def456",
          "status": "pending_confirmation",
          "sending_amount": 100000,
          "receiving_amount": 75890,
          "fee": 1500,
          "total_amount": 101500,
          "estimated_delivery": "2024-01-17T10:00:00Z",
          "created_at": "2024-01-15T10:30:00Z",
          "confirmation_required_by": "2024-01-15T11:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "QUOTE_EXPIRED",
          "message": "The provided quote has expired and cannot be used",
          "details": {
            "quote_id": "quote_abc123def456",
            "expired_at": "2024-01-15T11:30:00Z"
          }
        }
      }, null, 2)
    }
  },
  {
    name: 'Confirm Transaction',
    method: 'POST',
    path: '/api/v1/transactions/{transaction_ref_number}/confirm',
    description: 'Confirm a previously created transaction to initiate processing',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'confirmTransaction',
    params: [
      {
        name: 'transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Transaction reference number to confirm',
        in: 'path',
        example: 'WLD-20240115-001'
      }
    ],
    body: [
      {
        name: 'confirmation_code',
        type: 'string',
        required: false,
        description: 'Optional confirmation code for additional security',
        example: '123456'
      },
      {
        name: 'final_verification',
        type: 'boolean',
        required: true,
        description: 'Confirm that all details have been verified',
        example: true
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "txn_xyz789abc123",
          "transaction_ref_number": "WLD-20240115-001",
          "status": "processing",
          "confirmed_at": "2024-01-15T10:35:00Z",
          "estimated_delivery": "2024-01-17T10:00:00Z",
          "tracking_number": "WLD123456789",
          "payment_instructions": {
            "instruction": "Payment is being processed and will be delivered to the recipient within 2 business days"
          }
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "TRANSACTION_NOT_FOUND",
          "message": "Transaction with the provided reference number does not exist or cannot be confirmed"
        }
      }, null, 2)
    }
  },
  {
    name: 'Get Transaction Status',
    method: 'GET',
    path: '/api/v1/transactions/{transaction_ref_number}',
    description: 'Retrieve detailed status and tracking information for a transaction',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getTransactionStatus',
    params: [
      {
        name: 'transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Transaction reference number to track',
        in: 'path',
        example: 'WLD-20240115-001'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "txn_xyz789abc123",
          "transaction_ref_number": "WLD-20240115-001",
          "status": "completed",
          "status_description": "Payment successfully delivered to recipient",
          "sending_amount": 100000,
          "receiving_amount": 75890,
          "fee": 1500,
          "exchange_rate": 0.7589,
          "tracking_number": "WLD123456789",
          "created_at": "2024-01-15T10:30:00Z",
          "confirmed_at": "2024-01-15T10:35:00Z",
          "completed_at": "2024-01-17T09:15:00Z",
          "status_timeline": [
            {
              "status": "created",
              "timestamp": "2024-01-15T10:30:00Z",
              "description": "Transaction created successfully"
            },
            {
              "status": "confirmed",
              "timestamp": "2024-01-15T10:35:00Z",
              "description": "Transaction confirmed and processing initiated"
            },
            {
              "status": "processing",
              "timestamp": "2024-01-15T10:36:00Z",
              "description": "Payment is being processed"
            },
            {
              "status": "completed",
              "timestamp": "2024-01-17T09:15:00Z",
              "description": "Payment successfully delivered to recipient"
            }
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "TRANSACTION_NOT_FOUND",
          "message": "Transaction with the provided reference number does not exist"
        }
      }, null, 2)
    }
  },
  {
    name: 'Cancel Transaction',
    method: 'DELETE',
    path: '/api/v1/transactions/{transaction_ref_number}',
    description: 'Cancel a transaction that has not yet been processed',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'cancelTransaction',
    params: [
      {
        name: 'transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Transaction reference number to cancel',
        in: 'path',
        example: 'WLD-20240115-001'
      }
    ],
    body: [
      {
        name: 'cancellation_reason',
        type: 'string',
        required: true,
        description: 'Reason for cancelling the transaction',
        enum: ['customer_request', 'fraud_prevention', 'compliance_issue', 'technical_error'],
        example: 'customer_request'
      },
      {
        name: 'refund_to_source',
        type: 'boolean',
        required: false,
        description: 'Whether to refund the amount to the original payment source',
        example: true
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "txn_xyz789abc123",
          "transaction_ref_number": "WLD-20240115-001",
          "status": "cancelled",
          "cancelled_at": "2024-01-15T11:00:00Z",
          "cancellation_reason": "customer_request",
          "refund_amount": 101500,
          "refund_reference": "REF-20240115-001",
          "refund_status": "processing"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "CANNOT_CANCEL",
          "message": "Transaction cannot be cancelled as it has already been processed",
          "details": {
            "current_status": "completed",
            "completed_at": "2024-01-17T09:15:00Z"
          }
        }
      }, null, 2)
    }
  },
  {
    name: 'Get Supported Countries',
    method: 'GET',
    path: '/api/v1/countries',
    description: 'Retrieve list of supported countries and their payment methods',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'getSupportedCountries',
    params: [
      {
        name: 'sending_country',
        type: 'string',
        required: false,
        description: 'Filter by sending country code',
        in: 'query',
        example: 'US'
      },
      {
        name: 'receiving_country',
        type: 'string',
        required: false,
        description: 'Filter by receiving country code',
        in: 'query',
        example: 'GB'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "supported_corridors": [
            {
              "sending_country": "US",
              "sending_currency": "USD",
              "receiving_country": "GB",
              "receiving_currency": "GBP",
              "supported_methods": ["bank_transfer", "mobile_money"],
              "min_amount": 1000,
              "max_amount": 1000000,
              "estimated_delivery": "1-2 business days"
            },
            {
              "sending_country": "US",
              "sending_currency": "USD",
              "receiving_country": "IN",
              "receiving_currency": "INR",
              "supported_methods": ["bank_transfer", "mobile_money", "cash_pickup"],
              "min_amount": 1000,
              "max_amount": 500000,
              "estimated_delivery": "30 minutes - 4 hours"
            }
          ],
          "total_corridors": 45
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_COUNTRY_CODE",
          "message": "Provided country code is not valid or supported"
        }
      }, null, 2)
    }
  },
];

export default worldApiEndpointsFromPDF;
