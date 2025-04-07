
import './polyfills'; // Must be the first import
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './sdk/init'; // Initialize the SDK

// Add an error boundary to catch and display errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full space-y-4 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-gray-600">
              The application encountered an error. Please refresh the page or try again later.
            </p>
            {this.state.error && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
