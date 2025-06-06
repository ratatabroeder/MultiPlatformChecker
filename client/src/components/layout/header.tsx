import { Button } from "@/components/ui/button";
import { Shield, Play, Download, Settings, Circle } from "lucide-react";

interface HeaderProps {
  systemStatus: "online" | "offline";
}

export function Header({ systemStatus }: HeaderProps) {
  const handleStartBatchCheck = () => {
    // TODO: Implement batch check start
    console.log("Starting batch check...");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting results...");
  };

  const handleSettings = () => {
    // TODO: Implement settings modal
    console.log("Opening settings...");
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">
            <Shield className="inline-block w-6 h-6 text-blue-400 mr-2" />
            Account Checker Pro
          </h1>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Circle 
              className={`w-2 h-2 ${systemStatus === 'online' ? 'text-green-400 fill-green-400' : 'text-red-400 fill-red-400'} animate-pulse-slow`} 
            />
            <span>System {systemStatus === 'online' ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleStartBatchCheck}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Batch Check
          </Button>
          
          <Button 
            onClick={handleExport}
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button 
            onClick={handleSettings}
            variant="outline"
            size="icon"
            className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
