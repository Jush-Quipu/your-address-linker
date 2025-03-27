
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from './AppRoutes';

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
            <AppRoutes />
            <Toaster position="top-right" />
          </RoleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
