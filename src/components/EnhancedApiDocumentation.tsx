import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import realWorldApiEndpoints, { ApiEndpoint } from '../data/realWorldApiEndpoints';
import { executeApiTest, validateApiRequest, ApiTestRequest } from '../services/apiTester';

interface EnhancedApiDocumentationProps {
  endpoints?: ApiEndpoint[];
}

const EnhancedApiDocumentation: React.FC<EnhancedApiDocumentationProps> = ({ 
  endpoints = realWorldApiEndpoints 
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python' | 'php' | 'ruby' | 'go' | 'java'>('curl');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [testResponse, setTestResponse] = useState<string | object>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { key: 'curl', name: 'Shell', icon: '🐚' },
    { key: 'javascript', name: 'Node.js', icon: '📜' },
    { key: 'python', name: 'Python', icon: '🐍' },
    { key: 'php', name: 'PHP', icon: '🐘' },
    { key: 'ruby', name: 'Ruby', icon: '💎' },
    { key: 'go', name: 'Go', icon: '🐹' },
    { key: 'java', name: 'Java', icon: '☕' }
  ];

  useEffect(() => {
    if (selectedEndpoint) {
      const initialData: Record<string, any> = {};
      
      // Initialize path parameters
      if (selectedEndpoint.params) {
        selectedEndpoint.params.forEach(param => {
          if (param.in === 'path') {
            initialData[`path_${param.name}`] = param.example || '';
          } else if (param.in === 'query') {
            initialData[`query_${param.name}`] = param.example || '';
          } else if (param.in === 'header') {
            initialData[`header_${param.name}`] = param.example || '';
          }
        });
      }

      // Initialize body parameters
      if (selectedEndpoint.body) {
        selectedEndpoint.body.forEach(param => {
          initialData[`body_${param.name}`] = param.example || '';
        });
      }

      setFormData(initialData);
      setTestResponse('');
      setValidationErrors([]);
    }
  }, [selectedEndpoint]);

  const generateCodeExample = (endpoint: ApiEndpoint, language: 'curl' | 'javascript' | 'python' | 'php' | 'ruby' | 'go' | 'java'): string => {
    if (!endpoint) return '';

    const baseUrl = endpoint.baseUrl || 'https://api.worldapi.com';
    let url = `${baseUrl}${endpoint.path}`;

    // Replace path parameters with example values
    if (endpoint.params) {
      endpoint.params.forEach(param => {
        if (param.in === 'path') {
          url = url.replace(`{${param.name}}`, param.example || `{${param.name}}`);
        }
      });
    }

    // Build query parameters
    const queryParams = endpoint.params?.filter(p => p.in === 'query') || [];
    if (queryParams.length > 0) {
      const queryString = queryParams
        .map(param => `${param.name}=${param.example || 'value'}`)
        .join('&');
      url += `?${queryString}`;
    }

    // Build headers
    const headers = endpoint.params?.filter(p => p.in === 'header') || [];
    const authHeader = { name: 'X-API-KEY', value: 'YOUR_API_KEY' };

    // Build body
    const bodyData: Record<string, any> = {};
    if (endpoint.body) {
      endpoint.body.forEach(param => {
        bodyData[param.name] = param.example || (param.type === 'number' ? 0 : 'value');
      });
    }

    switch (language) {
      case 'curl':
        let curlCmd = `curl --request ${endpoint.method} \\\n  --url '${url}' \\\n  --header 'accept: application/json' \\\n  --header 'X-API-KEY: YOUR_API_KEY'`;
        
        headers.forEach(header => {
          curlCmd += ` \\\n  --header '${header.name}: ${header.example || 'value'}'`;
        });

        if (endpoint.method !== 'GET' && Object.keys(bodyData).length > 0) {
          curlCmd += ` \\\n  --header 'content-type: application/json' \\\n  --data '${JSON.stringify(bodyData, null, 2)}'`;
        }

        return curlCmd;

      case 'javascript':
        const jsHeaders: Record<string, string> = {
          'accept': 'application/json',
          'X-API-KEY': 'YOUR_API_KEY',
          ...headers.reduce((acc, h) => ({ ...acc, [h.name]: h.example || 'value' }), {})
        };

        if (endpoint.method !== 'GET' && Object.keys(bodyData).length > 0) {
          jsHeaders['content-type'] = 'application/json';
        }

        return `const options = {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(jsHeaders, null, 2)}${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `,
  body: JSON.stringify(${JSON.stringify(bodyData, null, 2)})` : ''}
};

fetch('${url}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`;

      case 'python':
        return `import requests

url = "${url}"
headers = {
    "accept": "application/json",
    "X-API-KEY": "YOUR_API_KEY"${headers.map(h => `,\n    "${h.name}": "${h.example || 'value'}"`).join('')}
}
${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `
payload = ${JSON.stringify(bodyData, null, 2)}
headers["content-type"] = "application/json"

response = requests.${endpoint.method.toLowerCase()}(url, json=payload, headers=headers)` : `
response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}

print(response.json())`;

      case 'php':
        return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "${endpoint.method}",
  CURLOPT_HTTPHEADER => [
    "accept: application/json",
    "X-API-KEY: YOUR_API_KEY"${headers.map(h => `,\n    "${h.name}: ${h.example || 'value'}"`).join('')}${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `,
    "content-type: application/json"` : ''}
  ],${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `
  CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(bodyData)})` : ''}
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`;

      case 'ruby':
        return `require 'uri'
require 'net/http'
require 'json'

url = URI("${url}")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::${endpoint.method.charAt(0).toUpperCase() + endpoint.method.slice(1).toLowerCase()}.new(url)
request["accept"] = 'application/json'
request["X-API-KEY"] = 'YOUR_API_KEY'${headers.map(h => `\nrequest["${h.name}"] = '${h.example || 'value'}'`).join('')}
${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `request["content-type"] = 'application/json'
request.body = ${JSON.stringify(bodyData)}.to_json` : ''}

response = http.request(request)
puts response.read_body`;

      case 'go':
        return `package main

import (
	"fmt"
	"strings"
	"net/http"
	"io/ioutil"
)

func main() {
${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `	payload := strings.NewReader(\`${JSON.stringify(bodyData)}\`)
	
	req, _ := http.NewRequest("${endpoint.method}", "${url}", payload)` : `	req, _ := http.NewRequest("${endpoint.method}", "${url}", nil)`}
	
	req.Header.Add("accept", "application/json")
	req.Header.Add("X-API-KEY", "YOUR_API_KEY")${headers.map(h => `\n	req.Header.Add("${h.name}", "${h.example || 'value'}")`).join('')}
