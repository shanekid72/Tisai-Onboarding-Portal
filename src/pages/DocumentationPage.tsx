import { useState, useEffect, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ApiEndpoint } from '../types/documentation';
import { parseWorldAPISpec, ApiCategory } from '../utils/worldApiParser';
import { executeApiTest, validateApiRequest, formatApiResponse, ApiTestRequest } from '../services/apiTester';

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'api'>('api');
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('curl');
  const [apiKey, setApiKey] = useState<string>('YOUR_API_KEY');
  
  // API Testing State
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, any>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [testResponse, setTestResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorldAPIEndpoints();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.querySelectorAll('.fade-in'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
      );
    }
  }, [selectedEndpoint]);

  const loadWorldAPIEndpoints = async () => {
    try {
      const categories = parseWorldAPISpec();
      setApiCategories(categories);
      
      if (categories.length > 0) {
        setSelectedCategory(categories[0].name);
        if (categories[0].endpoints.length > 0) {
          handleSelectEndpoint(categories[0].endpoints[0]);
        }
      }
    } catch (error) {
      console.error('Error loading WorldAPI spec:', error);
      setApiCategories([]);
    }
  };

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setPathParams({});
    setQueryParams({});
    setBodyParams({});
    setHeaders({ 'Authorization': `Bearer ${apiKey}` });
    setTestResponse('');
    setValidationErrors([]);
  };

  const handleTestApi = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setValidationErrors([]);

    const request: ApiTestRequest = {
      endpoint: selectedEndpoint,
      pathParams,
      queryParams,
      body: bodyParams,
      headers: { ...headers, 'Authorization': `Bearer ${apiKey}` }
    };

    const validation = validateApiRequest(request);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await executeApiTest(request);
      setTestResponse(formatApiResponse(response));
    } catch (error) {
      setTestResponse(JSON.stringify({
        error: 'Request failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeExample = (endpoint: ApiEndpoint, language: string): string => {
    const baseUrl = endpoint.baseUrl || 'https://api.worldapi.com';
    let url = `${baseUrl}${endpoint.path}`;
    
    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });

    // Add query parameters
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    switch (language) {
      case 'curl':
        let curlCommand = `curl -X ${endpoint.method} "${url}" \\\n`;
        curlCommand += `  -H "Authorization: Bearer ${apiKey}" \\\n`;
        curlCommand += `  -H "Content-Type: application/json"`;
        
        if (endpoint.method !== 'GET' && Object.keys(bodyParams).length > 0) {
          curlCommand += ` \\\n  -d '${JSON.stringify(bodyParams, null, 2)}'`;
        }
        
        return curlCommand;

      case 'javascript':
        return `const response = await fetch('${url}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }${endpoint.method !== 'GET' && Object.keys(bodyParams).length > 0 ? `,
  body: JSON.stringify(${JSON.stringify(bodyParams, null, 2)})` : ''}
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests

url = "${url}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
${endpoint.method !== 'GET' && Object.keys(bodyParams).length > 0 ? `
data = ${JSON.stringify(bodyParams, null, 2)}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)` : `
response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}
print(response.json())`;

      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker text-white">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            WorldAPI Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive API documentation for Payments as a Service platform. 
            Integrate powerful payment processing into your applications.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-dark rounded-lg p-1 border border-primary/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'api'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              API Reference
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-8 fade-in" ref={contentRef}>
            <div className="bg-dark p-8 rounded-lg border border-primary/20">
              <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Welcome to the WorldAPI Payments as a Service documentation. Our API enables you to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Process cross-border payments and money transfers</li>
                  <li>Manage customer accounts and bank information</li>
                  <li>Handle KYC compliance and document verification</li>
                  <li>Get real-time exchange rates and create quotes</li>
                  <li>Integrate secure payment processing into your applications</li>
                </ul>
              </div>
            </div>

            <div className="bg-dark p-8 rounded-lg border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Authentication</h3>
              <p className="text-gray-300 mb-4">
                All API requests require authentication using a Bearer token. Include your API key in the Authorization header:
              </p>
              <div className="bg-darker p-4 rounded border border-primary/10">
                <code className="text-primary">Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" ref={contentRef}>
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-dark p-6 rounded-lg border border-primary/20 sticky top-24">
                <h3 className="text-xl font-bold mb-4">API Reference</h3>
                
                {/* API Key Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                  />
                </div>

                {/* Categories and Endpoints */}
                <div className="space-y-4">
                  {apiCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
                        className="w-full text-left text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        {category.name}
                      </button>
                      
                      {selectedCategory === category.name && (
                        <div className="ml-4 space-y-1">
                          {category.endpoints.map((endpoint, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectEndpoint(endpoint)}
                              className={`w-full text-left p-2 rounded text-sm transition-all ${
                                selectedEndpoint?.operationId === endpoint.operationId
                                  ? 'bg-primary/20 text-primary border border-primary/30'
                                  : 'text-gray-400 hover:text-white hover:bg-primary/10'
                              }`}
                            >
                              <span className={`inline-block w-12 text-xs font-mono ${
                                endpoint.method === 'GET' ? 'text-green-400' :
                                endpoint.method === 'POST' ? 'text-blue-400' :
                                endpoint.method === 'PUT' ? 'text-yellow-400' :
                                endpoint.method === 'DELETE' ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {endpoint.method}
                              </span>
                              {endpoint.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedEndpoint ? (
                <div className="space-y-6">
                  {/* Endpoint Header */}
                  <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 rounded text-sm font-mono ${
                        selectedEndpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        selectedEndpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        selectedEndpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                        selectedEndpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {selectedEndpoint.method}
                      </span>
                      <code className="text-primary font-mono">{selectedEndpoint.path}</code>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEndpoint.name}</h2>
                    <p className="text-gray-300">{selectedEndpoint.description}</p>
                  </div>

                  {/* Parameters and Testing */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Left Column - Parameters */}
                    <div className="space-y-6">
                      {/* Path Parameters */}
                      {selectedEndpoint.params?.filter(param => param.in === 'path').length > 0 && (
                        <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                          <h3 className="text-lg font-bold mb-4">Path Parameters</h3>
                          <div className="space-y-4">
                            {selectedEndpoint.params.filter(param => param.in === 'path').map((param, index) => (
                              <div key={index}>
                                <label className="block text-sm font-medium mb-1">
                                  {param.name} {param.required && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                  type="text"
                                  value={pathParams[param.name] || ''}
                                  onChange={(e) => setPathParams(prev => ({...prev, [param.name]: e.target.value}))}
                                  placeholder={param.example?.toString() || param.description}
                                  className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Query Parameters */}
                      {selectedEndpoint.params?.filter(param => param.in === 'query').length > 0 && (
                        <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                          <h3 className="text-lg font-bold mb-4">Query Parameters</h3>
                          <div className="space-y-4">
                            {selectedEndpoint.params.filter(param => param.in === 'query').map((param, index) => (
                              <div key={index}>
                                <label className="block text-sm font-medium mb-1">
                                  {param.name} {param.required && <span className="text-red-400">*</span>}
                                </label>
                                {param.enum ? (
                                  <select
                                    value={queryParams[param.name] || ''}
                                    onChange={(e) => setQueryParams(prev => ({...prev, [param.name]: e.target.value}))}
                                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                                  >
                                    <option value="">Select {param.name}</option>
                                    {param.enum.map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    value={queryParams[param.name] || ''}
                                    onChange={(e) => setQueryParams(prev => ({...prev, [param.name]: e.target.value}))}
                                    placeholder={param.example?.toString() || param.description}
                                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                                  />
                                )}
                                <p className="text-xs text-gray-400 mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Body Parameters */}
                      {selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
                        <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                          <h3 className="text-lg font-bold mb-4">Request Body</h3>
                          <div className="space-y-4">
                            {selectedEndpoint.body.map((param, index) => (
                              <div key={index}>
                                <label className="block text-sm font-medium mb-1">
                                  {param.name} {param.required && <span className="text-red-400">*</span>}
                                </label>
                                {param.type === 'object' ? (
                                  <textarea
                                    value={JSON.stringify(bodyParams[param.name] || param.example || {}, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        const parsed = JSON.parse(e.target.value);
                                        setBodyParams(prev => ({...prev, [param.name]: parsed}));
                                      } catch {}
                                    }}
                                    rows={4}
                                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none font-mono text-sm"
                                  />
                                ) : param.enum ? (
                                  <select
                                    value={bodyParams[param.name] || ''}
                                    onChange={(e) => setBodyParams(prev => ({...prev, [param.name]: e.target.value}))}
                                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                                  >
                                    <option value="">Select {param.name}</option>
                                    {param.enum.map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    value={bodyParams[param.name] || ''}
                                    onChange={(e) => setBodyParams(prev => ({...prev, [param.name]: param.type === 'number' ? Number(e.target.value) : e.target.value}))}
                                    placeholder={param.example?.toString() || param.description}
                                    className="w-full p-3 bg-darker border border-primary/20 rounded focus:border-primary outline-none"
                                  />
                                )}
                                <p className="text-xs text-gray-400 mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Try It Button */}
                      <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                        <h3 className="text-lg font-bold mb-4">Test API</h3>
                        
                        {validationErrors.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded p-4 mb-4">
                            <h4 className="text-red-400 font-semibold mb-2">Validation Errors:</h4>
                            <ul className="text-red-300 text-sm space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <button
                          onClick={handleTestApi}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Testing...' : 'Try It!'}
                        </button>
                      </div>
                    </div>

                    {/* Right Column - Code Examples and Response */}
                    <div className="space-y-6">
                      {/* Language Selection */}
                      <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold">Code Example</h3>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-darker border border-primary/20 rounded px-3 py-1 text-sm focus:border-primary outline-none"
                          >
                            <option value="curl">cURL</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                          </select>
                        </div>
                        <pre className="bg-darker p-4 rounded border border-primary/10 overflow-x-auto">
                          <code className="text-sm text-primary">
                            {generateCodeExample(selectedEndpoint, selectedLanguage)}
                          </code>
                        </pre>
                      </div>

                      {/* Response Examples */}
                      <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                        <h3 className="text-lg font-bold mb-4">Response Examples</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-green-400 font-semibold mb-2">Success Response (200)</h4>
                            <pre className="bg-darker p-4 rounded border border-primary/10 overflow-x-auto">
                              <code className="text-sm text-green-300">
                                {selectedEndpoint.response?.success || 'No example available'}
                              </code>
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="text-red-400 font-semibold mb-2">Error Response (400/401/404)</h4>
                            <pre className="bg-darker p-4 rounded border border-primary/10 overflow-x-auto">
                              <code className="text-sm text-red-300">
                                {selectedEndpoint.response?.error || 'No example available'}
                              </code>
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Live Response */}
                      {testResponse && (
                        <div className="bg-dark p-6 rounded-lg border border-primary/20 fade-in">
                          <h3 className="text-lg font-bold mb-4">Live Response</h3>
                          <pre className="bg-darker p-4 rounded border border-primary/10 overflow-x-auto max-h-96">
                            <code className="text-sm text-gray-300">
                              {testResponse}
                            </code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark p-12 rounded-lg border border-primary/20 text-center fade-in">
                  <h3 className="text-2xl font-bold mb-4">Select an API Endpoint</h3>
                  <p className="text-gray-400">Choose an endpoint from the sidebar to view its documentation and test it live.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DocumentationPage;