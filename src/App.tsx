
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/Index'; // Corrected import path
import About from '@/pages/About';
import DeveloperDocs from '@/pages/DeveloperDocs';
import ApiTesting from '@/pages/ApiTesting';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import Auth from '@/pages/Auth'; // Import Auth page
import Connect from '@/pages/Connect'; // Import Connect page
import Dashboard from '@/pages/Dashboard'; // Import Dashboard page
import Features from '@/pages/Features'; // Import Features page

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<DeveloperDocs />} />
          <Route path="/api-testing" element={<ApiTesting />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features" element={<Features />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
