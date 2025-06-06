import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CheckingProgress } from "@/components/dashboard/checking-progress";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProxyManagement } from "@/components/proxy/proxy-management";
import { AccountLists } from "@/components/accounts/account-lists";
import { PlatformChart } from "@/components/charts/platform-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { useWebSocket } from "@/lib/websocket";
import { WebSocketMessage } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAccounts: 2847,
    validAccounts: 2486,
    invalidAccounts: 361,
    activeProxies: 89,
    activeChecks: 24,
    queueSize: 156,
    proxiesOnline: 89,
    totalProxies: 120,
    successRate: "87.3%",
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const { data: accountLists } = useQuery({
    queryKey: ["/api/account-lists"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    refetchInterval: 10000,
  });

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'stats-update':
        setStats(prev => ({ ...prev, ...message.data }));
        break;
      case 'progress-update':
        // Handle progress updates
        break;
      case 'activity-update':
        // Handle new activities
        break;
    }
  };

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const currentStats = systemStats || stats;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <Header systemStatus={isConnected ? "online" : "offline"} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar stats={currentStats} />
        
        <main className="flex-1 overflow-y-auto bg-slate-900">
          <div className="p-6 space-y-6">
            <StatsCards stats={currentStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CheckingProgress accountLists={accountLists || []} />
              <RecentActivity activities={activities || []} />
            </div>
            
            <ProxyManagement />
            
            <AccountLists />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlatformChart />
              <TrendChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
