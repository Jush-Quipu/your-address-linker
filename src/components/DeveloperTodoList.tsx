
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, Circle, AlertCircle, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { DeveloperTodo, updateTodoStatus, deleteDeveloperTodo } from '@/services/developerTodoService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DeveloperTodoListProps {
  todos: DeveloperTodo[];
  onRefresh: () => void;
  onAddTodo: () => void;
  onSelectTodo: (todo: DeveloperTodo) => void;
}

const DeveloperTodoList: React.FC<DeveloperTodoListProps> = ({ 
  todos, 
  onRefresh,
  onAddTodo,
  onSelectTodo
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (todo: DeveloperTodo, newStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    setLoading({ ...loading, [todo.id]: true });
    try {
      await updateTodoStatus(todo.id, newStatus);
      onRefresh();
    } finally {
      setLoading({ ...loading, [todo.id]: false });
    }
  };

  const handleDelete = async (todoId: string) => {
    setLoading({ ...loading, [todoId]: true });
    try {
      await deleteDeveloperTodo(todoId);
      onRefresh();
    } finally {
      setLoading({ ...loading, [todoId]: false });
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" className="ml-2">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary" className="ml-2">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-amber-500" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Development Tasks</h2>
        <Button onClick={onAddTodo}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Todo
        </Button>
      </div>

      {todos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first development task to get started
            </p>
            <Button onClick={onAddTodo}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Todo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {todos.map(todo => (
            <Card key={todo.id} className={`transition-opacity ${todo.status === 'completed' ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <button 
                      className="mt-1"
                      onClick={() => {
                        const newStatus = todo.status === 'completed' 
                          ? 'not-started' 
                          : todo.status === 'in-progress' 
                            ? 'completed' 
                            : 'in-progress';
                        handleStatusChange(todo, newStatus);
                      }}
                      disabled={loading[todo.id]}
                    >
                      {getStatusIcon(todo.status)}
                    </button>
                    <div>
                      <CardTitle className="text-base">
                        {todo.title}
                        {getPriorityBadge(todo.priority)}
                      </CardTitle>
                      {todo.description && (
                        <CardDescription className="mt-1">
                          {todo.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this todo and all its subtasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(todo.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => onSelectTodo(todo)}
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperTodoList;
