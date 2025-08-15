import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
              <p className="text-gray-600">
                The application encountered an error and couldn't load properly.
              </p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
              <pre className="text-sm text-red-600 overflow-auto">
                {this.state.error?.message || 'Unknown error'}
              </pre>
              {this.state.error?.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Stack Trace (click to expand)
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Data & Reload
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center">
              <p>If this problem persists, please contact support.</p>
              <p className="mt-2">
                Environment: {import.meta.env.MODE || 'unknown'} | 
                Build: {import.meta.env.VITE_BUILD_TIME || 'unknown'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
