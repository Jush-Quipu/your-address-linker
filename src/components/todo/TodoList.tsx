
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TodoItem from './TodoItem';
import { Todo, getAllTodos } from '@/services/todoService';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const TodoList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const { 
    data: todoItems = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['todos'],
    queryFn: getAllTodos,
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });

  const completedItems = todoItems.filter(item => item.status === 'completed');
  const inProgressItems = todoItems.filter(item => item.status === 'in-progress');
  const notStartedItems = todoItems.filter(item => item.status === 'not-started');
  const blockedItems = todoItems.filter(item => item.status === 'blocked');

  const totalSubtasks = todoItems.reduce((total, item) => 
    total + (item.subtasks?.length || 0), 0);
  
  const completedSubtasks = todoItems.reduce((total, item) => 
    total + (item.subtasks?.filter(subtask => subtask.status === 'completed').length || 0), 0);
  
  const percentageComplete = Math.round((completedSubtasks / totalSubtasks) * 100) || 0;

  const handleTodoUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading todo items...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading todo items</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Developer Portal Todo List</h1>
        <p className="text-muted-foreground mb-4">
          Tracking implementation progress of SecureAddress Bridge developer features
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{percentageComplete}%</div>
              <div className="text-sm text-muted-foreground">
                {completedSubtasks} of {totalSubtasks} tasks completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{completedItems.length}</div>
              <div className="text-sm text-muted-foreground">
                features fully implemented
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{inProgressItems.length}</div>
              <div className="text-sm text-muted-foreground">
                features being implemented
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Not Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">{notStartedItems.length + blockedItems.length}</div>
              <div className="text-sm text-muted-foreground">
                features pending implementation
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks ({todoItems.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressItems.length})</TabsTrigger>
          <TabsTrigger value="not-started">Not Started ({notStartedItems.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
          {blockedItems.length > 0 && (
            <TabsTrigger value="blocked">Blocked ({blockedItems.length})</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="space-y-2">
            {todoItems.map((item) => (
              <TodoItem key={item.id} todo={item} onUpdate={handleTodoUpdate} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-4 mt-4">
          <div className="space-y-2">
            {inProgressItems.map((item) => (
              <TodoItem key={item.id} todo={item} onUpdate={handleTodoUpdate} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="not-started" className="space-y-4 mt-4">
          <div className="space-y-2">
            {notStartedItems.map((item) => (
              <TodoItem key={item.id} todo={item} onUpdate={handleTodoUpdate} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-4">
          <div className="space-y-2">
            {completedItems.map((item) => (
              <TodoItem key={item.id} todo={item} onUpdate={handleTodoUpdate} />
            ))}
          </div>
        </TabsContent>
        
        {blockedItems.length > 0 && (
          <TabsContent value="blocked" className="space-y-4 mt-4">
            <div className="space-y-2">
              {blockedItems.map((item) => (
                <TodoItem key={item.id} todo={item} onUpdate={handleTodoUpdate} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TodoList;
