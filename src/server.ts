import express from 'express';
import cors from 'cors';
import * as worldAPI from './services/worldAPI';

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    status_code: statusCode,
    message
  });
});

// API Routes
// Get rates
app.get('/api/v1/world/get-rates', async (req, res, next) => {
  try {
    const ratesResponse = await worldAPI.getRates();
    res.json(ratesResponse);
  } catch (error) {
    next(error);
  }
});

// Get quote
app.post('/api/v1/world/get-quote', async (req, res, next) => {
  try {
    const {
      sendingCountryCode,
      sendingCurrencyCode,
      receivingCountryCode,
      receivingCurrencyCode,
      sendingAmount,
      receivingMode,
      type,
      instrument
    } = req.body;

    // Validate required fields
    if (!sendingCountryCode || !sendingCurrencyCode || !receivingCountryCode || 
        !receivingCurrencyCode || !sendingAmount || !receivingMode || !type || !instrument) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Missing required fields for quote'
      });
    }

    const quoteResponse = await worldAPI.getQuote(
      sendingCountryCode,
      sendingCurrencyCode,
      receivingCountryCode,
      receivingCurrencyCode,
      sendingAmount,
      receivingMode,
      type,
      instrument
    );

    res.json(quoteResponse);
  } catch (error) {
    next(error);
  }
});

// Create transaction
app.post('/api/v1/world/create-transaction', async (req, res, next) => {
  try {
    const {
      quoteId,
      type,
      sourceOfIncome,
      purposeOfTxn,
      instrument,
      message,
      senderCustomerNumber,
      receiverData
    } = req.body;

    // Validate required fields
    if (!quoteId || !type || !sourceOfIncome || !purposeOfTxn || !instrument || 
        !message || !senderCustomerNumber || !receiverData) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Missing required fields for transaction creation'
      });
    }

    const createResponse = await worldAPI.createTransaction(
      quoteId,
      type,
      sourceOfIncome,
      purposeOfTxn,
      instrument,
      message,
      senderCustomerNumber,
      receiverData
    );

    res.json(createResponse);
  } catch (error) {
    next(error);
  }
});

// Confirm transaction
app.post('/api/v1/world/confirm-transaction', async (req, res, next) => {
  try {
    const { transactionRefNumber } = req.body;

    // Validate required fields
    if (!transactionRefNumber) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Transaction reference number is required'
      });
    }

    const confirmResponse = await worldAPI.confirmTransaction(transactionRefNumber);
    res.json(confirmResponse);
  } catch (error) {
    next(error);
  }
});

// Enquire transaction
app.get('/api/v1/world/enquire-transaction', async (req, res, next) => {
  try {
    const transactionRefNumber = req.query.transaction_ref_number as string;

    // Validate required fields
    if (!transactionRefNumber) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Transaction reference number is required'
      });
    }

    const enquireResponse = await worldAPI.enquireTransaction(transactionRefNumber);
    res.json(enquireResponse);
  } catch (error) {
    next(error);
  }
});

// Get codes
app.get('/api/v1/world/get-codes', async (req, res, next) => {
  try {
    const serviceType = req.query.service_type as string || 'C2B';
    const codesResponse = await worldAPI.getCodes(serviceType);
    res.json(codesResponse);
  } catch (error) {
    next(error);
  }
});

// Get service corridor
app.get('/api/v1/world/get-service-corridor', async (req, res, next) => {
  try {
    const corridorResponse = await worldAPI.getServiceCorridor();
    res.json(corridorResponse);
  } catch (error) {
    next(error);
  }
});

// Get banks
app.get('/api/v1/world/get-banks', async (req, res, next) => {
  try {
    const receivingMode = req.query.receiving_mode as string;
    const receivingCountryCode = req.query.receiving_country_code as string;

    // Validate required fields
    if (!receivingMode || !receivingCountryCode) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Receiving mode and country code are required'
      });
    }

    const banksResponse = await worldAPI.getBanks(receivingMode, receivingCountryCode);
    res.json(banksResponse);
  } catch (error) {
    next(error);
  }
});

// Get bank branches
app.get('/api/v1/world/get-bank-branches', async (req, res, next) => {
  try {
    const bankId = req.query.bank_id as string;
    const correspondent = req.query.correspondent as string;
    const receivingMode = req.query.receiving_mode as string;
    const receivingCountryCode = req.query.receiving_country_code as string;

    // Validate required fields
    if (!bankId || !correspondent || !receivingMode || !receivingCountryCode) {
      return res.status(400).json({
        status: 'error',
        status_code: 400,
        message: 'Bank ID, correspondent, receiving mode, and country code are required'
      });
    }

    const branchesResponse = await worldAPI.getBankBranches(
      bankId,
      correspondent,
      receivingMode,
      receivingCountryCode
    );
    
    res.json(branchesResponse);
  } catch (error) {
    next(error);
  }
});

// Test integration
app.get('/api/v1/world/test-integration', async (req, res, next) => {
  try {
    const testResults = {
      status: 'success',
      status_code: 200,
      tests: [] as any[]
    };

    // Test authentication
    try {
      const token = await worldAPI.getAuthToken();
      testResults.tests.push({
        name: 'Authentication',
        status: 'success',
        message: 'Successfully obtained authentication token'
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Authentication',
        status: 'failed',
        message: error.message || 'Failed to obtain authentication token'
      });
    }

    // Test getting rates
    try {
      const rates = await worldAPI.getRates();
      testResults.tests.push({
        name: 'Get Rates',
        status: 'success',
        message: 'Successfully retrieved rates',
        data: {
          count: rates.data.rates.length,
          sample: rates.data.rates.slice(0, 2)
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Get Rates',
        status: 'failed',
        message: error.message || 'Failed to retrieve rates'
      });
    }

    // Return test results
    res.json(testResults);
  } catch (error) {
    next(error);
  }
});

// Start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`WorldAPI server listening on port ${port}`);
  });
}

export default app; 