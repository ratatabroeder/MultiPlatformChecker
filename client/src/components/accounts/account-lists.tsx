import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Upload, 
  Plus, 
  Play, 
  Download, 
  Trash2, 
  Pause, 
  FileText 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AccountList } from "@shared/schema";

export function AccountLists() {
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: accountLists = [] } = useQuery({
    queryKey: ["/api/account-lists"],
    refetchInterval: 5000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/account-lists/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File Uploaded",
        description: `Successfully uploaded ${data.name} with ${data.totalAccounts} accounts`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/account-lists"] });
      setUploadingFile(false);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload account list",
        variant: "destructive",
      });
      setUploadingFile(false);
    },
  });

  const checkListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await apiRequest("POST", `/api/account-lists/${listId}/check`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check Started",
        description: "Account checking has been started for this list",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/account-lists"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start account checking",
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await apiRequest("DELETE", `/api/account-lists/${listId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "List Deleted",
        description: "Account list has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/account-lists"] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete account list",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
    formData.append("platform", "unknown");

    uploadMutation.mutate(formData);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCheckList = (listId: number) => {
    checkListMutation.mutate(listId);
  };

  const handleExportList = async (listId: number) => {
    try {
      const response = await fetch(`/api/results/export/${listId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `account_list_${listId}_results.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Complete",
          description: "Results have been exported to CSV",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results",
        variant: "destructive",
      });
    }
  };

  const handleDeleteList = (listId: number) => {
    if (confirm("Are you sure you want to delete this account list?")) {
      deleteListMutation.mutate(listId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400">Complete</Badge>;
      case "checking":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Checking</Badge>;
      case "paused":
        return <Badge className="bg-blue-500/20 text-blue-400">Paused</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">Pending</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      "marktplaats.nl": "bg-blue-500/20 text-blue-400",
      "bol.com": "bg-green-500/20 text-green-400",
      "zalando": "bg-purple-500/20 text-purple-400",
      "telenet": "bg-orange-500/20 text-orange-400",
      "vodafone": "bg-red-500/20 text-red-400",
      "tele2": "bg-cyan-500/20 text-cyan-400",
    };
    
    return (
      <Badge className={colors[platform.toLowerCase()] || "bg-slate-500/20 text-slate-400"}>
        {platform}
      </Badge>
    );
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Account Lists
          </CardTitle>
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              disabled={uploadingFile}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload List
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">List Name</TableHead>
                <TableHead className="text-slate-300">Platform</TableHead>
                <TableHead className="text-slate-300">Total</TableHead>
                <TableHead className="text-slate-300">Valid</TableHead>
                <TableHead className="text-slate-300">Invalid</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountLists.map((list: AccountList) => (
                <TableRow key={list.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{list.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlatformBadge(list.platform)}
                  </TableCell>
                  <TableCell className="text-white text-sm">{list.totalAccounts}</TableCell>
                  <TableCell>
                    <span className="text-green-400 text-sm font-medium">
                      {list.validAccounts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-400 text-sm font-medium">
                      {list.invalidAccounts}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(list.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {list.status === "checking" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-yellow-400 hover:text-yellow-300 p-1 h-auto"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckList(list.id)}
                          className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportList(list.id)}
                        className="text-green-400 hover:text-green-300 p-1 h-auto"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteList(list.id)}
                        className="text-red-400 hover:text-red-300 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {accountLists.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No account lists found. Upload a file to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
