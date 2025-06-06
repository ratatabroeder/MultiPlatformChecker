import { AccountList } from '@shared/schema';
import { storage } from '../storage';
import { platformModules } from './platform-modules';
import { sendProgressUpdate, sendActivityUpdate } from '../websocket';

class AccountChecker {
  private activeChecks = new Map<number, boolean>();
  private checkQueue: AccountList[] = [];
  private concurrencyLimit = 5;

  async startChecking(list: AccountList) {
    if (this.activeChecks.has(list.id)) {
      throw new Error('Checking already in progress for this list');
    }

    this.activeChecks.set(list.id, true);
    
    try {
      await this.processAccountList(list);
    } catch (error) {
      console.error('Error checking account list:', error);
      await storage.addActivity({
        message: `Error checking list "${list.name}": ${error}`,
        type: 'error'
      });
    } finally {
      this.activeChecks.delete(list.id);
    }
  }

  private async processAccountList(list: AccountList) {
    const { accounts = [], platform } = list;
    const total = accounts.length;
    let processed = 0;
    let valid = 0;
    let invalid = 0;

    // Update list status
    await storage.updateAccountList(list.id, { 
      status: 'checking',
      progress: 0 
    });

    // Get working proxies
    const workingProxies = await storage.getWorkingProxies();
    let proxyIndex = 0;

    // Process accounts in batches
    const batchSize = this.concurrencyLimit;
    for (let i = 0; i < accounts.length; i += batchSize) {
      const batch = accounts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (account) => {
        const proxy = workingProxies[proxyIndex % workingProxies.length];
        proxyIndex++;

        const result = await this.checkAccount(account, platform, proxy);
        
        // Save result
        await storage.createCheckResult({
          listId: list.id,
          account,
          platform,
          isValid: result.isValid,
          responseTime: result.responseTime,
          errorMessage: result.errorMessage,
          proxyUsed: proxy ? `${proxy.host}:${proxy.port}` : null,
        });

        if (result.isValid) {
          valid++;
        } else {
          invalid++;
        }
        
        processed++;
        const progress = Math.round((processed / total) * 100);
        
        // Update progress
        await storage.updateAccountList(list.id, {
          progress,
          validAccounts: valid,
          invalidAccounts: invalid,
        });

        // Send real-time update
        sendProgressUpdate(list.id, progress);
        
        return result;
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark as completed
    await storage.updateAccountList(list.id, { 
      status: 'completed',
      progress: 100,
      validAccounts: valid,
      invalidAccounts: invalid,
    });

    const activity = {
      message: `Completed checking "${list.name}": ${valid} valid, ${invalid} invalid`,
      type: 'success' as const
    };
    
    await storage.addActivity(activity);
    sendActivityUpdate(activity);
  }

  private async checkAccount(account: string, platform: string, proxy?: any): Promise<{
    isValid: boolean;
    responseTime?: number;
    errorMessage?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Get platform module
      const module = platformModules.getModule(platform);
      if (!module) {
        return {
          isValid: false,
          errorMessage: `Unsupported platform: ${platform}`
        };
      }

      // Check account using platform module
      const result = await module.checkAccount(account, proxy);
      const responseTime = Date.now() - startTime;

      return {
        isValid: result.isValid,
        responseTime,
        errorMessage: result.errorMessage,
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        isValid: false,
        responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  isChecking(listId: number): boolean {
    return this.activeChecks.has(listId);
  }

  getActiveChecksCount(): number {
    return this.activeChecks.size;
  }
}

export const accountChecker = new AccountChecker();
