import { ApiEndpoint, ApiParameter } from '../types/documentation';

/**
 * Parse the DRAP OpenAPI YAML specifically
 * Simplified parser for the DRAP API structure
 */
export const parseDrapApiSpec = (): ApiEndpoint[] => {
  // Hard-coded DRAP API endpoints based on your YAML file
  // This ensures reliable parsing until we get a proper YAML parser
  
  const endpoints: ApiEndpoint[] = [
    {
      name: 'Create Quote',
      method: 'POST',
      path: '/amr/ras/api/v1_0/ras/quote',
      description: 'Lock exchange rate and fee for a payment transaction.',
      baseUrl: 'https://drap.digitnine.com',
      operationId: 'createQuote',
      body: [
        {
          name: 'sending_country_code',
          type: 'string',
          required: true,
          description: 'Country code where money is being sent from'
        },
        {
          name: 'sending_currency_code',
          type: 'string',
          required: true,
          description: 'Currency code of the sending amount'
        },
        {
          name: 'receiving_country_code',
          type: 'string',
          required: true,
          description: 'Country code where money is being sent to'
        },
        {
          name: 'receiving_currency_code',
          type: 'string',
          required: true,
          description: 'Currency code of the receiving amount'
        },
        {
          name: 'sending_amount',
          type: 'number',
          required: true,
          description: 'Amount to be sent'
        },
        {
          name: 'receiving_mode',
          type: 'string',
          required: true,
          description: 'Method of receiving payment (e.g., Bank, Cash)'
        },
        {
          name: 'type',
          type: 'string',
          required: true,
          description: 'Transaction type'
        },
        {
          name: 'instrument',
          type: 'string',
          required: true,
          description: 'Payment instrument'
        }
      ],
      response: {
        success: JSON.stringify({
          "status": "success",
          "data": {
            "quote_id": "quote_12345",
            "exchange_rate": 1.25,
            "fee": 5.00,
            "total_amount": 105.00,
            "expires_at": "2024-12-31T23:59:59Z"
          }
        }, null, 2),
        error: JSON.stringify({
          "status": "error",
          "message": "Invalid parameters provided"
        }, null, 2)
      }
    },
    {
      name: 'Create Transaction',
      method: 'POST',
      path: '/amr/ras/api/v1_0/ras/createtransaction',
      description: 'Creates a payment order using quote and sender/receiver info.',
      baseUrl: 'https://drap.digitnine.com',
      operationId: 'createTransaction',
      body: [
        {
          name: 'quote_id',
          type: 'string',
          required: true,
          description: 'Quote ID from the previous quote request'
        },
        {
          name: 'sender_name',
          type: 'string',
          required: true,
          description: 'Full name of the sender'
        },
        {
          name: 'sender_address',
          type: 'string',
          required: true,
          description: 'Address of the sender'
        },
        {
          name: 'sender_phone',
          type: 'string',
          required: true,
          description: 'Phone number of the sender'
        },
        {
          name: 'receiver_name',
          type: 'string',
          required: true,
          description: 'Full name of the receiver'
        },
        {
          name: 'receiver_address',
          type: 'string',
          required: true,
          description: 'Address of the receiver'
        },
        {
          name: 'receiver_phone',
          type: 'string',
          required: true,
          description: 'Phone number of the receiver'
        }
      ],
      response: {
        success: JSON.stringify({
          "status": "success",
          "data": {
            "transaction_id": "txn_67890",
            "transaction_ref_number": "TXN-REF-12345",
            "status": "pending_confirmation"
          }
        }, null, 2),
        error: JSON.stringify({
          "status": "error",
          "message": "Transaction creation failed"
        }, null, 2)
      }
    },
    {
      name: 'Confirm Transaction',
      method: 'POST',
      path: '/amr/ras/api/v1_0/ras/confirmtransaction',
      description: 'Confirms a previously created transaction.',
      baseUrl: 'https://drap.digitnine.com',
      operationId: 'confirmTransaction',
      body: [
        {
          name: 'transaction_ref_number',
          type: 'string',
          required: true,
          description: 'Transaction reference number from create transaction response'
        }
      ],
      response: {
        success: JSON.stringify({
          "status": "success",
          "data": {
            "transaction_id": "txn_67890",
            "status": "confirmed",
            "confirmation_number": "CONF-98765"
          }
        }, null, 2),
        error: JSON.stringify({
          "status": "error",
          "message": "Transaction confirmation failed"
        }, null, 2)
      }
    }
  ];

  return endpoints;
};

export default parseDrapApiSpec;
