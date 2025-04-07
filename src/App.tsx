
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from './AppRoutes';
import { SecureAddressProvider } from './sdk/secureaddress-context';

function App() {
  useEffect(() => {
    // Any global initialization code here
    console.log('Application initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <AuthProvider>
          <RoleProvider>
            <SecureAddressProvider 
              appId="secure-address-bridge-app"
              apiUrl="https://sandbox.secureaddress-bridge.com/api" 
              redirectUri={`${window.location.origin}/auth/callback`}
            >
              <AppRoutes />
              <Toaster position="top-right" />
            </SecureAddressProvider>
          </RoleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
