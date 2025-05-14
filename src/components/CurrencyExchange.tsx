import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

interface Rate {
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
}

interface RatesResponse {
  status: string;
  status_code: number;
  data: {
    rates: Rate[];
    timestamp: string;
    expiry: string;
  };
}

const CurrencyExchange = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rates, setRates] = useState<Rate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('100');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch rates from the API
  const fetchRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would call your backend API
      // For now we'll use a simulated response based on the API structure
      const response = await axios.get<RatesResponse>('/api/v1/world/get-rates');
      
      if (response.data.status === 'success') {
        setRates(response.data.data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Set default conversion if amount is available
        if (amount) {
          const rate = response.data.data.rates.find(r => 
            r.to_currency === selectedCurrency && r.from_currency === 'AED'
          );
          
          if (rate) {
            const convertedValue = parseFloat(amount) * rate.rate;
            setConvertedAmount(convertedValue.toFixed(2));
          }
        }
      } else {
        setError('Failed to fetch rates data');
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to fetch exchange rates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [amount, selectedCurrency]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchRates();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchRates, 5 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchRates]);

  // Get the current exchange rate for the selected currency
  const currentRate = useMemo(() => {
    const rate = rates.find(r => 
      r.to_currency === selectedCurrency && r.from_currency === 'AED'
    );
    return rate?.rate || 0;
  }, [rates, selectedCurrency]);

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    if (value && !isNaN(parseFloat(value)) && currentRate) {
      const converted = parseFloat(value) * currentRate;
      setConvertedAmount(converted.toFixed(2));
    } else {
      setConvertedAmount('');
    }
  };

  // Handle converted amount change (for reverse calculation)
  const handleConvertedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConvertedAmount(value);
    
    if (value && !isNaN(parseFloat(value)) && currentRate) {
      const original = parseFloat(value) / currentRate;
      setAmount(original.toFixed(2));
    } else {
      setAmount('');
    }
  };

  // Handle currency selection change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    
    // Recalculate conversion
    if (amount && !isNaN(parseFloat(amount))) {
      const rate = rates.find(r => 
        r.to_currency === currency && r.from_currency === 'AED'
      );
      
      if (rate) {
        const converted = parseFloat(amount) * rate.rate;
        setConvertedAmount(converted.toFixed(2));
      }
    }
  };

  // Filter available currencies (distinct to_currency values)
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    rates.forEach(rate => {
      if (rate.from_currency === 'AED') {
        currencies.add(rate.to_currency);
      }
    });
    return Array.from(currencies);
  }, [rates]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Currency Exchange Calculator</h2>
      
      {/* Status */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {lastUpdated ? `Last updated: ${lastUpdated}` : ''}
        </div>
        <button 
          onClick={fetchRates}
          disabled={isLoading}
          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh Rates'}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Exchange form */}
      <div className="space-y-4">
        {/* From currency (AED) */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">From (AED)</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            className="p-2 border rounded"
            disabled={isLoading}
          />
        </div>
        
        {/* Exchange rate display */}
        <div className="text-center text-sm text-gray-600">
          {currentRate ? `1 AED = ${currentRate.toFixed(4)} ${selectedCurrency}` : 'Loading rates...'}
        </div>
        
        {/* To currency (selected) */}
        <div className="flex flex-col">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">To</label>
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="text-sm"
              disabled={isLoading || availableCurrencies.length === 0}
            >
              {availableCurrencies.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={convertedAmount}
            onChange={handleConvertedChange}
            placeholder="Converted amount"
            className="p-2 border rounded"
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Rates are indicative and subject to change. For actual transaction rates, 
        please proceed with a quote.
      </p>
    </div>
  );
};

export default CurrencyExchange; 