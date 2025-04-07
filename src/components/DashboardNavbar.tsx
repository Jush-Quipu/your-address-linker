
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { 
  Settings, 
  Box, 
  Truck, 
  Key, 
  Shield, 
  Code, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardNavbar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isDeveloper, isAdmin } = useRole();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Settings className="h-5 w-5" /> },
    { to: '/my-shipments', label: 'My Shipments', icon: <Box className="h-5 w-5" /> },
    { to: '/blind-shipping', label: 'Blind Shipping', icon: <Truck className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { to: '/dashboard/api-keys', label: 'API Keys', icon: <Key className="h-5 w-5" /> },
    { to: '/connect', label: 'Connect Wallet', icon: <Shield className="h-5 w-5" /> }
  ];

  // Add developer portal link if user is developer
  if (isDeveloper) {
    navItems.push({ to: '/developer', label: 'Developer Portal', icon: <Code className="h-5 w-5" /> });
  }

  // Add admin panel link if user is admin
  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: <Shield className="h-5 w-5" /> });
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="text-xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>SecureAddress Bridge</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
              
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </nav>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Link 
                      to="/" 
                      className="text-xl font-bold flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-6 w-6 text-primary" />
                      <span>SecureAddress Bridge</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <nav className="flex-1 py-6">
                    <ul className="space-y-4">
                      {navItems.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className={cn(
                              "flex items-center py-2 text-base font-medium",
                              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                                ? "text-primary"
                                : "text-foreground/70 hover:text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
