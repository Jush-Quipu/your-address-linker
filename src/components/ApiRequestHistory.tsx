
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Trash2, PlayCircle } from 'lucide-react';
import { ApiTestCase } from '@/utils/apiTesting';

interface RequestHistoryItem {
  id: string;
  timestamp: Date;
  testCase: ApiTestCase;
  status?: number;
  duration?: number;
}

interface ApiRequestHistoryProps {
  history: RequestHistoryItem[];
  onSelectRequest: (testCase: ApiTestCase) => void;
  onClearHistory: () => void;
}

const ApiRequestHistory: React.FC<ApiRequestHistoryProps> = ({ 
  history, 
  onSelectRequest, 
  onClearHistory 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base">Request History</CardTitle>
            <CardDescription>Previous API requests</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClearHistory} title="Clear history">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p>No request history yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 border rounded-md flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                  onClick={() => onSelectRequest(item.testCase)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.testCase.method}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {item.testCase.endpoint.split('/').pop()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status && (
                      <Badge 
                        variant={item.status >= 200 && item.status < 300 ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiRequestHistory;
