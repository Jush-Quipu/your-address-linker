
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/Index'; // Corrected import path
import About from '@/pages/About';
import DeveloperDocs from '@/pages/DeveloperDocs';
import ApiTesting from '@/pages/ApiTesting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/docs" element={<DeveloperDocs />} />
        <Route path="/api-testing" element={<ApiTesting />} />
      </Routes>
    </Router>
  );
}

export default App;
