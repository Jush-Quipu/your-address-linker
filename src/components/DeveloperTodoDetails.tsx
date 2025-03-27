
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  PlusCircle, 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import { 
  DeveloperTodo, 
  DeveloperSubtask, 
  createDeveloperSubtask, 
  updateSubtaskStatus, 
  updateTodoStatus 
} from '@/services/developerTodoService';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeveloperTodoDetailsProps {
  todo: DeveloperTodo;
  onBack: () => void;
  onRefresh: () => void;
}

const DeveloperTodoDetails: React.FC<DeveloperTodoDetailsProps> = ({ 
  todo, 
  onBack,
  onRefresh 
}) => {
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    
    setAdding(true);
    try {
      await createDeveloperSubtask({
        todo_id: todo.id,
        title: subtaskTitle
      });
      setSubtaskTitle('');
      onRefresh();
    } finally {
      setAdding(false);
    }
  };

  const handleSubtaskStatusChange = async (subtask: DeveloperSubtask) => {
    setUpdating({ ...updating, [subtask.id]: true });
    try {
      const newStatus = subtask.status === 'completed' 
        ? 'not-started' 
        : subtask.status === 'in-progress' 
          ? 'completed' 
          : 'in-progress';
      
      await updateSubtaskStatus(subtask.id, newStatus);
      onRefresh();
    } finally {
      setUpdating({ ...updating, [subtask.id]: false });
    }
  };

  const handleStatusChange = async (status: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    setStatusUpdating(true);
    try {
      await updateTodoStatus(todo.id, status);
      onRefresh();
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusIcon = (status: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const completedSubtasks = todo.subtasks?.filter(s => s.status === 'completed').length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Todo Details</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                {todo.title}
              </CardTitle>
              {todo.description && (
                <CardDescription className="mt-1">
                  {todo.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getPriorityBadge(todo.priority)}
              <Select 
                defaultValue={todo.status} 
                onValueChange={(value) => handleStatusChange(value as any)} 
                disabled={statusUpdating}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started" className="flex items-center">
                    <div className="flex items-center">
                      <Circle className="h-4 w-4 text-gray-300 mr-2" />
                      Not Started
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-amber-500 mr-2" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      Blocked
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              Subtasks ({completedSubtasks} of {totalSubtasks} completed)
            </h3>
            {totalSubtasks > 0 && completedSubtasks === totalSubtasks && (
              <Badge variant="success" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Complete
              </Badge>
            )}
          </div>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <Input
              placeholder="Add a subtask..."
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              className="flex-grow"
              disabled={adding}
            />
            <Button type="submit" disabled={adding || !subtaskTitle.trim()}>
              {adding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </form>

          <div className="space-y-2 mt-4">
            {todo.subtasks && todo.subtasks.length > 0 ? (
              todo.subtasks.map((subtask) => (
                <div 
                  key={subtask.id} 
                  className={`flex items-start p-2 border rounded ${
                    subtask.status === 'completed' ? 'bg-green-50 border-green-100' : 
                    subtask.status === 'in-progress' ? 'bg-amber-50 border-amber-100' : 
                    subtask.status === 'blocked' ? 'bg-red-50 border-red-100' : 
                    'bg-gray-50 border-gray-100'
                  }`}
                >
                  <button
                    className="mt-0.5 mr-2"
                    onClick={() => handleSubtaskStatusChange(subtask)}
                    disabled={updating[subtask.id]}
                  >
                    {updating[subtask.id] ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    ) : getStatusIcon(subtask.status)}
                  </button>
                  <div className="flex-grow">
                    <p className={`text-sm ${subtask.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {subtask.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(subtask.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                <p>No subtasks yet. Add some subtasks to break down this todo.</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between text-xs text-gray-500">
          <div>Created: {format(new Date(todo.created_at), 'MMM d, yyyy HH:mm')}</div>
          <div>Updated: {format(new Date(todo.updated_at), 'MMM d, yyyy HH:mm')}</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeveloperTodoDetails;
