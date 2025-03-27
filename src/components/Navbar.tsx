
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Menu, X, LogOut, User, Shield, Truck, Code, Settings, Home, Book, Beaker, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, signOut, user } = useAuth();
  const { isDeveloper, isAdmin } = useRole();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeveloperSection, setIsDeveloperSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check if current path is in the developer section
    const checkIfDeveloperSection = () => {
      const developerPaths = ['/developer', '/developer/'];
      const isDevPath = location.pathname.startsWith('/developer');
      setIsDeveloperSection(isDevPath);
    };

    window.addEventListener('scroll', handleScroll);
    checkIfDeveloperSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Regular navigation items for public site
  const publicNavItems = [
    { to: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/integrations', label: 'Integrations' },
    { to: '/security', label: 'Security' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];
  
  // User dashboard items
  const userNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Settings className="h-4 w-4 mr-2" /> },
    { to: '/my-shipments', label: 'My Shipments', icon: <Truck className="h-4 w-4 mr-2" /> },
    { to: '/blind-shipping', label: 'Blind Shipping', icon: <Truck className="h-4 w-4 mr-2" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    { to: '/dashboard/api-keys', label: 'API Keys', icon: <Code className="h-4 w-4 mr-2" /> },
    { to: '/connect', label: 'Connect Wallet', icon: <Wallet className="h-4 w-4 mr-2" /> },
  ];
  
  // Developer navigation items
  const developerNavItems = [
    { to: '/developer', label: 'Developer Home', icon: <Code className="h-4 w-4 mr-2" /> },
    { to: '/developer/apps', label: 'Register App', icon: <Server className="h-4 w-4 mr-2" /> },
    { to: '/developer/docs', label: 'Documentation', icon: <Book className="h-4 w-4 mr-2" /> },
    { to: '/developer/sandbox', label: 'Sandbox', icon: <Beaker className="h-4 w-4 mr-2" /> },
    { to: '/developer/testing', label: 'API Testing', icon: <Beaker className="h-4 w-4 mr-2" /> },
    { to: '/developer/analytics', label: 'Analytics', icon: <BarChart className="h-4 w-4 mr-2" /> },
    { to: '/developer/monitoring', label: 'Monitoring', icon: <Activity className="h-4 w-4 mr-2" /> },
    { to: '/developer/todo', label: 'Todo', icon: <ListChecks className="h-4 w-4 mr-2" /> },
  ];

  // Admin navigation items 
  const adminNavItems = [
    { to: '/admin', label: 'Admin Panel', icon: <Shield className="h-4 w-4 mr-2" /> },
    { to: '/admin/roles', label: 'User Roles', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  // Get the appropriate nav items based on the current section and role
  let navItems = publicNavItems;
  
  if (isDeveloperSection) {
    navItems = developerNavItems;
  } else if (location.pathname.startsWith('/admin')) {
    navItems = adminNavItems;
  } else if (location.pathname.startsWith('/dashboard') || 
            location.pathname === '/my-shipments' || 
            location.pathname === '/blind-shipping') {
    navItems = userNavItems;
  }
  
  // Add developer portal link to regular nav if user is developer
  if (!isDeveloperSection && isDeveloper) {
    navItems = [...navItems, { to: '/developer', label: 'Developer Portal', icon: <Code className="h-4 w-4 mr-2" /> }];
  }
  
  // Add admin panel link if user is admin
  if (!location.pathname.startsWith('/admin') && isAdmin) {
    navItems = [...navItems, { to: '/admin', label: 'Admin Panel', icon: <Shield className="h-4 w-4 mr-2" /> }];
  }

  // Filter based on authentication if needed
  const shouldRequireAuth = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/developer') || 
                           location.pathname.startsWith('/admin');
  
  const filteredNavItems = shouldRequireAuth 
    ? (isAuthenticated ? navItems : []) 
    : navItems;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span>SecureAddress Bridge</span>
            </Link>
            
            {isDeveloperSection && (
              <div className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                Developer
              </div>
            )}
            
            {location.pathname.startsWith('/admin') && (
              <div className="ml-3 px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium">
                Admin
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  className="ml-2"
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
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
                      {filteredNavItems.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className={cn(
                              "flex items-center py-2 text-base font-medium",
                              location.pathname === item.to
                                ? "text-primary"
                                : "text-foreground/70 hover:text-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon && item.icon}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {isAdmin ? "Admin" : isDeveloper ? "Developer" : "User"}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="default" 
                          className="w-full"
                          asChild
                        >
                          <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          asChild
                        >
                          <Link to="/auth?signup=true" onClick={() => setIsOpen(false)}>Create Account</Link>
                        </Button>
                      </div>
                    )}
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

export default Navbar;
