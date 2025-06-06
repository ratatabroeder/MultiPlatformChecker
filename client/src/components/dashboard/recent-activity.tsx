import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle } from "lucide-react";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Mock activities if none provided
  const mockActivities = [
    {
      id: 1,
      message: "Marktplaats check completed",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: 2,
      message: "Proxy refresh completed",
      type: "info",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: 3,
      message: "CAPTCHA service switched",
      type: "warning",
      timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    },
    {
      id: 4,
      message: "Failed batch detected",
      type: "error",
      timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-400";
      case "warning":
        return "bg-yellow-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-blue-400";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayActivities.slice(0, 6).map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg"
          >
            <Circle 
              className={`w-2 h-2 ${getActivityDotColor(activity.type)} fill-current`} 
            />
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-slate-400">
                {activity.timestamp 
                  ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                  : "Just now"
                }
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
