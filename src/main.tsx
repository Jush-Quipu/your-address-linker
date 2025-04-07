
import './polyfills'; // Import polyfills first
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Log to confirm polyfills are loaded before React
console.log('Main.tsx executing, polyfills should be loaded');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