${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? '	req.Header.Add("content-type", "application/json")\n' : ''}
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	
	body, _ := ioutil.ReadAll(res.Body)
	fmt.Println(string(body))
}`;

      case 'java':
        return `import java.io.IOException;
import okhttp3.*;

public class Main {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();
${endpoint.method !== 'GET' && Object.keys(bodyData).length > 0 ? `        
        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(mediaType, "${JSON.stringify(bodyData).replace(/"/g, '\\"')}");
        
        Request request = new Request.Builder()
            .url("${url}")
            .${endpoint.method.toLowerCase()}(body)` : `        
        Request request = new Request.Builder()
            .url("${url}")
            .${endpoint.method.toLowerCase()}()`}
            .addHeader("accept", "application/json")
            .addHeader("X-API-KEY", "YOUR_API_KEY")${headers.map(h => `\n            .addHeader("${h.name}", "${h.example || 'value'}")`).join('')}
            .build();

        Response response = client.newCall(request).execute();
        System.out.println(response.body().string());
    }
}`;

      default:
        return '';
    }
  };

  const handleTryIt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Prepare the test request
      const pathParams: Record<string, string> = {};
      const queryParams: Record<string, string> = {};
      const headers: Record<string, string> = {};
      const body: Record<string, any> = {};

      // Extract parameters from form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('path_')) {
          pathParams[key.replace('path_', '')] = value;
        } else if (key.startsWith('query_')) {
          queryParams[key.replace('query_', '')] = value;
        } else if (key.startsWith('header_')) {
          headers[key.replace('header_', '')] = value;
        } else if (key.startsWith('body_')) {
          body[key.replace('body_', '')] = value;
        }
      });

      const testRequest: ApiTestRequest = {
        endpoint: selectedEndpoint,
        pathParams,
        queryParams,
        headers,
        body
      };

      // Validate the request
      const validation = validateApiRequest(testRequest);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsLoading(false);
        return;
      }

      // Execute the test
      const response = await executeApiTest(testRequest);
      setTestResponse(typeof response === 'string' ? response : JSON.stringify(response, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Group endpoints by category for better organization
  const getEndpointCategory = (endpoint: ApiEndpoint): string => {
    const name = endpoint.name.toLowerCase();
    const path = endpoint.path.toLowerCase();
    
    // Authentication
    if (path.includes('/auth') || name.includes('keycloak')) return 'Authentication';
    
    // Quote Management
    if (path.includes('/quote') || name.includes('quote')) return 'Quote Management';
    
    // Transaction Management
    if (path.includes('/createtransaction') || path.includes('/confirmtransaction') || path.includes('/enquiretransaction')) {
      return 'Transaction Management';
    }
    
    // Customer Management
    if (path.includes('/customer') || path.includes('/caas')) return 'Customer Management';
    
    // Master Data & Configuration
    if (path.includes('/master') || path.includes('/codes') || path.includes('/banks') || path.includes('/branches')) {
      return 'Master Data';
    }
    
    return 'General';
  };

  const categorizedEndpoints = endpoints.reduce((acc, endpoint) => {
    const category = getEndpointCategory(endpoint);
    if (!acc[category]) acc[category] = [];
    acc[category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - API Endpoints */}
        <div className="w-1/4 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">API Reference</h2>
            <div className="space-y-1">
              {Object.keys(categorizedEndpoints).map((category, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category}</h3>
                  {categorizedEndpoints[category].map((endpoint, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedEndpoint === endpoint
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-sm">{endpoint.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedEndpoint ? (
            <div className="flex">
              {/* Left Panel - Documentation */}
              <div className="w-1/2 p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${
                      selectedEndpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                      selectedEndpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      selectedEndpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedEndpoint.name}</h1>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedEndpoint.description}</p>
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                    {selectedEndpoint.baseUrl}{selectedEndpoint.path}
                  </code>
                </div>

                {/* Parameters Section */}
                {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Parameters</h3>
                    <div className="space-y-3">
                      {selectedEndpoint.params.map((param, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-sm font-mono text-blue-600">{param.name}</code>
                            <span className="text-xs text-gray-500">({param.in})</span>
                            {param.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">required</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                          {param.enum && (
                            <div className="text-xs text-gray-500">
                              Enum: {param.enum.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body Section */}
                {selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Body</h3>
                    <div className="space-y-3">
                      {selectedEndpoint.body.map((param, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-sm font-mono text-blue-600">{param.name}</code>
                            <span className="text-xs text-gray-500">({param.type})</span>
                            {param.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">required</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Examples */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Examples</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">Success Response (200)</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                        {selectedEndpoint.response?.success}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Error Response (400)</h4>
                      <pre className="bg-gray-900 text-red-400 p-4 rounded-lg text-sm overflow-x-auto">
                        {selectedEndpoint.response?.error}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Code Examples & Testing */}
              <div className="w-1/2 bg-white border-l border-gray-200 p-6">
                {/* Language Selector */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Code Examples</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.key}
                        onClick={() => setSelectedLanguage(lang.key as 'curl' | 'javascript' | 'python' | 'php' | 'ruby' | 'go' | 'java')}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedLanguage === lang.key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {lang.icon} {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Example */}
                <div className="mb-6">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {generateCodeExample(selectedEndpoint, selectedLanguage)}
                  </pre>
                </div>

                {/* Try It Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Try It!</h3>
                  
                  <form onSubmit={handleTryIt} className="space-y-4">
                    {/* Path Parameters */}
                    {selectedEndpoint.params?.filter(p => p.in === 'path').map((param, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={formData[`path_${param.name}`] || ''}
                          onChange={(e) => handleInputChange(`path_${param.name}`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={param.example || param.description}
                        />
                      </div>
                    ))}

                    {/* Query Parameters */}
                    {selectedEndpoint.params?.filter(p => p.in === 'query').map((param, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.enum ? (
                          <select
                            value={formData[`query_${param.name}`] || ''}
                            onChange={(e) => handleInputChange(`query_${param.name}`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an option</option>
                            {param.enum.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type === 'integer' ? 'number' : 'text'}
                            value={formData[`query_${param.name}`] || ''}
                            onChange={(e) => handleInputChange(`query_${param.name}`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={param.example || param.description}
                          />
                        )}
                      </div>
                    ))}

                    {/* Body Parameters */}
                    {selectedEndpoint.body?.map((param, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.enum ? (
                          <select
                            value={formData[`body_${param.name}`] || ''}
                            onChange={(e) => handleInputChange(`body_${param.name}`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an option</option>
                            {param.enum.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={formData[`body_${param.name}`] || ''}
                            onChange={(e) => handleInputChange(`body_${param.name}`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={param.example || param.description}
                          />
                        )}
                      </div>
                    ))}

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? 'Testing...' : 'Try It!'}
                    </button>
                  </form>

                  {/* Response Display */}
                  {testResponse && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Response</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                        {typeof testResponse === 'string' ? testResponse : JSON.stringify(testResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">WorldAPI Documentation</h2>
                <p className="text-gray-600">Select an API endpoint from the sidebar to view documentation and test the API.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedApiDocumentation;
