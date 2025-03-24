
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { MenuIcon, X, User, LogOut, Shield, Home, MapPin, Wallet, Key, Code } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Shield className="h-8 w-8 text-primary mr-2" />
          <span className="font-bold text-xl">SecureAddress Bridge</span>
        </Link>

        {isMobile ? (
          // Mobile navigation
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b border-border">
                <nav className="flex flex-col p-4 space-y-4">
                  <Link to="/" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                  
                  <Link to="/verify" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                    <MapPin className="mr-2 h-4 w-4" />
                    Verify Address
                  </Link>
                  
                  <Link to="/connect" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Link>
                  
                  {isAuthenticated && (
                    <>
                      <Link to="/dashboard" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                      
                      <Link to="/permissions" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                        <Key className="mr-2 h-4 w-4" />
                        Permissions
                      </Link>
                    </>
                  )}
                  
                  <div className="pt-2 border-t border-border">
                    <Link to="/developer" className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
                      <Code className="mr-2 h-4 w-4" />
                      Developers
                    </Link>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    {isAuthenticated ? (
                      <Button variant="destructive" className="w-full" onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    )}
                  </div>
                </nav>
              </div>
            )}
          </>
        ) : (
          // Desktop navigation
          <div className="flex items-center space-x-1">
            <nav className="flex items-center space-x-1 mr-4">
              <Link to="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link to="/verify">
                <Button variant="ghost">Verify Address</Button>
              </Link>
              <Link to="/connect">
                <Button variant="ghost">Connect Wallet</Button>
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/permissions">
                    <Button variant="ghost">Permissions</Button>
                  </Link>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Code className="mr-2 h-4 w-4" />
                    Developers
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/developer">Developer Portal</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/developer-docs">API Documentation</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.email ? user.email.split('@')[0] : 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/permissions">Manage Permissions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
