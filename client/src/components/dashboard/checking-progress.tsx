import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Circle } from "lucide-react";
import { AccountList } from "@shared/schema";

interface CheckingProgressProps {
  accountLists: AccountList[];
}

export function CheckingProgress({ accountLists }: CheckingProgressProps) {
  // Mock platform progress data
  const platformProgress = [
    { platform: "Marktplaats.nl", progress: 72, checked: 324, total: 450, color: "bg-blue-500" },
    { platform: "Bol.com", progress: 71, checked: 198, total: 280, color: "bg-green-500" },
    { platform: "Zalando", progress: 71, checked: 156, total: 220, color: "bg-purple-500" },
    { platform: "Telenet", progress: 59, checked: 89, total: 150, color: "bg-yellow-500" },
  ];

  const overallProgress = 69.7;
  const overallChecked = 767;
  const overallTotal = 1100;

  return (
    <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Account Checking Progress
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Circle className="w-2 h-2 text-green-400 fill-green-400 animate-pulse" />
              <span>Checking in progress...</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {platformProgress.map((platform) => (
            <div key={platform.platform}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">
                  {platform.platform}
                </span>
                <span className="text-sm text-slate-400">
                  {platform.checked}/{platform.total} ({platform.progress}%)
                </span>
              </div>
              <Progress 
                value={platform.progress} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">Overall Progress</span>
            <span className="text-sm text-slate-400">
              {overallChecked}/{overallTotal} ({overallProgress}%)
            </span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>ETA: 12 minutes</span>
            <span>~2.3 checks/sec</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
