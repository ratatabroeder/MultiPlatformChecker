import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Globe } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts.toLocaleString(),
      icon: Users,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
      change: "+12.3%",
      changeLabel: "from last week",
      changePositive: true,
    },
    {
      title: "Valid Accounts",
      value: stats.validAccounts.toLocaleString(),
      icon: CheckCircle,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/20",
      change: stats.successRate,
      changeLabel: "success rate",
      changePositive: true,
    },
    {
      title: "Invalid Accounts",
      value: stats.invalidAccounts.toLocaleString(),
      icon: XCircle,
      iconColor: "text-red-400",
      bgColor: "bg-red-500/20",
      change: `${(100 - parseFloat(stats.successRate)).toFixed(1)}%`,
      changeLabel: "failure rate",
      changePositive: false,
    },
    {
      title: "Active Proxies",
      value: stats.activeProxies.toString(),
      icon: Globe,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
      change: "74.2%",
      changeLabel: "uptime",
      changePositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${card.iconColor} text-xl w-6 h-6`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className={card.changePositive ? "text-green-400" : "text-red-400"}>
                  {card.change}
                </span>
                <span className="text-slate-400 ml-1">{card.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
