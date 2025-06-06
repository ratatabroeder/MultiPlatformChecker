import { 
  users, 
  proxies, 
  accountLists, 
  checkResults, 
  systemStats, 
  activities,
  type User, 
  type InsertUser,
  type Proxy,
  type InsertProxy,
  type AccountList,
  type InsertAccountList,
  type CheckResult,
  type InsertCheckResult,
  type SystemStats,
  type Activity,
  type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Proxies
  getAllProxies(): Promise<Proxy[]>;
  getWorkingProxies(): Promise<Proxy[]>;
  getProxy(id: number): Promise<Proxy | undefined>;
  createProxy(proxy: InsertProxy): Promise<Proxy>;
  updateProxy(id: number, updates: Partial<Proxy>): Promise<Proxy | undefined>;
  deleteProxy(id: number): Promise<boolean>;
  bulkCreateProxies(proxies: InsertProxy[]): Promise<Proxy[]>;

  // Account Lists
  getAllAccountLists(): Promise<AccountList[]>;
  getAccountList(id: number): Promise<AccountList | undefined>;
  createAccountList(list: InsertAccountList): Promise<AccountList>;
  updateAccountList(id: number, updates: Partial<AccountList>): Promise<AccountList | undefined>;
  deleteAccountList(id: number): Promise<boolean>;

  // Check Results
  getCheckResults(listId?: number): Promise<CheckResult[]>;
  createCheckResult(result: InsertCheckResult): Promise<CheckResult>;
  getResultsByPlatform(platform: string): Promise<CheckResult[]>;

  // System Stats
  getLatestStats(): Promise<SystemStats | undefined>;
  updateStats(stats: Partial<SystemStats>): Promise<SystemStats>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  addActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private proxies: Map<number, Proxy>;
  private accountLists: Map<number, AccountList>;
  private checkResults: Map<number, CheckResult>;
  private systemStats: SystemStats;
  private activities: Map<number, Activity>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.proxies = new Map();
    this.accountLists = new Map();
    this.checkResults = new Map();
    this.activities = new Map();
    this.currentId = {
      users: 1,
      proxies: 1,
      accountLists: 1,
      checkResults: 1,
      activities: 1,
    };

    // Initialize system stats with some default data
    this.systemStats = {
      id: 1,
      totalAccounts: 2847,
      validAccounts: 2486,
      invalidAccounts: 361,
      activeProxies: 89,
      activeChecks: 24,
      queueSize: 156,
      proxiesOnline: 89,
      totalProxies: 120,
      successRate: "87.3%",
      timestamp: new Date(),
    };
    
    // Initialize with some sample data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add some initial proxy data
    const sampleProxies = [
      { host: "proxy1.example.com", port: 8080, type: "http", source: "manual", isWorking: true },
      { host: "proxy2.example.com", port: 1080, type: "socks5", source: "manual", isWorking: true },
      { host: "proxy3.example.com", port: 8080, type: "http", source: "manual", isWorking: false },
    ];
    
    // Initialize synchronously to avoid async constructor issues
    setTimeout(async () => {
      for (const proxy of sampleProxies) {
        await this.createProxy(proxy);
      }
      
      // Add some initial activities
      const sampleActivities = [
        { message: "Account checking started for Marktplaats list", type: "info" },
        { message: "Successfully validated 156 accounts", type: "success" },
        { message: "Proxy test completed - 89/120 working", type: "info" },
      ];
      
      for (const activity of sampleActivities) {
        await this.addActivity(activity);
      }
      
      // Add sample account lists
      const sampleLists = [
        {
          name: "Marktplaats Accounts",
          platform: "marktplaats.nl",
          totalAccounts: 1500,
          validAccounts: 1320,
          invalidAccounts: 180,
          status: "completed",
          progress: 100,
          accounts: ["user1@example.com:pass1", "user2@example.com:pass2"]
        },
        {
          name: "Bol.com Accounts", 
          platform: "bol.com",
          totalAccounts: 847,
          validAccounts: 766,
          invalidAccounts: 81,
          status: "checking",
          progress: 65,
          accounts: ["user3@example.com:pass3", "user4@example.com:pass4"]
        }
      ];
      
      for (const list of sampleLists) {
        await this.createAccountList(list);
      }
    }, 0);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Proxies
  async getAllProxies(): Promise<Proxy[]> {
    return Array.from(this.proxies.values());
  }

  async getWorkingProxies(): Promise<Proxy[]> {
    return Array.from(this.proxies.values()).filter(proxy => proxy.isWorking);
  }

  async getProxy(id: number): Promise<Proxy | undefined> {
    return this.proxies.get(id);
  }

  async createProxy(insertProxy: InsertProxy): Promise<Proxy> {
    const id = this.currentId.proxies++;
    const proxy: Proxy = {
      ...insertProxy,
      id,
      createdAt: new Date(),
      lastTested: null,
      country: insertProxy.country || null,
      city: insertProxy.city || null,
      isWorking: insertProxy.isWorking || false,
      responseTime: insertProxy.responseTime || null,
    };
    this.proxies.set(id, proxy);
    return proxy;
  }

  async updateProxy(id: number, updates: Partial<Proxy>): Promise<Proxy | undefined> {
    const existing = this.proxies.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.proxies.set(id, updated);
    return updated;
  }

  async deleteProxy(id: number): Promise<boolean> {
    return this.proxies.delete(id);
  }

  async bulkCreateProxies(insertProxies: InsertProxy[]): Promise<Proxy[]> {
    const proxies: Proxy[] = [];
    for (const insertProxy of insertProxies) {
      const proxy = await this.createProxy(insertProxy);
      proxies.push(proxy);
    }
    return proxies;
  }

  // Account Lists
  async getAllAccountLists(): Promise<AccountList[]> {
    return Array.from(this.accountLists.values());
  }

  async getAccountList(id: number): Promise<AccountList | undefined> {
    return this.accountLists.get(id);
  }

  async createAccountList(insertList: InsertAccountList): Promise<AccountList> {
    const id = this.currentId.accountLists++;
    const list: AccountList = {
      ...insertList,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertList.status || 'pending',
      progress: insertList.progress || 0,
      totalAccounts: insertList.totalAccounts || 0,
      validAccounts: insertList.validAccounts || 0,
      invalidAccounts: insertList.invalidAccounts || 0,
      accounts: insertList.accounts || [],
    };
    this.accountLists.set(id, list);
    return list;
  }

  async updateAccountList(id: number, updates: Partial<AccountList>): Promise<AccountList | undefined> {
    const existing = this.accountLists.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.accountLists.set(id, updated);
    return updated;
  }

  async deleteAccountList(id: number): Promise<boolean> {
    // Also delete related check results
    const results = Array.from(this.checkResults.values()).filter(r => r.listId === id);
    results.forEach(r => this.checkResults.delete(r.id));
    
    return this.accountLists.delete(id);
  }

  // Check Results
  async getCheckResults(listId?: number): Promise<CheckResult[]> {
    const results = Array.from(this.checkResults.values());
    return listId ? results.filter(r => r.listId === listId) : results;
  }

  async createCheckResult(insertResult: InsertCheckResult): Promise<CheckResult> {
    const id = this.currentId.checkResults++;
    const result: CheckResult = {
      ...insertResult,
      id,
      checkedAt: new Date(),
      listId: insertResult.listId || null,
      responseTime: insertResult.responseTime || null,
      isValid: insertResult.isValid || false,
      errorMessage: insertResult.errorMessage || null,
      proxyUsed: insertResult.proxyUsed || null,
    };
    this.checkResults.set(id, result);
    return result;
  }

  async getResultsByPlatform(platform: string): Promise<CheckResult[]> {
    return Array.from(this.checkResults.values()).filter(r => r.platform === platform);
  }

  // System Stats
  async getLatestStats(): Promise<SystemStats | undefined> {
    return this.systemStats;
  }

  async updateStats(updates: Partial<SystemStats>): Promise<SystemStats> {
    this.systemStats = { ...this.systemStats, ...updates, timestamp: new Date() };
    return this.systemStats;
  }

  // Activities
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
    return activities;
  }

  async addActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activities++;
    const activity: Activity = {
      ...insertActivity,
      id,
      timestamp: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
