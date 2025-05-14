import axios from 'axios';

// Define types for API responses
export interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
}

export interface QuoteResponse {
  status: string;
  status_code: number;
  data: {
    state: string;
    sub_state: string;
    quote_id: string;
    created_at: string;
    created_at_gmt: string;
    expires_at: string;
    expires_at_gmt: string;
    receiving_country_code: string;
    receiving_currency_code: string;
    sending_country_code: string;
    sending_currency_code: string;
    sending_amount: number;
    receiving_amount: number;
    total_payin_amount: number;
    fx_rates: Array<{
      rate: number;
      type: string;
      base_currency_code: string;
      counter_currency_code: string;
    }>;
    fee_details: Array<{
      type: string;
      model: string;
      amount: number;
      description: string;
      currency_code: string;
    }>;
  };
}

export interface CreateTransactionResponse {
  status: string;
  status_code: number;
  data: {
    state: string;
    sub_state: string;
    transaction_ref_number: string;
    transaction_date: string;
    transaction_gmt_date: string;
    expires_at: string;
    expires_at_gmt: string;
    receiving_country_code: string;
    receiving_currency_code: string;
    sending_country_code: string;
    sending_currency_code: string;
    sending_amount: number;
    receiving_amount: number;
    total_payin_amount: number;
    fx_rates: Array<{
      rate: number;
      type: string;
      base_currency_code: string;
      counter_currency_code: string;
    }>;
    fee_details: Array<{
      type: string;
      model: string;
      amount: number;
      description: string;
      currency_code: string;
    }>;
  };
}

export interface ConfirmTransactionResponse {
  status: string;
  status_code: number;
  data: {
    state: string;
    sub_state: string;
    transaction_ref_number: string;
  };
}

export interface EnquireTransactionResponse {
  status: string;
  status_code: number;
  data: {
    state: string;
    sub_state: string;
    transaction_gmt_date: string;
    transaction_date: string;
    type: string;
    instrument: string;
    source_of_income: string;
    purpose_of_txn: string;
    message: string;
    sender: {
      customer_number: string;
      first_name: string;
      last_name: string;
      mobile_number: string;
    };
    receiver: {
      mobile_number: string;
      first_name: string;
      last_name: string;
      nationality: string;
      relation_code: string;
      bank_details: {
        account_type: string;
        account_num: string;
        routing_code: string;
      };
    };
    transaction: {
      transaction_ref_number: string;
      receiving_mode: string;
      sending_country_code: string;
      receiving_country_code: string;
      sending_currency_code: string;
      receiving_currency_code: string;
      sending_amount: number;
      receiving_amount: number;
      total_payin_amount: number;
    };
  };
}

export interface RatesResponse {
  status: string;
  status_code: number;
  data: {
    rates: Array<{
      rate: number;
      type: string;
      from_currency: string;
      to_currency: string;
      from_country: string;
      to_country: string;
      from_currency_name: string;
      to_currency_name: string;
      from_country_name: string;
      to_country_name: string;
      receiving_mode: string;
    }>;
    timestamp: string;
    expiry: string;
  };
}

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://drap-sandbox.digitnine.com',
  AUTH_ENDPOINT: '/auth/realms/cdp/protocol/openid-connect/token',
  QUOTE_ENDPOINT: '/amr/ras/api/v1_0/ras/quote',
  CREATE_TRANSACTION_ENDPOINT: '/amr/ras/api/v1_0/ras/createtransaction',
  CONFIRM_TRANSACTION_ENDPOINT: '/amr/ras/api/v1_0/ras/confirmtransaction',
  ENQUIRE_TRANSACTION_ENDPOINT: '/amr/ras/api/v1_0/ras/enquire-transaction',
  RATES_ENDPOINT: '/raas/masters/v1/rates',
  CODES_ENDPOINT: '/raas/masters/v1/codes',
  SERVICE_CORRIDOR_ENDPOINT: '/raas/masters/v1/service-corridor',
  BANKS_ENDPOINT: '/raas/masters/v1/banks',
  BANK_BRANCHES_ENDPOINT: '/raas/masters/v1/banks',
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'sender': 'careemd9ps',
    'channel': 'Direct',
    'company': '784100',
    'branch': '784804'
  }
};

// Auth credentials
const AUTH_CREDENTIALS = {
  username: 'careemwallet',
  password: 'Q2FyZWVtV2FsbGV0QDc4NmFkbWlu',
  grant_type: 'password',
  client_id: 'cdp_app',
  client_secret: 'mSh18BPiMZeQqFfOvWhgv8wzvnNVbj3Y'
};

let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

