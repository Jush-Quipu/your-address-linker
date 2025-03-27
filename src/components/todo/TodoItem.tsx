
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Todo, Subtask, updateTodo, updateSubtask } from '@/services/todoService';
import { toast } from 'sonner';

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (itemStatus: string) => {
    switch(itemStatus) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'not-started':
        return <X className="h-4 w-4 text-gray-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (itemPriority: string) => {
    switch(itemPriority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const handleSubtaskStatusChange = async (subtask: Subtask, checked: boolean) => {
    try {
      const newStatus = checked ? 'completed' : 'in-progress';
      await updateSubtask(subtask.id, { status: newStatus });
      toast.success(`Subtask ${checked ? 'completed' : 'marked as in progress'}`);
      onUpdate();
    } catch (error) {
      console.error('Error updating subtask status:', error);
      toast.error('Failed to update subtask status');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getStatusIcon(todo.status)}
            <CardTitle className="text-lg ml-2">{todo.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            {getPriorityBadge(todo.priority)}
            <Badge 
              variant={todo.status === 'completed' ? 'success' : 
                      todo.status === 'in-progress' ? 'default' : 
                      todo.status === 'blocked' ? 'destructive' : 'outline'}
            >
              {todo.status === 'completed' ? 'Completed' : 
               todo.status === 'in-progress' ? 'In Progress' : 
               todo.status === 'blocked' ? 'Blocked' : 'Not Started'}
            </Badge>
          </div>
        </div>
        <CardDescription>{todo.description}</CardDescription>
      </CardHeader>
      {todo.subtasks && todo.subtasks.length > 0 && (
        <CardContent>
          <button 
            className="text-sm text-blue-500 mb-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Subtasks' : 'Show Subtasks'}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {todo.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`subtask-${subtask.id}`} 
                    checked={subtask.status === 'completed'}
                    onCheckedChange={(checked) => handleSubtaskStatusChange(subtask, checked as boolean)}
                  />
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor={`subtask-${subtask.id}`}
                      className={subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}
                    >
                      {subtask.title}
                    </label>
                    {subtask.status === 'in-progress' && (
                      <Badge variant="outline" className="bg-blue-50">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default TodoItem;
