import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Import useRole
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
import { checkDeveloperAccess } from '@/services/developerService';
import { Separator } from '@/components/ui/separator';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, signOut, user } = useAuth();
  const { isDeveloper, isAdmin } = useRole(); // Use the role context
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
      const developerPaths = ['/developer', '/developer/', '/developer-dashboard'];
      const isDevPath = developerPaths.some(path => location.pathname.startsWith(path));
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

  // Regular navigation items
  const regularNavItems = [
    { to: '/', label: 'Home', authRequired: false, icon: <Home className="h-4 w-4 mr-2" /> },
    { to: '/dashboard', label: 'Dashboard', authRequired: true, icon: <Settings className="h-4 w-4 mr-2" /> },
    { to: '/permissions', label: 'Permissions', authRequired: true },
    { to: '/blind-shipping', label: 'Blind Shipping', authRequired: true, icon: <Truck className="h-4 w-4 mr-2" /> },
    { to: '/connect', label: 'Connect Wallet', authRequired: true },
  ];
  
  // Developer navigation items
  const developerNavItems = [
    { to: '/developer', label: 'Developer Home', authRequired: true, icon: <Code className="h-4 w-4 mr-2" /> },
    { to: '/developer/portal', label: 'Register App', authRequired: true, icon: <Server className="h-4 w-4 mr-2" /> },
    { to: '/developer/docs', label: 'Documentation', authRequired: true, icon: <Book className="h-4 w-4 mr-2" /> },
    { to: '/developer/sandbox', label: 'Sandbox', authRequired: true, icon: <Beaker className="h-4 w-4 mr-2" /> },
  ];

  // Get the appropriate nav items based on the current section and role
  const navItems = isDeveloperSection 
    ? developerNavItems 
    : [...regularNavItems, ...(isDeveloper ? [{ to: '/developer', label: 'Developer', authRequired: true, icon: <Code className="h-4 w-4 mr-2" /> }] : [])];
    
  const filteredNavItems = navItems.filter(item => !item.authRequired || isAuthenticated);

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
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              {isDeveloperSection ? (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Developer</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                to="/developer"
                              >
                                <Code className="h-6 w-6 text-primary" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Developer Dashboard
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage your applications, API keys, and access analytics
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <Link
                              to="/developer/portal"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">Register App</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Create OAuth applications and API keys
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/developer/docs"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">Documentation</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                API references, SDK libraries, and guides
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/developer/sandbox"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">Sandbox</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Test your integration in a safe environment
                              </p>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    
                    {developerNavItems.map((item) => (
                      <NavigationMenuItem key={item.to}>
                        <Link
                          to={item.to}
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                            location.pathname === item.to
                              ? "bg-muted text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                  
                  {/* Add admin section if user is admin */}
                  {isAdmin && (
                    <NavigationMenuItem>
                      <Link
                        to="/developer/admin"
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                          location.pathname === '/developer/admin'
                            ? "bg-muted text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        Admin Panel
                      </Link>
                    </NavigationMenuItem>
                  )}
                </NavigationMenu>
              ) : (
                // Only show developer link if user has developer access
                filteredNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`text-sm font-medium flex items-center transition-colors ${
                      location.pathname === item.to
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.icon && item.icon}
                    {item.label}
                  </Link>
                ))
              )}
              
              {isAuthenticated ? (
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-semibold flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      SecureAddress
                      
                      {isDeveloperSection && (
                        <div className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                          Dev
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Separate Developer and Regular Navigation */}
                  {isDeveloperSection && (
                    <>
                      <div className="font-medium text-sm text-muted-foreground mb-2">Developer</div>
                      <nav className="flex flex-col space-y-1 mb-4">
                        {developerNavItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                              location.pathname === item.to
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon && item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                      <Separator className="my-4" />
                      <div className="font-medium text-sm text-muted-foreground mb-2">Main Navigation</div>
                    </>
                  )}
                  
                  <nav className="flex flex-col space-y-1">
                    {regularNavItems.filter(item => !item.authRequired || isAuthenticated).map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                          location.pathname === item.to
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon && item.icon}
                        {item.label}
                      </Link>
                    ))}
                    
                    {!isDeveloperSection && isDeveloper && (
                      <Link
                        to="/developer"
                        className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                          location.pathname === '/developer'
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Developer
                      </Link>
                    )}
                  </nav>
                  
                  <div className="mt-auto pt-6">
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut} 
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button 
                        asChild 
                        className="w-full"
                      >
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
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
