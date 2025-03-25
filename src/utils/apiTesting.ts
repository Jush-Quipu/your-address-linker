
import { ApiResponse, ErrorCodes } from './apiHelpers';

/**
 * API Testing utility
 */

// Test case structure
export interface ApiTestCase {
  name: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  expectedStatus?: number;
  expectedSuccess?: boolean;
  expectedErrorCode?: string;
  description?: string;
}

// Test result structure
export interface ApiTestResult {
  testCase: ApiTestCase;
  passed: boolean;
  status?: number;
  responseData?: any;
  error?: string;
  duration?: number;
}

/**
 * Run a single API test
 */
export async function runApiTest(testCase: ApiTestCase): Promise<ApiTestResult> {
  const startTime = performance.now();
  try {
    const response = await fetch(testCase.endpoint, {
      method: testCase.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers
      },
      body: testCase.body ? JSON.stringify(testCase.body) : undefined
    });

    const status = response.status;
    let responseData: ApiResponse;
    
    try {
      responseData = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response');
    }

    const duration = performance.now() - startTime;
    
    // Validate response against expectations
    const passed = (
      // Check status if specified
      (testCase.expectedStatus === undefined || status === testCase.expectedStatus) &&
      // Check success flag if specified
      (testCase.expectedSuccess === undefined || responseData.success === testCase.expectedSuccess) &&
      // Check error code if specified
      (testCase.expectedErrorCode === undefined || responseData.error?.code === testCase.expectedErrorCode)
    );

    return {
      testCase,
      passed,
      status,
      responseData,
      duration
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      testCase,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    };
  }
}

/**
 * Run a batch of API tests
 */
export async function runApiTests(tests: ApiTestCase[]): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];
  
  for (const test of tests) {
    const result = await runApiTest(test);
    results.push(result);
  }
  
  return results;
}

/**
 * Format test results as a report
 */
export function formatTestReport(results: ApiTestResult[]): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  let report = `API Test Report\n`;
  report += `================\n`;
  report += `Total Tests: ${totalTests}\n`;
  report += `Passed: ${passedTests}\n`;
  report += `Failed: ${failedTests}\n\n`;
  
  results.forEach((result, index) => {
    report += `Test ${index + 1}: "${result.testCase.name}" - ${result.passed ? 'PASSED' : 'FAILED'}\n`;
    report += `Endpoint: ${result.testCase.method || 'GET'} ${result.testCase.endpoint}\n`;
    
    if (result.duration !== undefined) {
      report += `Duration: ${result.duration.toFixed(2)}ms\n`;
    }
    
    if (result.status) {
      report += `Status: ${result.status}\n`;
    }
    
    if (result.error) {
      report += `Error: ${result.error}\n`;
    }
    
    if (result.responseData) {
      report += `Response: ${JSON.stringify(result.responseData, null, 2)}\n`;
    }
    
    report += `\n`;
  });
  
  return report;
}

/**
 * Predefined test cases
 */
export const standardApiTests: ApiTestCase[] = [
  {
    name: 'Health Check',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/health-check',
    method: 'GET',
    expectedStatus: 200,
    expectedSuccess: true,
    description: 'Basic health check to verify API is operational'
  },
  {
    name: 'Invalid Endpoint',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/non-existent',
    method: 'GET',
    expectedStatus: 404,
    expectedSuccess: false,
    description: 'Test behavior for non-existent endpoints'
  },
  {
    name: 'Token Validation - Missing Token',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/validate-token',
    method: 'GET',
    expectedStatus: 400,
    expectedSuccess: false,
    expectedErrorCode: 'invalid_request',
    description: 'Validate response when token is missing'
  }
];
