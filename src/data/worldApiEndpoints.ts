import { ApiEndpoint } from '../types/documentation';

export const worldApiEndpoints: ApiEndpoint[] = [
  // Customer Management APIs
  {
    name: 'List All Customers',
    method: 'GET',
    path: '/api/v1/customers',
    description: 'Retrieve a list of all customers in your organization',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'listAllCustomers',
    params: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of customers to return (default: 10, max: 100)',
        in: 'query',
        example: '10'
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Number of customers to skip (default: 0)',
        in: 'query',
        example: '0'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by customer status',
        in: 'query',
        enum: ['active', 'inactive', 'suspended']
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "customers": [
            {
              "customer_uuid": "cust_12345678901234567890",
              "email": "john.doe@example.com",
              "first_name": "John",
              "last_name": "Doe",
              "phone": "+1234567890",
              "status": "active",
              "created_at": "2024-01-15T10:30:00Z",
              "updated_at": "2024-01-15T10:30:00Z"
            }
          ],
          "total": 1,
          "limit": 10,
          "offset": 0
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_REQUEST",
          "message": "The request parameters are invalid"
        }
      }, null, 2)
    }
  },
  {
    name: 'Create Customer',
    method: 'POST',
    path: '/api/v1/customers',
    description: 'Create a new customer in your organization',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createCustomer',
    body: [
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Customer email address',
        example: 'john.doe@example.com'
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
        name: 'phone',
        type: 'string',
        required: false,
        description: 'Customer phone number',
        example: '+1234567890'
      },
      {
        name: 'address',
        type: 'object',
        required: false,
        description: 'Customer address information'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "customer_uuid": "cust_12345678901234567890",
          "email": "john.doe@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "phone": "+1234567890",
          "status": "active",
          "created_at": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "EMAIL_ALREADY_EXISTS",
          "message": "A customer with this email already exists"
        }
      }, null, 2)
    }
  },
  {
    name: 'Retrieve Customer',
    method: 'GET',
    path: '/api/v1/customers/{customer_uuid}',
    description: 'Retrieve details of a specific customer by UUID',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'retrieveCustomer',
    params: [
      {
        name: 'customer_uuid',
        type: 'string',
        required: true,
        description: 'Unique identifier for the customer',
        in: 'path',
        example: 'cust_12345678901234567890'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "customer_uuid": "cust_12345678901234567890",
          "email": "john.doe@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "phone": "+1234567890",
          "status": "active",
          "address": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "US"
          },
          "created_at": "2024-01-15T10:30:00Z",
          "updated_at": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "CUSTOMER_NOT_FOUND",
          "message": "Customer with the provided UUID was not found"
        }
      }, null, 2)
    }
  },
  // Bank Account APIs
  {
    name: 'Retrieve All Customer Bank Accounts',
    method: 'GET',
    path: '/api/v1/customers/{customer_uuid}/bank-accounts',
    description: 'Retrieve all bank accounts associated with a customer',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'retrieveCustomerBankAccounts',
    params: [
      {
        name: 'customer_uuid',
        type: 'string',
        required: true,
        description: 'Unique identifier for the customer',
        in: 'path',
        example: 'cust_12345678901234567890'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "bank_accounts": [
            {
              "account_uuid": "acc_09876543210987654321",
              "account_holder_name": "John Doe",
              "bank_name": "Chase Bank",
              "account_number": "****1234",
              "routing_number": "021000021",
              "account_type": "checking",
              "currency": "USD",
              "status": "verified",
              "created_at": "2024-01-15T10:30:00Z"
            }
          ]
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "CUSTOMER_NOT_FOUND",
          "message": "Customer with the provided UUID was not found"
        }
      }, null, 2)
    }
  },
  {
    name: 'Create Bank Account',
    method: 'POST',
    path: '/api/v1/customers/{customer_uuid}/bank-accounts',
    description: 'Add a new bank account for a customer',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createBankAccount',
    params: [
      {
        name: 'customer_uuid',
        type: 'string',
        required: true,
        description: 'Unique identifier for the customer',
        in: 'path',
        example: 'cust_12345678901234567890'
      }
    ],
    body: [
      {
        name: 'account_holder_name',
        type: 'string',
        required: true,
        description: 'Name on the bank account',
        example: 'John Doe'
      },
      {
        name: 'bank_name',
        type: 'string',
        required: true,
        description: 'Name of the bank',
        example: 'Chase Bank'
      },
      {
        name: 'account_number',
        type: 'string',
        required: true,
        description: 'Bank account number',
        example: '1234567890'
      },
      {
        name: 'routing_number',
        type: 'string',
        required: true,
        description: 'Bank routing number',
        example: '021000021'
      },
      {
        name: 'account_type',
        type: 'string',
        required: true,
        description: 'Type of bank account',
        enum: ['checking', 'savings']
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "account_uuid": "acc_09876543210987654321",
          "customer_uuid": "cust_12345678901234567890",
          "account_holder_name": "John Doe",
          "bank_name": "Chase Bank",
          "account_number": "****1234",
          "routing_number": "021000021",
          "account_type": "checking",
          "currency": "USD",
          "status": "pending_verification",
          "created_at": "2024-01-15T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_ACCOUNT_DETAILS",
          "message": "The provided bank account details are invalid"
        }
      }, null, 2)
    }
  },
  // Transfer APIs
  {
    name: 'Create Transfer',
    method: 'POST',
    path: '/api/v1/transfers',
    description: 'Create a new money transfer between accounts',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'createTransfer',
    body: [
      {
        name: 'source_account_uuid',
        type: 'string',
        required: true,
        description: 'UUID of the source bank account',
        example: 'acc_09876543210987654321'
      },
      {
        name: 'destination_account_uuid',
        type: 'string',
        required: true,
        description: 'UUID of the destination bank account',
        example: 'acc_12345678901234567890'
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Transfer amount in cents',
        example: 10000
      },
      {
        name: 'currency',
        type: 'string',
        required: true,
        description: 'Currency code (ISO 4217)',
        example: 'USD'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Optional transfer description',
        example: 'Payment for services'
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transfer_uuid": "xfer_11223344556677889900",
          "source_account_uuid": "acc_09876543210987654321",
          "destination_account_uuid": "acc_12345678901234567890",
          "amount": 10000,
          "currency": "USD",
          "description": "Payment for services",
          "status": "pending",
          "created_at": "2024-01-15T10:30:00Z",
          "estimated_completion": "2024-01-17T10:30:00Z"
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INSUFFICIENT_FUNDS",
          "message": "The source account has insufficient funds for this transfer"
        }
      }, null, 2)
    }
  },
  {
    name: 'List All Transfers',
    method: 'GET',
    path: '/api/v1/transfers',
    description: 'Retrieve a list of all transfers',
    baseUrl: 'https://api.worldapi.com',
    operationId: 'listAllTransfers',
    params: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of transfers to return (default: 10, max: 100)',
        in: 'query',
        example: '10'
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Number of transfers to skip (default: 0)',
        in: 'query',
        example: '0'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by transfer status',
        in: 'query',
        enum: ['pending', 'completed', 'failed', 'cancelled']
      }
    ],
    response: {
      success: JSON.stringify({
        "success": true,
        "data": {
          "transfers": [
            {
              "transfer_uuid": "xfer_11223344556677889900",
              "source_account_uuid": "acc_09876543210987654321",
              "destination_account_uuid": "acc_12345678901234567890",
              "amount": 10000,
              "currency": "USD",
              "description": "Payment for services",
              "status": "completed",
              "created_at": "2024-01-15T10:30:00Z",
              "completed_at": "2024-01-17T09:15:00Z"
            }
          ],
          "total": 1,
          "limit": 10,
          "offset": 0
        }
      }, null, 2),
      error: JSON.stringify({
        "success": false,
        "error": {
          "code": "INVALID_REQUEST",
          "message": "The request parameters are invalid"
        }
      }, null, 2)
    }
  }
];

export default worldApiEndpoints;
