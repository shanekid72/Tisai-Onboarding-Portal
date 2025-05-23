/**
 * API Endpoint interface
 */
export interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: Array<ApiParameter>;
  body?: Array<ApiParameter>;
  response?: {
    success: string;
    error: string;
  };
}

/**
 * API Parameter interface
 */
export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
} 