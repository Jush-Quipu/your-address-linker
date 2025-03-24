import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, signOut, isLoading } = useAuth();

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed w-full z-50 bg-background/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-xl md:text-2xl">
          SecureAddress Bridge
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/verify" className="text-sm font-medium hover:text-primary transition-colors">
                Verify Address
              </Link>
              <Link to="/connect" className="text-sm font-medium hover:text-primary transition-colors">
                Connect Wallet
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="outline" onClick={signOut} disabled={isLoading}>
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[75%] sm:w-[350px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link 
                to="/" 
                className="text-base font-medium hover:text-primary transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/verify" 
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    Verify Address
                  </Link>
                  <Link 
                    to="/connect" 
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={closeMenu}
                  >
                    Connect Wallet
                  </Link>
                </>
              )}
              <div className="mt-4">
                {isAuthenticated ? (
                  <Button variant="outline" onClick={() => { signOut(); closeMenu(); }} disabled={isLoading} className="w-full">
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/auth" onClick={closeMenu} className="w-full block">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
