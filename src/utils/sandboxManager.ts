import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  getSandboxConfig, 
  updateSandboxConfig, 
  resetSandboxConfig,
  handleAuthorize,
  handleCallback,
  getAddress,
  connectWallet,
  linkAddressToWallet,
  createBlindShippingToken,
  requestShipment,
  getTrackingInfo
} from '@/services/sandbox/sandboxController';
import { SandboxConfig, SandboxResponse } from '@/types/sandbox';

export interface SandboxLogItem {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
  details?: any;
  endpoint?: string;
  method?: string;
  status?: number;
}

class SandboxManager {
  private logs: SandboxLogItem[] = [];
  private logListeners: ((logs: SandboxLogItem[]) => void)[] = [];
  private configListeners: ((config: SandboxConfig) => void)[] = [];
  private _config: SandboxConfig;

  constructor() {
    this._config = getSandboxConfig();
    
    // Add some initial info logs
    this.addLog({
      type: 'info',
      message: 'Sandbox environment initialized',
      details: { mode: 'development', timestamp: new Date().toISOString() }
    });
  }

  // Config management
  get config(): SandboxConfig {
    return this._config;
  }

  updateConfig(newConfig: Partial<SandboxConfig>): SandboxConfig {
    const updatedConfig = updateSandboxConfig(newConfig);
    this._config = updatedConfig;
    
    this.addLog({
      type: 'info',
      message: 'Sandbox configuration updated',
      details: newConfig
    });
    
    this.notifyConfigListeners();
    return updatedConfig;
  }

  resetConfig(): SandboxConfig {
    const defaultConfig = resetSandboxConfig();
    this._config = defaultConfig;
    
    this.addLog({
      type: 'info',
      message: 'Sandbox configuration reset to defaults'
    });
    
    this.notifyConfigListeners();
    return defaultConfig;
  }

  // Log management
  getLogs(): SandboxLogItem[] {
    return [...this.logs];
  }

  addLog(log: Omit<SandboxLogItem, 'id' | 'timestamp'>): void {
    const newLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    this.logs.unshift(newLog);
    
    // Keep log size manageable
    if (this.logs.length > 100) {
      this.logs.pop();
    }
    
    this.notifyLogListeners();
  }

  clearLogs(): void {
    this.logs = [];
    this.addLog({
      type: 'info',
      message: 'Logs cleared'
    });
  }

  // Observer pattern for logs
  subscribeToLogs(callback: (logs: SandboxLogItem[]) => void): () => void {
    this.logListeners.push(callback);
    
    // Immediately notify with current logs
    callback(this.getLogs());
    
    // Return unsubscribe function
    return () => {
      this.logListeners = this.logListeners.filter(cb => cb !== callback);
    };
  }

  // Observer pattern for config
  subscribeToConfig(callback: (config: SandboxConfig) => void): () => void {
    this.configListeners.push(callback);
    
    // Immediately notify with current config
    callback(this.config);
    
    // Return unsubscribe function
    return () => {
      this.configListeners = this.configListeners.filter(cb => cb !== callback);
    };
  }

  private notifyLogListeners(): void {
    const logs = this.getLogs();
    this.logListeners.forEach(callback => callback(logs));
  }

  private notifyConfigListeners(): void {
    const config = this.config;
    this.configListeners.forEach(callback => callback(config));
  }

  // API operations wrapped with logging
  async authorize(params: {
    appId: string;
    redirectUri: string;
    scope: string[];
    expiryDays?: number;
    state?: string;
  }): Promise<SandboxResponse<{ code: string; state: string }>> {
    this.addLog({
      type: 'request',
      message: 'Authorization request',
      endpoint: '/api/v1/authorize',
      method: 'POST',
      details: params
    });
    
    try {
      const response = await handleAuthorize(params);
      
      this.addLog({
        type: response.success ? 'response' : 'error',
        message: response.success ? 'Authorization successful' : 'Authorization failed',
        endpoint: '/api/v1/authorize',
        method: 'POST',
        status: response.success ? 200 : 400,
        details: response
      });
      
      return response;
    } catch (error) {
      this.addLog({
        type: 'error',
        message: 'Authorization request failed',
        endpoint: '/api/v1/authorize',
        method: 'POST',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  async handleCallback(): Promise<SandboxResponse<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string[];
  }>> {
    this.addLog({
      type: 'request',
      message: 'Token exchange request',
      endpoint: '/api/v1/token',
      method: 'POST'
    });
    
    try {
      const response = await handleCallback();
      
      this.addLog({
        type: response.success ? 'response' : 'error',
        message: response.success ? 'Token exchange successful' : 'Token exchange failed',
        endpoint: '/api/v1/token',
        method: 'POST',
        status: response.success ? 200 : 400,
        details: response
      });
      
      return response;
    } catch (error) {
      this.addLog({
        type: 'error',
        message: 'Token exchange request failed',
        endpoint: '/api/v1/token',
        method: 'POST',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  async getAddress(params: {
    includeVerificationInfo?: boolean;
  }): Promise<SandboxResponse<any>> {
    this.addLog({
      type: 'request',
      message: 'Get address request',
      endpoint: '/api/v1/address',
      method: 'GET',
      details: params
    });
    
    try {
      const response = await getAddress(params);
      
      this.addLog({
        type: response.success ? 'response' : 'error',
        message: response.success ? 'Get address successful' : 'Get address failed',
        endpoint: '/api/v1/address',
        method: 'GET',
        status: response.success ? 200 : 400,
        details: response
      });
      
      return response;
    } catch (error) {
      this.addLog({
        type: 'error',
        message: 'Get address request failed',
        endpoint: '/api/v1/address',
        method: 'GET',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  // More API methods can be added following the same pattern...
  
  // Generic method to run a custom API request
  async runCustomRequest(request: {
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
  }): Promise<any> {
    this.addLog({
      type: 'request',
      message: `Custom ${request.method} request`,
      endpoint: request.endpoint,
      method: request.method,
      details: {
        headers: request.headers,
        body: request.body
      }
    });
    
    try {
      // Create a mock response based on the request
      const successProbability = this._config.simulateErrors 
        ? 1 - this._config.errorRate 
        : 1;
      
      const willSucceed = Math.random() <= successProbability;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, this._config.responseDelay));
      
      if (!willSucceed) {
        const errorResponse = {
          success: false,
          error: {
            code: 'simulated_error',
            message: 'This is a simulated error from the sandbox environment'
          },
          timestamp: new Date().toISOString()
        };
        
        this.addLog({
          type: 'error',
          message: 'Request failed (simulated)',
          endpoint: request.endpoint,
          method: request.method,
          status: 400,
          details: errorResponse
        });
        
        return errorResponse;
      }
      
      // Generate a success response
      let responseBody: any = {
        success: true,
        data: {
          message: 'This is a simulated successful response',
          request: {
            endpoint: request.endpoint,
            method: request.method
          }
        },
        timestamp: new Date().toISOString()
      };
      
      // For certain known endpoints, return more specific responses
      if (request.endpoint.includes('health-check')) {
        responseBody.data = {
          status: 'healthy',
          version: '1.0.0',
          environment: 'sandbox',
          serverTime: new Date().toISOString()
        };
      }
      
      this.addLog({
        type: 'response',
        message: 'Request successful',
        endpoint: request.endpoint,
        method: request.method,
        status: 200,
        details: responseBody
      });
      
      return responseBody;
    } catch (error) {
      this.addLog({
        type: 'error',
        message: 'Request failed with an exception',
        endpoint: request.endpoint,
        method: request.method,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
}

// Create a singleton instance
const sandboxManager = new SandboxManager();
export default sandboxManager;
