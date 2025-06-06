export interface DashboardStats {
  totalAccounts: number;
  validAccounts: number;
  invalidAccounts: number;
  activeProxies: number;
  activeChecks: number;
  queueSize: number;
  proxiesOnline: number;
  totalProxies: number;
  successRate: string;
}

export interface PlatformProgress {
  platform: string;
  progress: number;
  total: number;
  checked: number;
}

export interface ProxyStats {
  working: number;
  failed: number;
  testing: number;
  avgSpeed: string;
}

export interface ProxySource {
  name: string;
  count: number;
  isActive: boolean;
}

export interface PlatformPerformance {
  platform: string;
  successRate: number;
  total: number;
  valid: number;
  invalid: number;
}

export interface SuccessTrend {
  day: string;
  successRate: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}
