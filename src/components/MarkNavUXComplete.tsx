
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LovableTodoManager } from '@/utils/lovableTodoManager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ListChecks } from 'lucide-react';

const MarkNavUXComplete: React.FC = () => {
  const [marking, setMarking] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      // Mark the main todo as complete
      const success = await LovableTodoManager.markTodoCompleted("Navigation & User Experience");
      
      if (success) {
        toast.success("Navigation & User Experience todo marked as completed!");
        setCompleted(true);
      } else {
        toast.error("Failed to mark todo as completed");
      }
    } catch (error) {
      console.error("Error marking todo as complete:", error);
      toast.error("An error occurred while marking the todo as complete");
    } finally {
      setMarking(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <ListChecks className="mr-2 h-5 w-5 text-primary" />
          Navigation & User Experience Implementation
        </CardTitle>
        <CardDescription>
          Mark the "Navigation & User Experience" todo and subtasks as complete
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-1">
        <p className="text-sm">
          The implementation includes:
        </p>
        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
          <li>Consistent breadcrumbs across developer pages</li>
          <li>Development mode indicators</li>
          <li>Visual cues for sandbox/production environments</li>
          <li>Sidebar navigation for developer section</li>
          <li>Todo list link in navigation menu</li>
        </ul>
      </CardContent>
      <CardFooter>
        {completed ? (
          <Button disabled className="w-full bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Todo Marked as Complete!
          </Button>
        ) : (
          <Button 
            onClick={handleMarkComplete} 
            disabled={marking}
            className="w-full"
          >
            {marking ? "Marking..." : "Mark Todo as Complete"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MarkNavUXComplete;
