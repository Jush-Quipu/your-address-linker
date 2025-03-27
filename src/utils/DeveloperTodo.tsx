import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';

interface TodoItemProps {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  subtasks?: {
    title: string;
    status: 'completed' | 'in-progress' | 'not-started';
  }[];
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  title, 
  description, 
  status, 
  priority,
  subtasks 
}) => {
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

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getStatusIcon(status)}
            <CardTitle className="text-lg ml-2">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            {getPriorityBadge(priority)}
            <Badge 
              variant={status === 'completed' ? 'success' : 
                      status === 'in-progress' ? 'default' : 
                      status === 'blocked' ? 'destructive' : 'outline'}
            >
              {status === 'completed' ? 'Completed' : 
               status === 'in-progress' ? 'In Progress' : 
               status === 'blocked' ? 'Blocked' : 'Not Started'}
            </Badge>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {subtasks && subtasks.length > 0 && (
        <CardContent>
          <button 
            className="text-sm text-blue-500 mb-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Subtasks' : 'Show Subtasks'}
          </button>
          
          {expanded && (
            <div className="space-y-2 mt-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox 
                    id={`subtask-${index}`} 
                    checked={subtask.status === 'completed'}
                    disabled
                  />
                  <div className="flex items-center gap-2">
                    <label 
                      htmlFor={`subtask-${index}`}
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

const DeveloperTodo: React.FC = () => {
  const todoItems: TodoItemProps[] = [
    {
      title: "Role-Based Access Control",
      description: "Implement proper developer role management system",
      status: "completed",
      priority: "high",
      subtasks: [
        { 
          title: "Create developer_roles table and RLS policies", 
          status: "completed" 
        },
        { 
          title: "Implement checkDeveloperAccess with proper role checks", 
          status: "completed" 
        },
        { 
          title: "Implement role-based UI visibility", 
          status: "completed" 
        },
        { 
          title: "Create admin interface for managing developer roles", 
          status: "completed" 
        }
      ]
    },
    {
      title: "Analytics & Monitoring Implementation",
      description: "Implement real-time API usage tracking and monitoring",
      status: "not-started",
      priority: "medium",
      subtasks: [
        { 
          title: "Create API usage tracking middleware", 
          status: "not-started" 
        },
        { 
          title: "Implement connection to actual backend analytics data", 
          status: "not-started" 
        },
        { 
          title: "Develop API quota management system", 
          status: "not-started" 
        },
        { 
          title: "Add error rate monitoring and alerting", 
          status: "not-started" 
        },
        { 
          title: "Implement performance metrics collection", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Webhook Delivery History & Management",
      description: "Create UI for webhook delivery history and management",
      status: "in-progress",
      priority: "medium",
      subtasks: [
        { 
          title: "Implement basic webhook configuration UI", 
          status: "completed" 
        },
        { 
          title: "Create webhook delivery history UI", 
          status: "in-progress" 
        },
        { 
          title: "Implement webhook event testing interface", 
          status: "not-started" 
        },
        { 
          title: "Add webhook delivery logs with request/response details", 
          status: "not-started" 
        },
        { 
          title: "Implement webhook retry functionality", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Documentation Consolidation",
      description: "Create centralized documentation hub with versioning",
      status: "in-progress",
      priority: "medium",
      subtasks: [
        { 
          title: "Create basic documentation sections", 
          status: "completed" 
        },
        { 
          title: "Implement centralized documentation hub", 
          status: "in-progress" 
        },
        { 
          title: "Add documentation versioning", 
          status: "not-started" 
        },
        { 
          title: "Create interactive API reference", 
          status: "not-started" 
        },
        { 
          title: "Implement searchable documentation", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Sandbox Environment Features",
      description: "Enhance sandbox environment with configuration options",
      status: "in-progress",
      priority: "high",
      subtasks: [
        { 
          title: "Create basic sandbox with hardcoded examples", 
          status: "completed" 
        },
        { 
          title: "Implement configuration options for sandbox behavior", 
          status: "not-started" 
        },
        { 
          title: "Add customizable response scenarios", 
          status: "not-started" 
        },
        { 
          title: "Implement sandbox response logging", 
          status: "not-started" 
        },
        { 
          title: "Integrate with real SDK libraries", 
          status: "in-progress" 
        },
        { 
          title: "Add downloadable SDK packages", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Navigation & User Experience",
      description: "Improve navigation with consistent breadcrumbs and indicators",
      status: "in-progress",
      priority: "low",
      subtasks: [
        { 
          title: "Implement basic navigation between sections", 
          status: "completed" 
        },
        { 
          title: "Add consistent breadcrumb navigation", 
          status: "in-progress" 
        },
        { 
          title: "Create development mode indicators", 
          status: "not-started" 
        },
        { 
          title: "Add visual cues for sandbox vs. production environments", 
          status: "not-started" 
        },
        { 
          title: "Implement persistent sidebar navigation", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Developer Portal Registration & Management",
      description: "Enhance app registration with advanced features",
      status: "in-progress",
      priority: "high",
      subtasks: [
        { 
          title: "Implement basic app registration", 
          status: "completed" 
        },
        { 
          title: "Add OAuth configuration options", 
          status: "in-progress" 
        },
        { 
          title: "Implement API key rotation", 
          status: "not-started" 
        },
        { 
          title: "Add usage limitations and quotas", 
          status: "not-started" 
        },
        { 
          title: "Create application verification process", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "End-to-End Examples & Quickstarts",
      description: "Create comprehensive examples and quickstart templates",
      status: "not-started",
      priority: "medium",
      subtasks: [
        { 
          title: "Create basic code samples", 
          status: "completed" 
        },
        { 
          title: "Implement quickstart templates for common integrations", 
          status: "not-started" 
        },
        { 
          title: "Add downloadable sample projects", 
          status: "not-started" 
        },
        { 
          title: "Create integration tutorials for popular frameworks", 
          status: "not-started" 
        },
        { 
          title: "Add copy-and-paste code snippets", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "Developer Community Features",
      description: "Implement developer community and collaboration features",
      status: "not-started",
      priority: "low",
      subtasks: [
        { 
          title: "Add basic GitHub link", 
          status: "completed" 
        },
        { 
          title: "Create developer forum or discussion board", 
          status: "not-started" 
        },
        { 
          title: "Implement issue reporting system", 
          status: "not-started" 
        },
        { 
          title: "Add feature request submission", 
          status: "not-started" 
        },
        { 
          title: "Create integration showcase", 
          status: "not-started" 
        }
      ]
    },
    {
      title: "API Testing Environment",
      description: "Create interactive API testing environment",
      status: "not-started",
      priority: "medium",
      subtasks: [
        { 
          title: "Create basic API testing page", 
          status: "in-progress" 
        },
        { 
          title: "Implement interactive API request builder", 
          status: "not-started" 
        },
        { 
          title: "Add response visualization", 
          status: "not-started" 
        },
        { 
          title: "Create authentication helper", 
          status: "not-started" 
        },
        { 
          title: "Implement request history", 
          status: "not-started" 
        },
        { 
          title: "Add saved requests feature", 
          status: "not-started" 
        }
      ]
    }
  ];

  const completedItems = todoItems.filter(item => item.status === 'completed');
  const inProgressItems = todoItems.filter(item => item.status === 'in-progress');
  const notStartedItems = todoItems.filter(item => item.status === 'not-started');
  const blockedItems = todoItems.filter(item => item.status === 'blocked');

  const totalSubtasks = todoItems.reduce((total, item) => 
    total + (item.subtasks?.length || 0), 0);
  
  const completedSubtasks = todoItems.reduce((total, item) => 
    total + (item.subtasks?.filter(subtask => subtask.status === 'completed').length || 0), 0);
  
  const percentageComplete = Math.round((completedSubtasks / totalSubtasks) * 100);

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
            {todoItems.map((item, index) => (
              <TodoItem key={index} {...item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-4 mt-4">
          <div className="space-y-2">
            {inProgressItems.map((item, index) => (
              <TodoItem key={index} {...item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="not-started" className="space-y-4 mt-4">
          <div className="space-y-2">
            {notStartedItems.map((item, index) => (
              <TodoItem key={index} {...item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-4">
          <div className="space-y-2">
            {completedItems.map((item, index) => (
              <TodoItem key={index} {...item} />
            ))}
          </div>
        </TabsContent>
        
        {blockedItems.length > 0 && (
          <TabsContent value="blocked" className="space-y-4 mt-4">
            <div className="space-y-2">
              {blockedItems.map((item, index) => (
                <TodoItem key={index} {...item} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DeveloperTodo;
