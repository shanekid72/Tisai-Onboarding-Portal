import { ApiEndpoint, ApiParameter } from '../types/documentation';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  servers: Array<{
    url: string;
  }>;
  paths: Record<string, Record<string, any>>;
}

/**
 * Parse OpenAPI YAML specification and convert to ApiEndpoint format
 */
export const parseOpenAPISpec = async (yamlContent: string): Promise<ApiEndpoint[]> => {
  try {
    // Parse YAML content (we'll import js-yaml for this)
    const spec: OpenAPISpec = await parseYAML(yamlContent);
    const endpoints: ApiEndpoint[] = [];

    // Extract server URL for API calls
    const baseUrl = spec.servers?.[0]?.url || '';

    // Iterate through all paths
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      // Iterate through all HTTP methods for this path
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const endpoint: ApiEndpoint = {
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE',
            path: path,
            description: operation.description || operation.summary || '',
            baseUrl: baseUrl,
            operationId: operation.operationId,
            params: extractParameters(operation.parameters),
            body: extractRequestBody(operation.requestBody),
            response: extractResponses(operation.responses)
          };

          endpoints.push(endpoint);
        }
      });
    });

    return endpoints;
  } catch (error) {
    console.error('Error parsing OpenAPI spec:', error);
    return [];
  }
};

/**
 * Extract parameters from OpenAPI parameter definitions
 */
const extractParameters = (parameters: any[]): ApiParameter[] => {
  if (!parameters || !Array.isArray(parameters)) return [];

  return parameters.map(param => ({
    name: param.name,
    type: param.schema?.type || 'string',
    required: param.required || false,
    description: param.description || '',
    in: param.in // path, query, header, cookie
  }));
};

/**
 * Extract request body parameters from OpenAPI requestBody definition
 */
const extractRequestBody = (requestBody: any): ApiParameter[] => {
  if (!requestBody?.content?.['application/json']?.schema?.properties) return [];

  const properties = requestBody.content['application/json'].schema.properties;
  const required = requestBody.content['application/json'].schema.required || [];

  return Object.entries(properties).map(([name, prop]: [string, any]) => ({
    name,
    type: prop.type || 'string',
    required: required.includes(name),
    description: prop.description || '',
    example: prop.example,
    enum: prop.enum
  }));
};

/**
 * Extract response examples from OpenAPI responses definition
 */
const extractResponses = (responses: any): { success: string; error: string } => {
  const successResponse = responses['200'] || responses['201'] || responses['204'];
  const errorResponse = responses['400'] || responses['401'] || responses['404'] || responses['500'];

  return {
    success: JSON.stringify({
      status: 'success',
      message: successResponse?.description || 'Request completed successfully'
    }, null, 2),
    error: JSON.stringify({
      status: 'error',
      message: errorResponse?.description || 'Request failed'
    }, null, 2)
  };
};

/**
 * Simple YAML parser (basic implementation)
 * For production use, consider using a library like js-yaml
 */
const parseYAML = async (yamlContent: string): Promise<OpenAPISpec> => {
  // Basic YAML to JSON conversion
  // This is a simplified implementation - for production use js-yaml library
  const lines = yamlContent.split('\n');
  const result: any = {};
  const stack: any[] = [result];
  let currentIndent = 0;

  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;
    const content = line.trim();

    if (content.includes(':')) {
      const [key, ...valueParts] = content.split(':');
      const value = valueParts.join(':').trim();

      // Handle indentation changes
      if (indent < currentIndent) {
        // Pop from stack
        const levels = Math.floor((currentIndent - indent) / 2);
        for (let i = 0; i < levels; i++) {
          stack.pop();
        }
      }

      const currentObj = stack[stack.length - 1];

      if (value === '' || value === '{}' || value === '[]') {
        // Object or array
        currentObj[key.trim()] = value === '[]' ? [] : {};
        stack.push(currentObj[key.trim()]);
      } else {
        // Simple value
        currentObj[key.trim()] = parseValue(value);
      }

      currentIndent = indent;
    } else if (content.startsWith('-')) {
      // Array item
      const currentObj = stack[stack.length - 1];
      if (!Array.isArray(currentObj)) {
        // Convert to array if needed
        const parent = stack[stack.length - 2];
        const keys = Object.keys(currentObj);
        if (keys.length === 1) {
          parent[keys[0]] = [];
          stack[stack.length - 1] = parent[keys[0]];
        }
      }
      const value = content.substring(1).trim();
      if (value.includes(':')) {
        const obj: any = {};
        const [key, ...valueParts] = value.split(':');
        obj[key.trim()] = parseValue(valueParts.join(':').trim());
        currentObj.push(obj);
      } else {
        currentObj.push(parseValue(value));
      }
    }
  }

  return result as OpenAPISpec;
};

/**
 * Parse YAML value to appropriate JavaScript type
 */
const parseValue = (value: string): any => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);
  return value;
};

/**
 * Load OpenAPI spec from file path
 */
export const loadOpenAPISpec = async (filePath: string): Promise<ApiEndpoint[]> => {
  try {
    const response = await fetch(filePath);
    const yamlContent = await response.text();
    return parseOpenAPISpec(yamlContent);
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error);
    return [];
  }
};

export default parseOpenAPISpec;
