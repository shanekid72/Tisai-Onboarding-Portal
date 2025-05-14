# WorldAPI Integration

This directory contains the integration with the WorldAPI for currency exchange and money transfer services.

## API Services

The `worldAPI.ts` file provides a TypeScript wrapper around the WorldAPI endpoints, handling authentication, request formatting, and response parsing. It includes the following services:

- **Authentication** - Handles token acquisition and caching
- **Quote API** - Fetch exchange rates for a transaction
- **Create Transaction** - Create a new money transfer transaction
- **Confirm Transaction** - Confirm a previously created transaction
- **Enquire Transaction** - Check the status of a transaction
- **Rates API** - Get current exchange rates
- **Codes API** - Get service type codes and reference data
- **Service Corridor API** - Get service and corridor details
- **Banks API** - Get list of banks for a country
- **Bank Branches API** - Get list of branches for a bank

## Integration Flow

The typical integration flow for a money transfer involves:

1. **Get authentication token** - Automatically handled by the service
2. **Get rates** - To display available currencies and rates
3. **Get quote** - To get the exact rate for a specific transaction amount
4. **Create transaction** - Create the transaction with sender and receiver details
5. **Confirm transaction** - Finalize the transaction
6. **Enquire transaction** - Check status (optional)

## Server Integration

The API is exposed through an Express server in `server.ts`, providing REST endpoints for front-end integration:

- `GET /api/v1/world/get-rates` - Get current exchange rates
- `POST /api/v1/world/get-quote` - Get exchange rate quote
- `POST /api/v1/world/create-transaction` - Create a new transaction
- `POST /api/v1/world/confirm-transaction` - Confirm a transaction
- `GET /api/v1/world/enquire-transaction` - Check transaction status
- `GET /api/v1/world/get-codes` - Get reference codes
- `GET /api/v1/world/get-service-corridor` - Get service corridor details
- `GET /api/v1/world/get-banks` - Get banks for a country
- `GET /api/v1/world/get-bank-branches` - Get branches for a bank
- `GET /api/v1/world/test-integration` - Test the integration

## Frontend Integration

The React component in `components/CurrencyExchange.tsx` provides a user interface for:

- Displaying current exchange rates
- Converting between currencies
- Updating rates in real-time

## Environment Configuration

The WorldAPI requires certain credentials to be configured:

```
BASE_URL=https://drap-sandbox.digitnine.com
USERNAME=careemwallet
PASSWORD=Q2FyZWVtV2FsbGV0QDc4NmFkbWlu
CLIENT_ID=cdp_app
CLIENT_SECRET=mSh18BPiMZeQqFfOvWhgv8wzvnNVbj3Y
SENDER=careemd9ps
CHANNEL=Direct
COMPANY=784100
BRANCH=784804
```

## API Headers

All WorldAPI requests require the following headers:

```
Content-Type: application/json
Accept: application/json
sender: careemd9ps
channel: Direct
company: 784100
branch: 784804
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Sample Requests

### Get Quote

```javascript
const quoteResponse = await axios.post('/api/v1/world/get-quote', {
  sendingCountryCode: 'AE',
  sendingCurrencyCode: 'AED',
  receivingCountryCode: 'IN',
  receivingCurrencyCode: 'INR',
  sendingAmount: 100,
  receivingMode: 'BANK',
  type: 'SEND',
  instrument: 'REMITTANCE'
});
```

### Create Transaction

```javascript
const createResponse = await axios.post('/api/v1/world/create-transaction', {
  quoteId: '1279125112953313',
  type: 'SEND',
  sourceOfIncome: 'SLRY',
  purposeOfTxn: 'SAVG',
  instrument: 'REMITTANCE',
  message: 'Test transaction',
  senderCustomerNumber: '7842417396411031',
  receiverData: {
    mobileNumber: '+919586741508',
    firstName: 'John',
    lastName: 'Doe',
    relationCode: '32',
    nationality: 'IN',
    receiverAddress: [{
      addressType: 'PRESENT',
      addressLine: 'Main St',
      streetName: 'MG ROAD',
      buildingNumber: 'MP-20',
      postCode: '9054',
      pobox: '658595',
      townName: 'THRISSUR',
      countrySubdivision: 'POTA',
      countryCode: 'IN'
    }],
    bankDetails: {
      accountTypeCode: '1',
      accountNumber: '34572443993',
      routingCode: 'SBIN0004069',
      correspondentId: '10078',
      correspondentLocationId: '516173'
    }
  }
});
```

### Confirm Transaction

```javascript
const confirmResponse = await axios.post('/api/v1/world/confirm-transaction', {
  transactionRefNumber: '1279125112953313'
});
```

## Error Handling

The integration includes error handling for:

- Authentication failures
- Connection issues
- Validation errors
- API response errors

Each API function returns a Promise that will reject with a descriptive error if the request fails. 