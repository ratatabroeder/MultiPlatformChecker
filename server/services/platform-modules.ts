import axios from 'axios';

interface CheckResult {
  isValid: boolean;
  errorMessage?: string;
}

interface PlatformModule {
  name: string;
  checkAccount(account: string, proxy?: any): Promise<CheckResult>;
}

class MarktplaatsModule implements PlatformModule {
  name = 'marktplaats.nl';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      // Parse account (email:password format)
      const [email, password] = account.split(':');
      if (!email || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      // Mock authentication check
      // In real implementation, this would make actual API calls
      const response = await this.mockApiCall(email, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(email: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // Mock logic - accounts with 'valid' in email are considered valid
    if (email.includes('valid')) {
      return { success: true };
    } else if (email.includes('banned')) {
      return { success: false, error: 'Account banned' };
    } else if (email.includes('expired')) {
      return { success: false, error: 'Account expired' };
    } else {
      // Random success rate of ~87%
      return Math.random() > 0.13 
        ? { success: true }
        : { success: false, error: 'Invalid credentials' };
    }
  }
}

class BolModule implements PlatformModule {
  name = 'bol.com';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      const [email, password] = account.split(':');
      if (!email || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      const response = await this.mockApiCall(email, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(email: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 300));
    
    // Random success rate of ~89%
    return Math.random() > 0.11 
      ? { success: true }
      : { success: false, error: 'Authentication failed' };
  }
}

class ZalandoModule implements PlatformModule {
  name = 'zalando';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      const [email, password] = account.split(':');
      if (!email || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      const response = await this.mockApiCall(email, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(email: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1800 + 400));
    
    // Random success rate of ~85%
    return Math.random() > 0.15 
      ? { success: true }
      : { success: false, error: 'Login failed' };
  }
}

class TelenetModule implements PlatformModule {
  name = 'telenet';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      const [username, password] = account.split(':');
      if (!username || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      const response = await this.mockApiCall(username, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(username: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2500 + 600));
    
    // Random success rate of ~79%
    return Math.random() > 0.21 
      ? { success: true }
      : { success: false, error: 'Invalid credentials' };
  }
}

class VodafoneModule implements PlatformModule {
  name = 'vodafone';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      const [username, password] = account.split(':');
      if (!username || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      const response = await this.mockApiCall(username, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(username: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2200 + 500));
    
    // Random success rate of ~82%
    return Math.random() > 0.18 
      ? { success: true }
      : { success: false, error: 'Authentication error' };
  }
}

class Tele2Module implements PlatformModule {
  name = 'tele2';

  async checkAccount(account: string, proxy?: any): Promise<CheckResult> {
    try {
      const [username, password] = account.split(':');
      if (!username || !password) {
        return { isValid: false, errorMessage: 'Invalid account format' };
      }

      const response = await this.mockApiCall(username, password, proxy);
      
      return {
        isValid: response.success,
        errorMessage: response.error
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async mockApiCall(username: string, password: string, proxy?: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 400));
    
    // Random success rate of ~76%
    return Math.random() > 0.24 
      ? { success: true }
      : { success: false, error: 'Login failed' };
  }
}

class PlatformModules {
  private modules: Map<string, PlatformModule> = new Map();

  constructor() {
    this.registerModule(new MarktplaatsModule());
    this.registerModule(new BolModule());
    this.registerModule(new ZalandoModule());
    this.registerModule(new TelenetModule());
    this.registerModule(new VodafoneModule());
    this.registerModule(new Tele2Module());
  }

  registerModule(module: PlatformModule) {
    this.modules.set(module.name, module);
  }

  getModule(platform: string): PlatformModule | undefined {
    return this.modules.get(platform.toLowerCase());
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.modules.keys());
  }
}

export const platformModules = new PlatformModules();
