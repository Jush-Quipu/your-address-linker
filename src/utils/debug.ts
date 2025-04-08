
/**
 * Debug utility functions for development and troubleshooting
 */

// Enable debug mode based on URL parameter or localStorage
export const isDebugMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    localStorage.setItem('secureaddress_debug', 'true');
    return true;
  }
  
  // Check localStorage
  return localStorage.getItem('secureaddress_debug') === 'true';
};

// Debug logger that only logs in debug mode
export const debugLog = (context: string, message: string, ...args: any[]): void => {
  if (isDebugMode()) {
    console.log(`[${context}] ${message}`, ...args);
  }
};

// Log errors in both debug and production mode
export const errorLog = (context: string, message: string, error?: any): void => {
  console.error(`[${context}] ${message}`, error || '');
};

// Enable debug mode for the current session
export const enableDebugMode = (): void => {
  localStorage.setItem('secureaddress_debug', 'true');
};

// Disable debug mode
export const disableDebugMode = (): void => {
  localStorage.removeItem('secureaddress_debug');
};

// Get environment information for debugging
export const getEnvironmentInfo = (): Record<string, any> => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    url: window.location.href,
    localStorage: {
      hasToken: !!localStorage.getItem('secureaddress_token'),
      hasProofId: !!localStorage.getItem('secureaddress_proof_id'),
      hasProofToken: !!localStorage.getItem('secureaddress_proof_token'),
    }
  };
};

// Helper to print a full debug report to console
export const printDebugReport = (): void => {
  console.group('SecureAddress Bridge Debug Report');
  console.log('Environment:', getEnvironmentInfo());
  console.log('Local Storage:', Object.keys(localStorage).filter(key => key.startsWith('secureaddress_')));
  console.log('Debug mode:', isDebugMode() ? 'Enabled' : 'Disabled');
  console.groupEnd();
};
