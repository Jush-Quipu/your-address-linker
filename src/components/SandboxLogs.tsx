
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Download, ArrowDownUp, Search, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface SandboxLogItem {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'info';
  message: string;
  details?: any;
  endpoint?: string;
  method?: string;
  status?: number;
}

interface SandboxLogsProps {
  logs: SandboxLogItem[];
  onClearLogs: () => void;
}

const SandboxLogs: React.FC<SandboxLogsProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredLogs = logs
    .filter(log => {
      if (filter === 'all') return true;
      return log.type === filter;
    })
    .filter(log => {
      if (!searchText) return true;
      const search = searchText.toLowerCase();
      return (
        log.message.toLowerCase().includes(search) ||
        (log.endpoint && log.endpoint.toLowerCase().includes(search)) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.timestamp.getTime() - b.timestamp.getTime();
      } else {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  const logTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'bg-blue-100 text-blue-800';
      case 'response': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColor = (status?: number) => {
    if (!status) return '';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400) return 'destructive';
    return 'secondary';
  };

  const downloadLogs = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandbox-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sandbox Logs</CardTitle>
            <CardDescription>
              Activity logs for sandbox API interactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              <ArrowDownUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadLogs}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClearLogs}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="request">Requests</TabsTrigger>
              <TabsTrigger value="response">Responses</TabsTrigger>
              <TabsTrigger value="error">Errors</TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8 w-[200px]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Clock className="h-12 w-12 mb-4" />
              <p>No logs available</p>
              <p className="text-sm">API activity will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded text-xs ${logTypeColor(log.type)}`}>
                          {log.type.toUpperCase()}
                        </div>
                        {log.method && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.method}
                          </Badge>
                        )}
                        {log.status && (
                          <Badge variant={statusColor(log.status)}>
                            {log.status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {log.endpoint && (
                      <div className="text-sm font-mono mb-2 text-muted-foreground">
                        {log.endpoint}
                      </div>
                    )}
                    
                    <div className="text-sm">{log.message}</div>
                    
                    {log.details && (
                      <div className="mt-2 border-t pt-2">
                        <div className="text-xs font-medium mb-1">Details:</div>
                        <pre className="text-xs overflow-auto bg-muted p-2 rounded-sm max-h-[100px]">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SandboxLogs;
