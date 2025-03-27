export interface ApiTestCase {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  description?: string;
}

export interface ApiTestResult {
  testCase: ApiTestCase;
  status?: number;
  responseData?: any;
  passed?: boolean;
  duration: number;
  error?: string;
}

/**
 * Run an API test case
 */
export const runApiTest = async (testCase: ApiTestCase): Promise<ApiTestResult> => {
  const startTime = performance.now();
  
  try {
    const requestOptions: RequestInit = {
      method: testCase.method,
      headers: testCase.headers ? new Headers(testCase.headers) : undefined,
      body: testCase.body ? 
        (testCase.headers?.['Content-Type'] === 'application/json' ? 
          JSON.stringify(testCase.body) : 
          testCase.body
        ) : undefined,
    };

    const response = await fetch(testCase.endpoint, requestOptions);
    const endTime = performance.now();
    const duration = endTime - startTime;

    let responseData;
    let responseContentType = response.headers.get('content-type');
    
    try {
      if (responseContentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
        // Try to parse as JSON anyway if it looks like JSON
        if (responseData.trim().startsWith('{') || responseData.trim().startsWith('[')) {
          try {
            responseData = JSON.parse(responseData);
          } catch (e) {
            // Keep as text if parsing fails
          }
        }
      }
    } catch (e) {
      responseData = { error: 'Failed to parse response' };
    }

    return {
      testCase,
      status: response.status,
      responseData,
      passed: response.status >= 200 && response.status < 300,
      duration
    };
  } catch (error: any) {
    const endTime = performance.now();
    return {
      testCase,
      error: error.message || 'Network error occurred',
      passed: false,
      duration: endTime - startTime
    };
  }
};
