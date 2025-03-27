
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { HomeIcon, Code, Beaker, ListChecks, Server, Book, BarChart, Settings, ShieldAlert, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const DeveloperSidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isDeveloper } = useRole();

  if (!isDeveloper) return null;

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="border rounded-lg h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium">Developer Portal</h2>
        <p className="text-sm text-muted-foreground">Tools and resources</p>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          <li>
            <Link 
              to="/developer" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer") && !isPathActive("/developer/docs") && !isPathActive("/developer/testing") && !isPathActive("/developer/analytics") && !isPathActive("/developer/monitoring") && !isPathActive("/developer/todo") && !isPathActive("/developer/apps")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/docs" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/docs")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Book className="h-4 w-4" />
              Documentation
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/apps" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/apps")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Server className="h-4 w-4" />
              Register App
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/testing" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/testing")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Beaker className="h-4 w-4" />
              API Testing
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/analytics" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/analytics")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <BarChart className="h-4 w-4" />
              Analytics
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/monitoring" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/monitoring")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Activity className="h-4 w-4" />
              API Monitoring
              <Badge variant="outline" className="ml-auto text-xs">New</Badge>
            </Link>
          </li>
          <li>
            <Link 
              to="/developer/todo" 
              className={cn(
                "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                isPathActive("/developer/todo")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <ListChecks className="h-4 w-4" />
              Todo List
            </Link>
          </li>
          
          {isAdmin && (
            <li className="pt-4 mt-4 border-t">
              <Link 
                to="/admin" 
                className={cn(
                  "flex items-center gap-2 p-2 text-sm rounded-md w-full transition-colors",
                  isPathActive("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <ShieldAlert className="h-4 w-4" />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default DeveloperSidebar;
