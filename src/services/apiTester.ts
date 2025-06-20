import { ApiEndpoint } from '../types/documentation';

export interface ApiTestRequest {
  endpoint: ApiEndpoint;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: Record<string, any>;
}

export interface ApiTestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  error?: string;
  duration: number;
}

/**
 * Execute API test request
 */
export const executeApiTest = async (request: ApiTestRequest): Promise<ApiTestResponse> => {
  const startTime = Date.now();

  try {
    // Build URL with path and query parameters
    const baseUrl = request.endpoint.baseUrl || 'https://drap.digitnine.com';
    let url = `${baseUrl}${request.endpoint.path}`;

    // Replace path parameters
    Object.entries(request.pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Add query parameters
    const queryString = new URLSearchParams(request.queryParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    // Prepare fetch options
    const options: RequestInit = {
      method: request.endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers
      }
    };

    // Add request body for POST, PUT, PATCH methods
    if (['POST', 'PUT', 'PATCH'].includes(request.endpoint.method) && Object.keys(request.body).length > 0) {
      options.body = JSON.stringify(request.body);
    }

    // Execute request
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Extract response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      duration
    };
  }
};

/**
 * Validate request before sending
 */
export const validateApiRequest = (request: ApiTestRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required path parameters
  if (request.endpoint.params) {
    request.endpoint.params.forEach(param => {
      if (param.required && param.in === 'path' && !request.pathParams[param.name]) {
        errors.push(`Required path parameter '${param.name}' is missing`);
      }
    });
  }

  // Check required body parameters
  if (request.endpoint.body) {
    request.endpoint.body.forEach(param => {
      if (param.required && !request.body[param.name]) {
        errors.push(`Required body parameter '${param.name}' is missing`);
      }
    });
  }

  // Validate URL construction
  try {
    const baseUrl = request.endpoint.baseUrl || 'https://drap.digitnine.com';
    let url = `${baseUrl}${request.endpoint.path}`;
    
    // Replace path parameters
    Object.entries(request.pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    
    // Test URL validity
    new URL(url);
  } catch (error) {
    console.error('URL construction error:', error);
    errors.push(`Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format response for display
 */
export const formatApiResponse = (response: ApiTestResponse): string => {
  const result = {
    status: `${response.status} ${response.statusText}`,
    duration: `${response.duration}ms`,
    headers: response.headers,
    data: response.data,
    ...(response.error && { error: response.error })
  };

  return JSON.stringify(result, null, 2);
};

export default executeApiTest;
