import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCheck, Circle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ProxyManagement() {
  const [isScrapingProxies, setIsScrapingProxies] = useState(false);
  const [isTestingProxies, setIsTestingProxies] = useState(false);
  const { toast } = useToast();

  const { data: proxies = [] } = useQuery({
    queryKey: ["/api/proxies"],
    refetchInterval: 10000,
  });

  const scrapeProxiesMutation = useMutation({
    mutationFn: async (sources: string[]) => {
      const response = await apiRequest("POST", "/api/proxies/scrape", { sources });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Proxies Scraped",
        description: `Successfully scraped ${data.count} new proxies`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to scrape proxies",
        variant: "destructive",
      });
    },
  });

  const testProxiesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/proxies/test", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Proxies Tested",
        description: `Tested ${data.testedCount} proxies`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test proxies",
        variant: "destructive",
      });
    },
  });

  const handleScrapeProxies = () => {
    setIsScrapingProxies(true);
    scrapeProxiesMutation.mutate(['freeproxylist', 'proxynova', 'hidemy']);
    setTimeout(() => setIsScrapingProxies(false), 3000);
  };

  const handleTestAllProxies = () => {
    setIsTestingProxies(true);
    testProxiesMutation.mutate();
    setTimeout(() => setIsTestingProxies(false), 5000);
  };

  const workingProxies = proxies.filter((p: any) => p.isWorking);
  const failedProxies = proxies.filter((p: any) => !p.isWorking && p.lastTested);
  const testingProxies = proxies.filter((p: any) => !p.lastTested);
  const avgSpeed = workingProxies.length > 0 
    ? (workingProxies.reduce((sum: number, p: any) => sum + (p.responseTime || 0), 0) / workingProxies.length / 1000).toFixed(1) + 's'
    : '0s';

  const proxySources = [
    { name: "FreeProxyList", count: 23, isActive: true },
    { name: "ProxyNova", count: 45, isActive: true },
    { name: "HideMy.name", count: 21, isActive: false },
  ];

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Proxy Management
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleScrapeProxies}
              disabled={isScrapingProxies}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScrapingProxies ? 'animate-spin' : ''}`} />
              Scrape New
            </Button>
            <Button
              onClick={handleTestAllProxies}
              disabled={isTestingProxies}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Test All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Proxy Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{workingProxies.length}</div>
                <div className="text-sm text-slate-400">Working</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{failedProxies.length}</div>
                <div className="text-sm text-slate-400">Failed</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{testingProxies.length}</div>
                <div className="text-sm text-slate-400">Testing</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{avgSpeed}</div>
                <div className="text-sm text-slate-400">Avg Speed</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Active Sources</h3>
            <div className="space-y-2">
              {proxySources.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Circle 
                      className={`w-2 h-2 ${source.isActive ? 'bg-green-400' : 'bg-yellow-400'} fill-current`} 
                    />
                    <span className="text-sm text-white">{source.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">{source.count} proxies</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 text-xs p-1 h-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
