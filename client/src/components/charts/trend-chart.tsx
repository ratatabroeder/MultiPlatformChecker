import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TrendChart() {
  const { data: successTrend = [] } = useQuery({
    queryKey: ["/api/analytics/success-trend"],
  });

  // Mock data if no data available
  const mockData = [
    { day: "Mon", successRate: 85.2 },
    { day: "Tue", successRate: 87.1 },
    { day: "Wed", successRate: 86.8 },
    { day: "Thu", successRate: 89.3 },
    { day: "Fri", successRate: 87.5 },
    { day: "Sat", successRate: 85.9 },
    { day: "Sun", successRate: 88.2 },
  ];

  const chartData = successTrend.length > 0 ? successTrend : mockData;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Success Rate Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis 
              domain={[80, 95]}
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
            <Line 
              type="monotone" 
              dataKey="successRate" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
