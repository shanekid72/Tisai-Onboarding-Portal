import { useState, useEffect, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ApiEndpoint } from '../types/documentation';
import parseApiEndpoints from '../utils/apiParser';

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'api'>('api');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const apiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load API endpoints
    setApiEndpoints(parseApiEndpoints(''));

    // Animate content on page load
    const timeline = gsap.timeline();

    timeline.fromTo(
      '.doc-title',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );

    timeline.fromTo(
      '.doc-tabs',
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    timeline.fromTo(
      '.doc-content',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (tab: 'pdf' | 'api') => {
    setActiveTab(tab);
    // Reset API test form when switching tabs
    if (tab === 'api') {
      setSelectedEndpoint(null);
      setTestResponse(null);
      setFormInputs({});
    }
  };

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setTestResponse(null);
    setFormInputs({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleTestApi = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success response for demo purposes
      setTestResponse(selectedEndpoint.response?.success || '{"status": "success"}');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 doc-title">
          <span className="gradient-text">WorldAPI</span> Documentation
        </h1>

        {/* Tabs */}
        <div className="mb-8 doc-tabs">
          <div className="flex space-x-2 border-b border-gray-700">
            <button 
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'pdf' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
              onClick={() => handleTabChange('pdf')}
            >
              PDF Documentation
            </button>
            <button 
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'api' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
              onClick={() => handleTabChange('api')}
            >
              API Testing
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="doc-content bg-darker bg-opacity-50 rounded-lg shadow-xl p-4 md:p-6">
          {activeTab === 'pdf' && (
            <div ref={pdfContainerRef} className="pdf-container">
              <div className="bg-dark p-4 rounded-lg mb-4 flex items-center justify-between">
                <h2 className="text-xl font-medium">WorldAPI Documentation</h2>
                <a 
                  href="/assets/worldAPI.pdf" 
                  download 
                  className="btn btn-secondary text-sm"
                >
                  Download PDF
                </a>
              </div>
              
              <div className="pdf-viewer h-[800px] bg-dark rounded-lg overflow-hidden">
                <iframe 
                  src="/assets/worldAPI.pdf" 
                  className="w-full h-full" 
                  title="WorldAPI Documentation"
                ></iframe>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div ref={apiContainerRef} className="api-container grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-dark p-4 rounded-lg">
                <h2 className="text-xl font-medium mb-4">API Endpoints</h2>
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${selectedEndpoint === endpoint ? 'bg-primary bg-opacity-20 border-l-4 border-primary' : 'bg-darker hover:bg-dark-light'}`}
                      onClick={() => handleSelectEndpoint(endpoint)}
                    >
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${
                          endpoint.method === 'GET' ? 'bg-blue-600' : 
                          endpoint.method === 'POST' ? 'bg-green-600' : 
                          endpoint.method === 'PUT' ? 'bg-yellow-600' : 
                          'bg-red-600'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-sm font-medium">{endpoint.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{endpoint.path}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                {selectedEndpoint ? (
                  <div className="bg-dark p-4 rounded-lg">
                    <div className="mb-4">
                      <h2 className="text-xl font-medium mb-1">{selectedEndpoint.name}</h2>
                      <div className="flex items-center mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${
                          selectedEndpoint.method === 'GET' ? 'bg-blue-600' : 
                          selectedEndpoint.method === 'POST' ? 'bg-green-600' : 
                          selectedEndpoint.method === 'PUT' ? 'bg-yellow-600' : 
                          'bg-red-600'
                        }`}>
                          {selectedEndpoint.method}
                        </span>
                        <span className="text-sm font-mono">{selectedEndpoint.path}</span>
                      </div>
                      <p className="text-gray-300">{selectedEndpoint.description}</p>
                    </div>

                    <form onSubmit={handleTestApi} className="mb-4">
                      <h3 className="text-md font-medium mb-2">Parameters</h3>
                      
                      {/* URL Parameters */}
                      {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm text-gray-400 mb-2">URL Parameters</h4>
                          <div className="space-y-3">
                            {selectedEndpoint.params.map((param, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-400 mb-1">
                                    {param.name} {param.required && <span className="text-red-500">*</span>}
                                  </label>
                                  <input
                                    type="text"
                                    name={param.name}
                                    value={formInputs[param.name] || ''}
                                    onChange={handleInputChange}
                                    placeholder={`${param.type}`}
                                    className="w-full bg-darker border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                    required={param.required}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400 mt-1 md:mt-6">{param.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm text-gray-400 mb-2">Request Body</h4>
                          <div className="space-y-3">
                            {selectedEndpoint.body.map((field, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-400 mb-1">
                                    {field.name} {field.required && <span className="text-red-500">*</span>}
                                  </label>
                                  <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    name={field.name}
                                    value={formInputs[field.name] || ''}
                                    onChange={handleInputChange}
                                    placeholder={`${field.type}`}
                                    className="w-full bg-darker border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                    required={field.required}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400 mt-1 md:mt-6">{field.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="btn btn-primary mt-3"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Testing...' : 'Try It'}
                      </button>
                    </form>

                    {/* Response */}
                    {testResponse && (
                      <div className="mt-6">
                        <h3 className="text-md font-medium mb-2">Response</h3>
                        <div className="bg-darker p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap break-words text-sm text-green-400 font-mono">
                            {JSON.stringify(JSON.parse(testResponse), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-dark p-8 rounded-lg flex flex-col items-center justify-center text-center h-full">
                    <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium mb-2">Select an API Endpoint</h3>
                    <p className="text-gray-400">Choose an endpoint from the list to test the API functionality</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DocumentationPage; 