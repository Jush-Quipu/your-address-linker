
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, CodeIcon, ListChecks, Bug } from 'lucide-react';
import DeveloperTodoList from '@/components/DeveloperTodoList';
import DeveloperTodoDetails from '@/components/DeveloperTodoDetails';
import DeveloperTodoForm from '@/components/DeveloperTodoForm';
import { type DeveloperTodo, getDeveloperTodos, getDeveloperTodoWithSubtasks } from '@/services/developerTodoService';
import { LovableTodoManager } from '@/utils/lovableTodoManager';

// Global reference to allow Lovable to access the todo manager
declare global {
  interface Window {
    LovableTodoManager?: typeof LovableTodoManager;
  }
}

const DeveloperTodoPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [todos, setTodos] = useState<DeveloperTodo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<DeveloperTodo | null>(null);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Make the todo manager available globally for Lovable
  useEffect(() => {
    window.LovableTodoManager = LovableTodoManager;
    
    return () => {
      // Clean up when component unmounts
      delete window.LovableTodoManager;
    };
  }, []);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [isAuthenticated]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getDeveloperTodos();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTodo = async (todo: DeveloperTodo) => {
    const todoWithSubtasks = await getDeveloperTodoWithSubtasks(todo.id);
    if (todoWithSubtasks) {
      setSelectedTodo(todoWithSubtasks);
    }
  };

  const handleBackToList = () => {
    setSelectedTodo(null);
    setIsAddingTodo(false);
  };

  const handleAddTodo = () => {
    setIsAddingTodo(true);
  };

  const handleTodoCreated = () => {
    setIsAddingTodo(false);
    fetchTodos();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/developer">
                    <CodeIcon className="h-4 w-4 mr-1" />
                    Developer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/developer/todo">
                    <ListChecks className="h-4 w-4 mr-1" />
                    Todo List
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center gap-2">
              {isDevelopment && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  Development Mode
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Bug className="h-3 w-3 mr-1" />
                Sandbox
              </Badge>
            </div>
          </div>

          {isAddingTodo ? (
            <DeveloperTodoForm
              onBack={handleBackToList}
              onSuccess={handleTodoCreated}
            />
          ) : selectedTodo ? (
            <DeveloperTodoDetails
              todo={selectedTodo}
              onBack={handleBackToList}
              onRefresh={async () => {
                const refreshedTodo = await getDeveloperTodoWithSubtasks(selectedTodo.id);
                if (refreshedTodo) {
                  setSelectedTodo(refreshedTodo);
                }
                fetchTodos();
              }}
            />
          ) : (
            <DeveloperTodoList
              todos={todos}
              onRefresh={fetchTodos}
              onAddTodo={handleAddTodo}
              onSelectTodo={handleSelectTodo}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperTodoPage;
