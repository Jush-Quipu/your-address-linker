
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import About from '@/pages/About';
import DeveloperDocs from '@/pages/DeveloperDocs';
import ApiTesting from '@/pages/ApiTesting'; // Add import for new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/docs" element={<DeveloperDocs />} />
        <Route path="/api-testing" element={<ApiTesting />} /> {/* Add new route */}
      </Routes>
    </Router>
  );
}

export default App;
