
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { HomeIcon, Code, Beaker, ListChecks, Server, Book, BarChart, Settings, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeveloperSidebarProps {
  children: React.ReactNode;
}

export const DeveloperSidebarWrapper: React.FC<DeveloperSidebarProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DeveloperSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const DeveloperSidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isDeveloper } = useRole();

  if (!isDeveloper) return null;

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      path: "/developer",
    },
    {
      title: "Register App",
      icon: Server,
      path: "/developer/portal",
    },
    {
      title: "Documentation",
      icon: Book,
      path: "/developer/docs",
    },
    {
      title: "Sandbox",
      icon: Beaker,
      path: "/developer/sandbox",
    },
    {
      title: "Todo List",
      icon: ListChecks,
      path: "/developer/todo",
    },
    {
      title: "Analytics",
      icon: BarChart,
      path: "/developer/analytics",
    },
  ];

  const adminItems = [
    {
      title: "Admin Panel",
      icon: ShieldAlert,
      path: "/developer/admin",
    },
    {
      title: "Roles",
      icon: Settings,
      path: "/developer/admin/roles",
    },
  ];

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="flex items-center gap-2 px-4 py-2">
        <Code className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Developer Portal</span>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isPathActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isPathActive(item.path)}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 w-full justify-center">
            Sandbox Environment
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeveloperSidebar;
