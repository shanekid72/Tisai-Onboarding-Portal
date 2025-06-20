// Real WorldAPI Endpoints extracted from Postman Collection
// These are the actual APIs used in production

export interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  baseUrl: string;
  operationId: string;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    in: 'query' | 'path' | 'header' | 'body';
    example?: any;
    enum?: string[];
  }>;
  headers?: Array<{
    name: string;
    value: string;
    required: boolean;
    description: string;
  }>;
  body?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
    enum?: string[];
  }>;
  response: {
    success: string;
    error: string;
  };
}

const realWorldApiEndpoints: ApiEndpoint[] = [
  // Authentication
  {
    name: 'KeyCloak Authentication',
    method: 'POST',
    path: '/auth/realms/cdp/protocol/openid-connect/token',
    description: 'Authenticate with KeyCloak to get access token for API calls',
    baseUrl: 'https://drap-sandbox.digitnine.com',
    operationId: 'authenticate',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/x-www-form-urlencoded',
        required: true,
        description: 'Content type for form data'
      }
    ],
    body: [
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'Username for authentication',
        example: 'testagentae'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Password for authentication',
        example: 'Admin@123'
      },
      {
        name: 'grant_type',
        type: 'string',
        required: true,
        description: 'OAuth2 grant type',
        example: 'password'
      },
      {
        name: 'client_id',
        type: 'string',
        required: true,
        description: 'Client identifier',
        example: 'cdp_app'
      },
      {
        name: 'client_secret',
        type: 'string',
        required: true,
        description: 'Client secret',
        example: 'mSh18BPiMZeQqFfOvWhgv8wzvnNVbj3Y'
      }
    ],
    response: {
      success: JSON.stringify({
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfOUY4...",
        "expires_in": 3600,
        "refresh_expires_in": 1800,
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4NGY...",
        "token_type": "Bearer",
        "not-before-policy": 0,
        "session_state": "f4e3c2b1-a123-4567-8901-234567890abc",
        "scope": "profile email"
      }, null, 2),
      error: JSON.stringify({
        "error": "invalid_grant",
        "error_description": "Invalid user credentials"
      }, null, 2)
    }
  },

  // Quote APIs for Different Countries
  {
    name: 'Create Quote (AE to PK)',
    method: 'POST',
    path: '/amr/ras/api/v1_0/ras/quote',
    description: 'Create a quote for money transfer from UAE to Pakistan',
    baseUrl: '{{Host}}',
    operationId: 'createQuoteAEToPK',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        required: true,
        description: 'Content type for JSON data'
      },
      {
        name: 'sender',
        value: 'testagentae',
        required: true,
        description: 'Sender identifier'
      },
      {
        name: 'channel',
        value: 'Direct',
        required: true,
        description: 'Channel type'
      },
      {
        name: 'company',
        value: '784825',
        required: true,
        description: 'Company identifier'
      },
      {
        name: 'branch',
        value: '784826',
        required: true,
        description: 'Branch identifier'
      },
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      }
    ],
    body: [
      {
        name: 'sending_country_code',
        type: 'string',
        required: true,
        description: 'Sending country code',
        example: 'AE'
      },
      {
        name: 'sending_currency_code',
        type: 'string',
        required: true,
        description: 'Sending currency code',
        example: 'AED'
      },
      {
        name: 'receiving_country_code',
        type: 'string',
        required: true,
        description: 'Receiving country code',
        example: 'PK'
      },
      {
        name: 'receiving_currency_code',
        type: 'string',
        required: true,
        description: 'Receiving currency code',
        example: 'PKR'
      },
      {
        name: 'sending_amount',
        type: 'number',
        required: true,
        description: 'Amount to send',
        example: 300
      },
      {
        name: 'receiving_mode',
        type: 'string',
        required: true,
        description: 'Method of receiving payment',
        example: 'BANK',
        enum: ['BANK', 'CASH', 'MOBILE_MONEY']
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Transaction type',
        example: 'SEND'
      },
      {
        name: 'instrument',
        type: 'string',
        required: true,
        description: 'Payment instrument',
        example: 'REMITTANCE'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "quote_id": "QTE-20240120-001",
          "exchange_rate": 74.5,
          "sending_amount": 300,
          "receiving_amount": 22350,
          "fees": 15,
          "total_amount": 315,
          "quote_expiry": "2024-01-20T15:30:00Z",
          "delivery_time": "Within 2 hours"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_CORRIDOR",
          "message": "The specified sending/receiving country combination is not supported"
        }
      }, null, 2)
    }
  },

  // Create Transaction
  {
    name: 'Create Transaction',
    method: 'POST',
    path: '/amr/ras/api/v1_0/ras/createtransaction',
    description: 'Create a money transfer transaction using a quote',
    baseUrl: '{{Host}}',
    operationId: 'createTransaction',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        required: true,
        description: 'Content type for JSON data'
      },
      {
        name: 'sender',
        value: 'testagentae',
        required: true,
        description: 'Sender identifier'
      },
      {
        name: 'channel',
        value: 'Direct',
        required: true,
        description: 'Channel type'
      },
      {
        name: 'company',
        value: '784825',
        required: true,
        description: 'Company identifier'
      },
      {
        name: 'branch',
        value: '784826',
        required: true,
        description: 'Branch identifier'
      },
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      }
    ],
    body: [
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Transaction type',
        example: 'SEND'
      },
      {
        name: 'source_of_income',
        type: 'string',
        required: true,
        description: 'Source of income code',
        example: 'SLRY'
      },
      {
        name: 'purpose_of_txn',
        type: 'string',
        required: true,
        description: 'Purpose of transaction',
        example: 'SAVG'
      },
      {
        name: 'instrument',
        type: 'string',
        required: true,
        description: 'Payment instrument',
        example: 'REMITTANCE'
      },
      {
        name: 'message',
        type: 'string',
        required: false,
        description: 'Transaction message',
        example: 'Agency transaction'
      },
      {
        name: 'sender.customer_number',
        type: 'string',
        required: true,
        description: 'Sender customer number',
        example: '7841001220007002'
      },
      {
        name: 'receiver.mobile_number',
        type: 'string',
        required: true,
        description: 'Receiver mobile number',
        example: '+919586741508'
      },
      {
        name: 'receiver.first_name',
        type: 'string',
        required: true,
        description: 'Receiver first name',
        example: 'Anija FirstName'
      },
      {
        name: 'receiver.last_name',
        type: 'string',
        required: true,
        description: 'Receiver last name',
        example: 'Anija Lastname'
      },
      {
        name: 'receiver.nationality',
        type: 'string',
        required: true,
        description: 'Receiver nationality',
        example: 'IN'
      },
      {
        name: 'receiver.relation_code',
        type: 'string',
        required: true,
        description: 'Relationship to sender',
        example: '32'
      },
      {
        name: 'receiver.bank_details.account_type_code',
        type: 'string',
        required: true,
        description: 'Bank account type',
        example: '1'
      },
      {
        name: 'receiver.bank_details.iso_code',
        type: 'string',
        required: true,
        description: 'Bank ISO code',
        example: 'BKIPPKKA'
      },
      {
        name: 'receiver.bank_details.iban',
        type: 'string',
        required: true,
        description: 'Bank IBAN',
        example: 'PK12ABCD1234567891234567'
      },
      {
        name: 'transaction.quote_id',
        type: 'string',
        required: true,
        description: 'Quote ID from previous quote creation',
        example: '{{quote_id}}'
      },
      {
        name: 'transaction.agent_transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Agent transaction reference',
        example: '{{quote_id}}'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "TXN-20240120-001",
          "transaction_ref_number": "DRAP-20240120-001",
          "status": "CREATED",
          "quote_id": "QTE-20240120-001",
          "sending_amount": 300,
          "receiving_amount": 22350,
          "fees": 15,
          "total_amount": 315,
          "created_at": "2024-01-20T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_QUOTE",
          "message": "Quote has expired or is invalid"
        }
      }, null, 2)
    }
  },

  // Confirm Transaction
  {
    name: 'Confirm Transaction',
    method: 'POST',
    path: '/amr/ras/api/v1_0/ras/confirmtransaction',
    description: 'Confirm a previously created transaction to initiate processing',
    baseUrl: '{{Host}}',
    operationId: 'confirmTransaction',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        required: true,
        description: 'Content type for JSON data'
      },
      {
        name: 'sender',
        value: 'testagentae',
        required: true,
        description: 'Sender identifier'
      },
      {
        name: 'channel',
        value: 'Direct',
        required: true,
        description: 'Channel type'
      },
      {
        name: 'company',
        value: '784825',
        required: true,
        description: 'Company identifier'
      },
      {
        name: 'branch',
        value: '784826',
        required: true,
        description: 'Branch identifier'
      },
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      }
    ],
    body: [
      {
        name: 'transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Transaction reference number from create transaction',
        example: 'DRAP-20240120-001'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "TXN-20240120-001",
          "transaction_ref_number": "DRAP-20240120-001",
          "status": "CONFIRMED",
          "tracking_number": "TRK123456789",
          "estimated_delivery": "2024-01-20T14:30:00Z",
          "confirmed_at": "2024-01-20T10:35:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "TRANSACTION_NOT_FOUND",
          "message": "Transaction with provided reference number not found"
        }
      }, null, 2)
    }
  },

  // Customer Management APIs
  {
    name: 'Validate Customer',
    method: 'POST',
    path: '/caas/api/v2/customer/validate',
    description: 'Validate customer identity using ID number and type',
    baseUrl: 'https://{{base_url}}',
    operationId: 'validateCustomer',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        required: true,
        description: 'Content type for JSON data'
      },
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      }
    ],
    body: [
      {
        name: 'idNumber',
        type: 'string',
        required: true,
        description: 'Customer ID number',
        example: '784199554586091'
      },
      {
        name: 'idType',
        type: 'string',
        required: true,
        description: 'Type of ID document',
        example: '4'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "customer_id": "CUST-7841001220007002",
          "validation_status": "VALID",
          "customer_details": {
            "first_name": "John",
            "last_name": "Doe",
            "nationality": "AE",
            "date_of_birth": "1990-01-01"
          }
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "CUSTOMER_NOT_FOUND",
          "message": "Customer with provided ID not found"
        }
      }, null, 2)
    }
  },

  {
    name: 'Onboard Customer',
    method: 'POST',
    path: '/caas-lcm/api/v1/CAAS/onBoarding/customer',
    description: 'Create a new customer account with complete KYC information',
    baseUrl: 'https://{{base_url}}',
    operationId: 'onboardCustomer',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        required: true,
        description: 'Content type for JSON data'
      },
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      }
    ],
    body: [
      {
        name: 'channel',
        type: 'string',
        required: true,
        description: 'Channel used for onboarding',
        example: 'WEB'
      },
      {
        name: 'agent_location_id',
        type: 'string',
        required: true,
        description: 'Agent location identifier',
        example: '{{agent_location_id}}'
      },
      {
        name: 'first_name',
        type: 'string',
        required: true,
        description: 'Customer first name',
        example: 'John'
      },
      {
        name: 'last_name',
        type: 'string',
        required: true,
        description: 'Customer last name',
        example: 'Doe'
      },
      {
        name: 'nationality',
        type: 'string',
        required: true,
        description: 'Customer nationality',
        example: 'IN'
      },
      {
        name: 'date_of_birth',
        type: 'string',
        required: true,
        description: 'Date of birth (YYYY-MM-DD)',
        example: '1993-12-21'
      },
      {
        name: 'gender',
        type: 'string',
        required: true,
        description: 'Customer gender',
        example: 'Male',
        enum: ['Male', 'Female']
      },
      {
        name: 'primary_mobile_number',
        type: 'string',
        required: true,
        description: 'Primary mobile number',
        example: '+971502325940'
      },
      {
        name: 'email_id',
        type: 'string',
        required: true,
        description: 'Email address',
        example: 'john.doe@example.com'
      },
      {
        name: 'occupation_id',
        type: 'number',
        required: true,
        description: 'Occupation identifier',
        example: 223
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "customer_id": "CUST-20240120-001",
          "customer_number": "7841001220007002",
          "onboarding_status": "PENDING_VERIFICATION",
          "verification_required": ["ID_VERIFICATION", "ADDRESS_VERIFICATION"],
          "created_at": "2024-01-20T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "DUPLICATE_CUSTOMER",
          "message": "Customer with this ID already exists"
        }
      }, null, 2)
    }
  },

  // Transaction Enquiry
  {
    name: 'Enquire Transaction',
    method: 'GET',
    path: '/amr/ras/api/v1_0/ras/enquiretransaction',
    description: 'Get detailed information about a transaction',
    baseUrl: '{{Host}}',
    operationId: 'enquireTransaction',
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer {{access_token}}',
        required: true,
        description: 'Bearer token for authentication'
      },
      {
        name: 'sender',
        value: 'testagentae',
        required: true,
        description: 'Sender identifier'
      },
      {
        name: 'channel',
        value: 'Direct',
        required: true,
        description: 'Channel type'
      },
      {
        name: 'company',
        value: '784825',
        required: true,
        description: 'Company identifier'
      },
      {
        name: 'branch',
        value: '784826',
        required: true,
        description: 'Branch identifier'
      }
    ],
    params: [
      {
        name: 'transaction_ref_number',
        type: 'string',
        required: true,
        description: 'Transaction reference number to enquire about',
        in: 'query',
        example: 'DRAP-20240120-001'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transaction_id": "TXN-20240120-001",
          "transaction_ref_number": "DRAP-20240120-001",
          "status": "COMPLETED",
          "tracking_number": "TRK123456789",
          "sending_amount": 300,
          "receiving_amount": 22350,
          "fees": 15,
          "exchange_rate": 74.5,
          "sender_details": {
            "customer_number": "7841001220007002",
            "name": "John Doe"
          },
          "receiver_details": {
            "name": "Anija FirstName Lastname",
            "mobile_number": "+919586741508",
            "bank_account": "PK12ABCD1234567891234567"
          },
          "timeline": [
            {
              "status": "CREATED",
              "timestamp": "2024-01-20T10:30:00Z",
              "description": "Transaction created"
            },
            {
              "status": "CONFIRMED",
              "timestamp": "2024-01-20T10:35:00Z",
              "description": "Transaction confirmed"
            },
            {
              "status": "PROCESSING",
              "timestamp": "2024-01-20T10:40:00Z",
              "description": "Payment processing started"
            },
            {
              "status": "COMPLETED",
              "timestamp": "2024-01-20T12:15:00Z",
              "description": "Payment delivered successfully"
            }
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "TRANSACTION_NOT_FOUND",
          "message": "Transaction with provided reference number not found"
        }
      }, null, 2)
    }
  }
];

export default realWorldApiEndpoints;
