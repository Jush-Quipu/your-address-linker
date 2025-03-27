
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X, LogOut, User, Shield, Truck, Code } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const navItems = [
    { to: '/', label: 'Home', authRequired: false },
    { to: '/dashboard', label: 'Dashboard', authRequired: true },
    { to: '/permissions', label: 'Permissions', authRequired: true },
    { to: '/blind-shipping', label: 'Blind Shipping', authRequired: true, icon: <Truck className="h-4 w-4 mr-2" /> },
    { to: '/connect', label: 'Connect Wallet', authRequired: true },
    { to: '/developer-dashboard', label: 'Developer', authRequired: true, icon: <Code className="h-4 w-4 mr-2" /> },
    { to: '/docs', label: 'Developer Docs', authRequired: false },
  ];

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
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              {filteredNavItems.map((item) => (
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
              ))}
              
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
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {filteredNavItems.map((item) => (
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
