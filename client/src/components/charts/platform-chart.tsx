import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PlatformChart() {
  const { data: platformPerformance = [] } = useQuery({
    queryKey: ["/api/analytics/platform-performance"],
  });

  // Mock data if no data available
  const mockData = [
    { platform: "Marktplaats.nl", successRate: 87.3, total: 450, valid: 393, invalid: 57 },
    { platform: "Bol.com", successRate: 89.2, total: 280, valid: 250, invalid: 30 },
    { platform: "Zalando", successRate: 85.1, total: 220, valid: 187, invalid: 33 },
    { platform: "Telenet", successRate: 78.9, total: 150, valid: 118, invalid: 32 },
    { platform: "Vodafone", successRate: 82.4, total: 180, valid: 148, invalid: 32 },
    { platform: "Tele2", successRate: 75.6, total: 120, valid: 91, invalid: 29 },
  ];

  const chartData = platformPerformance.length > 0 ? platformPerformance : mockData;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Platform Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="platform" 
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1e293b", 
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#ffffff"
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Success Rate"]}
            />
            <Bar 
              dataKey="successRate" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