// Get authentication token
export const getAuthToken = async (): Promise<string> => {
  // Check if token is already cached and valid
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}`,
      new URLSearchParams({
        username: AUTH_CREDENTIALS.username,
        password: AUTH_CREDENTIALS.password,
        grant_type: AUTH_CREDENTIALS.grant_type,
        client_id: AUTH_CREDENTIALS.client_id,
        client_secret: AUTH_CREDENTIALS.client_secret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Cache the token and set expiry time (subtract 60 seconds for safety margin)
    cachedToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in - 60) * 1000;
    
    return cachedToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to get authentication token');
  }
};

// Helper function to get authorization headers
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    ...API_CONFIG.HEADERS,
    'Authorization': `Bearer ${token}`
  };
};

// Get exchange rate quote
export const getQuote = async (
  sendingCountryCode: string,
  sendingCurrencyCode: string,
  receivingCountryCode: string,
  receivingCurrencyCode: string,
  sendingAmount: number,
  receivingMode: string,
  type: string,
  instrument: string
): Promise<QuoteResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<QuoteResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.QUOTE_ENDPOINT}`,
      {
        sending_country_code: sendingCountryCode,
        sending_currency_code: sendingCurrencyCode,
        receiving_country_code: receivingCountryCode,
        receiving_currency_code: receivingCurrencyCode,
        sending_amount: sendingAmount,
        receiving_mode: receivingMode,
        type: type,
        instrument: instrument
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw new Error('Failed to get quote');
  }
};

// Create transaction
export const createTransaction = async (
  quoteId: string,
  type: string,
  sourceOfIncome: string,
  purposeOfTxn: string,
  instrument: string,
  message: string,
  senderCustomerNumber: string,
  receiverData: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    relationCode: string;
    nationality: string;
    receiverAddress: Array<{
      addressType: string;
      addressLine: string;
      streetName: string;
      buildingNumber: string;
      postCode: string;
      pobox: string;
      townName: string;
      countrySubdivision: string;
      countryCode: string;
    }>;
    bankDetails: {
      accountTypeCode: string;
      accountNumber: string;
      routingCode: string;
      correspondentId: string;
      correspondentLocationId: string;
    };
  }
): Promise<CreateTransactionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<CreateTransactionResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.CREATE_TRANSACTION_ENDPOINT}`,
      {
        type,
        source_of_income: sourceOfIncome,
        purpose_of_txn: purposeOfTxn,
        instrument,
        message,
        sender: {
          customer_number: senderCustomerNumber
        },
        receiver: {
          mobile_number: receiverData.mobileNumber,
          first_name: receiverData.firstName,
          last_name: receiverData.lastName,
          relation_code: receiverData.relationCode,
          nationality: receiverData.nationality,
          receiver_address: receiverData.receiverAddress.map(address => ({
            address_type: address.addressType,
            address_line: address.addressLine,
            street_name: address.streetName,
            building_number: address.buildingNumber,
            post_code: address.postCode,
            pobox: address.pobox,
            town_name: address.townName,
            country_subdivision: address.countrySubdivision,
            country_code: address.countryCode
          })),
          bank_details: {
            account_type_code: receiverData.bankDetails.accountTypeCode,
            account_number: receiverData.bankDetails.accountNumber,
            routing_code: receiverData.bankDetails.routingCode,
            correspondent_id: receiverData.bankDetails.correspondentId,
            correspondent_location_id: receiverData.bankDetails.correspondentLocationId
          }
        },
        transaction: {
          quote_id: quoteId,
          agent_transaction_ref_number: quoteId // Using quote ID as transaction ref for simplicity
        }
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

// Confirm transaction
export const confirmTransaction = async (transactionRefNumber: string): Promise<ConfirmTransactionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<ConfirmTransactionResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.CONFIRM_TRANSACTION_ENDPOINT}`,
      {
        transaction_ref_number: transactionRefNumber
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    throw new Error('Failed to confirm transaction');
  }
};

// Enquire transaction
export const enquireTransaction = async (transactionRefNumber: string): Promise<EnquireTransactionResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<EnquireTransactionResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENQUIRE_TRANSACTION_ENDPOINT}?transaction_ref_number=${transactionRefNumber}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error enquiring transaction:', error);
    throw new Error('Failed to enquire transaction');
  }
};

// Get rates
export const getRates = async (): Promise<RatesResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get<RatesResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RATES_ENDPOINT}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting rates:', error);
    throw new Error('Failed to get rates');
  }
};

// Get codes
export const getCodes = async (serviceType: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.CODES_ENDPOINT}?service_type=${serviceType}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting codes:', error);
    throw new Error('Failed to get codes');
  }
};

// Get service corridor
export const getServiceCorridor = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.SERVICE_CORRIDOR_ENDPOINT}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting service corridor:', error);
    throw new Error('Failed to get service corridor');
  }
};

// Get banks
export const getBanks = async (receivingMode: string, receivingCountryCode: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.BANKS_ENDPOINT}?receiving_mode=${receivingMode}&receiving_country_code=${receivingCountryCode}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting banks:', error);
    throw new Error('Failed to get banks');
  }
};

// Get bank branches
export const getBankBranches = async (
  bankId: string,
  correspondent: string,
  receivingMode: string,
  receivingCountryCode: string
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.BANK_BRANCHES_ENDPOINT}/${bankId}/branches?correspondent=${correspondent}&receiving_mode=${receivingMode}&receiving_country_code=${receivingCountryCode}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting bank branches:', error);
    throw new Error('Failed to get bank branches');
  }
}; 