import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define types for the data needed in the process
type QuoteData = {
  quote_id: string;
  sending_amount: string;
  sending_currency_code: string;
  receiving_currency_code: string;
  exchange_rate: string;
};

type TransactionData = {
  transaction_ref_number: string;
  first_name: string;
  mobile_number: string;
  account_number: string;
};

type Stage = 'quote' | 'transaction' | 'confirm' | 'enquire';

const SendMoneyPage = () => {
  // State for managing the multi-stage process
  const [stage, setStage] = useState<Stage>('quote');
  const [sendingAmount, setSendingAmount] = useState('');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isCashCollected, setIsCashCollected] = useState(false);
  const [enquireResponse, setEnquireResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sample currency codes for demo
  const sendingCurrencyCode = 'USD';
  const receivingCurrencyCode = 'INR';

  // Mock API call to create a quote
  const handleCreateQuote = async () => {
    if (!sendingAmount || parseFloat(sendingAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      setTimeout(() => {
        const mockQuoteData: QuoteData = {
          quote_id: `QT-${Math.floor(Math.random() * 1000000)}`,
          sending_amount: sendingAmount,
          sending_currency_code: sendingCurrencyCode,
          receiving_currency_code: receivingCurrencyCode,
          exchange_rate: (74.5 + (Math.random() * 2)).toFixed(2),
        };
        
        setQuoteData(mockQuoteData);
        setIsLoading(false);
        setStage('transaction');
      }, 1500);
    } catch (err) {
      setError('Failed to create quote. Please try again.');
      setIsLoading(false);
    }
  };

  // Mock API call to create a transaction
  const handleCreateTransaction = async () => {
    if (!receiverName || !mobileNumber || !accountNumber) {
      setError('Please fill all the required fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      setTimeout(() => {
        const mockTransactionData: TransactionData = {
          transaction_ref_number: `TX-${Math.floor(Math.random() * 1000000)}`,
          first_name: receiverName,
          mobile_number: mobileNumber,
          account_number: accountNumber,
        };
        
        setTransactionData(mockTransactionData);
        setIsLoading(false);
        setStage('confirm');
      }, 1500);
    } catch (err) {
      setError('Failed to create transaction. Please try again.');
      setIsLoading(false);
    }
  };

  // Mock API call to confirm transaction
  const handleConfirmTransaction = async () => {
    if (!isCashCollected) {
      setError('Please confirm that cash has been collected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      setTimeout(() => {
        setIsLoading(false);
        setStage('enquire');
      }, 1000);
    } catch (err) {
      setError('Failed to confirm transaction. Please try again.');
      setIsLoading(false);
    }
  };

  // Mock API call to enquire transaction status
  const handleEnquireTransaction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call
      setTimeout(() => {
        const mockResponse = {
          status: 'COMPLETED',
          transaction_ref_number: transactionData?.transaction_ref_number,
          created_at: new Date().toISOString(),
          currency_pair: `${sendingCurrencyCode}/${receivingCurrencyCode}`,
          sending_amount: quoteData?.sending_amount,
          receiving_amount: (parseFloat(quoteData?.sending_amount || '0') * parseFloat(quoteData?.exchange_rate || '0')).toFixed(2),
          beneficiary: {
            name: receiverName,
            account_number: accountNumber,
            mobile: mobileNumber
          }
        };
        
        setEnquireResponse(mockResponse);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to enquire transaction status. Please try again.');
      setIsLoading(false);
    }
  };

  // Progress indicator based on current stage
  const getProgress = () => {
    switch (stage) {
      case 'quote': return 25;
      case 'transaction': return 50;
      case 'confirm': return 75;
      case 'enquire': return 100;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Page header */}
      <header className="pt-32 pb-8 relative overflow-hidden text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Send Money
          </span>
        </h1>
        
        <p className="text-lg text-white/70 max-w-3xl mx-auto">
          Fast, secure, and affordable money transfers. Send money to your loved ones in just a few steps.
        </p>
      </header>
      
      {/* Progress bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="h-2 bg-gray-800 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <div className={stage === 'quote' ? 'text-blue-400' : ''}>Create Quote</div>
          <div className={stage === 'transaction' ? 'text-blue-400' : ''}>Create Transaction</div>
          <div className={stage === 'confirm' ? 'text-blue-400' : ''}>Confirm Transaction</div>
          <div className={stage === 'enquire' ? 'text-blue-400' : ''}>Enquire Status</div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Error message if any */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {/* Stage 1: Create Quote */}
          {stage === 'quote' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Create Quote</h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="text-gray-400">Sending Currency:</span>
                    <span className="ml-2 text-white">{sendingCurrencyCode}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Receiving Currency:</span>
                    <span className="ml-2 text-white">{receivingCurrencyCode}</span>
                  </div>
                </div>
                
                <label className="block mb-2 text-gray-300">Sending Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {sendingCurrencyCode}
                  </span>
                  <input
                    type="number"
                    value={sendingAmount}
                    onChange={(e) => setSendingAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
              
              <button
                onClick={handleCreateQuote}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-700/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Quote...
                  </span>
                ) : 'Create Quote'}
              </button>
            </motion.div>
          )}
          
          {/* Stage 2: Create Transaction */}
          {stage === 'transaction' && quoteData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400">Create Transaction</h2>
              
              <div className="p-4 bg-gray-800/70 rounded-lg mb-6 text-sm">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-gray-400">Quote ID:</span>
                    <span className="ml-2 text-white">{quoteData.quote_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="ml-2 text-white">{quoteData.sending_amount} {quoteData.sending_currency_code}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Exchange Rate:</span>
                    <span className="ml-2 text-white">1 {quoteData.sending_currency_code} = {quoteData.exchange_rate} {quoteData.receiving_currency_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Receiving Amount:</span>
                    <span className="ml-2 text-white">{(parseFloat(quoteData.sending_amount) * parseFloat(quoteData.exchange_rate)).toFixed(2)} {quoteData.receiving_currency_code}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-2 text-gray-300">Receiver Name</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Enter receiver's name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-300">Mobile Number</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-300">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>
              </div>
              
              <button
                onClick={handleCreateTransaction}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-700/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Transaction...
                  </span>
                ) : 'Create Transaction'}
              </button>
            </motion.div>
          )}
          
          {/* Stage 3: Confirm Transaction */}
          {stage === 'confirm' && transactionData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center text-green-400">Confirm Transaction</h2>
              
              <div className="p-4 bg-gray-800/70 rounded-lg mb-6">
                <div className="text-lg font-medium text-gray-300 mb-2">Transaction Reference Number:</div>
                <div className="text-xl font-mono bg-gray-950 p-3 rounded border border-gray-700 text-green-400 mb-4">
                  {transactionData.transaction_ref_number}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Receiver Name:</span>
                    <span className="ml-2 text-white">{transactionData.first_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Mobile Number:</span>
                    <span className="ml-2 text-white">{transactionData.mobile_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Account Number:</span>
                    <span className="ml-2 text-white">{transactionData.account_number}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCashCollected}
                    onChange={(e) => setIsCashCollected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-lg font-semibold text-white">Cash collected</span>
                </label>
              </div>
              
              <button
                onClick={handleConfirmTransaction}
                disabled={isLoading || !isCashCollected}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isLoading || !isCashCollected
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg hover:shadow-green-700/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming Transaction...
                  </span>
                ) : 'Confirm Transaction'}
              </button>
            </motion.div>
          )}
          
          {/* Stage 4: Enquire Transaction */}
          {stage === 'enquire' && transactionData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-400">Enquire Transaction Status</h2>
              
              <div className="p-4 bg-gray-800/70 rounded-lg mb-6">
                <div className="text-gray-300 mb-2">Transaction Reference Number:</div>
                <div className="text-xl font-mono bg-gray-950 p-3 rounded border border-gray-700 text-green-400 mb-4">
                  {transactionData.transaction_ref_number}
                </div>
              </div>
              
              {!enquireResponse ? (
                <button
                  onClick={handleEnquireTransaction}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    isLoading 
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-700/20'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enquiring Transaction Status...
                    </span>
                  ) : 'Check Transaction Status'}
                </button>
              ) : (
                <div className="mt-4">
                  <div className="mb-4 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center px-4 py-2 bg-green-900/30 text-green-400 text-lg font-medium rounded-full border border-green-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {enquireResponse.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-800/70 rounded-lg p-4 text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-400">Date/Time:</div>
                      <div className="text-white">{new Date(enquireResponse.created_at).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-400">Currency Pair:</div>
                      <div className="text-white">{enquireResponse.currency_pair}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-400">Sending Amount:</div>
                      <div className="text-white">{enquireResponse.sending_amount} {sendingCurrencyCode}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-400">Receiving Amount:</div>
                      <div className="text-white">{enquireResponse.receiving_amount} {receivingCurrencyCode}</div>
                    </div>
                    <div className="border-t border-gray-700 my-2 pt-2">
                      <div className="text-gray-300 font-medium mb-2">Beneficiary Details:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Name:</div>
                        <div className="text-white">{enquireResponse.beneficiary.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Account Number:</div>
                        <div className="text-white">{enquireResponse.beneficiary.account_number}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">Mobile:</div>
                        <div className="text-white">{enquireResponse.beneficiary.mobile}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        // Reset the form to start a new transaction
                        setStage('quote');
                        setSendingAmount('');
                        setQuoteData(null);
                        setTransactionData(null);
                        setReceiverName('');
                        setMobileNumber('');
                        setAccountNumber('');
                        setIsCashCollected(false);
                        setEnquireResponse(null);
                        setError(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg transition-all"
                    >
                      Start New Transaction
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SendMoneyPage; 