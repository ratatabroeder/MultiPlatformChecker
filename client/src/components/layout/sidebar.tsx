import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Store, 
  ChartLine, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/types";

interface SidebarProps {
  stats: DashboardStats;
}

export function Sidebar({ stats }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: BarChart3, label: "Dashboard" },
    { href: "/accounts", icon: Users, label: "Account Lists" },
    { href: "/proxies", icon: Globe, label: "Proxy Manager" },
    { href: "/platforms", icon: Store, label: "Platforms" },
    { href: "/results", icon: ChartLine, label: "Results" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/" && location === "/dashboard");
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 mt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">System Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Active Checks</span>
            <span className="text-blue-400 font-medium">{stats.activeChecks}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Queue Size</span>
            <span className="text-yellow-400 font-medium">{stats.queueSize}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Proxies Online</span>
            <span className="text-green-400 font-medium">
              {stats.proxiesOnline}/{stats.totalProxies}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Success Rate</span>
            <span className="text-green-400 font-medium">{stats.successRate}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
