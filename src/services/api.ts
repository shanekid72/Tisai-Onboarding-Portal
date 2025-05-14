import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as worldAPI from './worldAPI';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    status_code: statusCode,
    message
  });
};

// Get rates endpoint
app.get('/api/v1/world/get-rates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ratesResponse = await worldAPI.getRates();
    res.json(ratesResponse);
  } catch (error) {
    next(error);
  }
});

// Get quote endpoint
app.post('/api/v1/world/get-quote', async (req: Request, res: Response, next: NextFunction) => {
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

// Create transaction endpoint
app.post('/api/v1/world/create-transaction', async (req: Request, res: Response, next: NextFunction) => {
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

// Confirm transaction endpoint
app.post('/api/v1/world/confirm-transaction', async (req: Request, res: Response, next: NextFunction) => {
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

// Enquire transaction endpoint
app.get('/api/v1/world/enquire-transaction', async (req: Request, res: Response, next: NextFunction) => {
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

// Get codes endpoint
app.get('/api/v1/world/get-codes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceType = req.query.service_type as string || 'C2B';
    const codesResponse = await worldAPI.getCodes(serviceType);
    res.json(codesResponse);
  } catch (error) {
    next(error);
  }
});

// Get service corridor endpoint
app.get('/api/v1/world/get-service-corridor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const corridorResponse = await worldAPI.getServiceCorridor();
    res.json(corridorResponse);
  } catch (error) {
    next(error);
  }
});

// Get banks endpoint
app.get('/api/v1/world/get-banks', async (req: Request, res: Response, next: NextFunction) => {
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

// Get bank branches endpoint
app.get('/api/v1/world/get-bank-branches', async (req: Request, res: Response, next: NextFunction) => {
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

// Add test endpoint to verify integration
app.get('/api/v1/world/test-integration', async (req: Request, res: Response, next: NextFunction) => {
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

// Apply error handler
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 