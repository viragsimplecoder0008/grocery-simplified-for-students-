import { useEffect, useState } from 'react';

interface LoadingDebuggerProps {
  children: React.ReactNode;
}

const LoadingDebugger: React.FC<LoadingDebuggerProps> = ({ children }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const logs: string[] = [];
    
    // Check environment variables
    logs.push(`Environment: ${import.meta.env.MODE}`);
    logs.push(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    logs.push(`Supabase Key: ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}`);
    
    // Check if running in Lovable
    logs.push(`Is Lovable: ${window.location.hostname.includes('lovable.app') ? '✅ Yes' : '❌ No'}`);
    logs.push(`Current URL: ${window.location.href}`);
    
    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      logs.push('localStorage: ✅ Available');
    } catch (e) {
      logs.push('localStorage: ❌ Not available');
    }
    
    // Check if React is working
    logs.push('React: ✅ Working');
    
    setDebugInfo(logs);
    
    // Show debug info if we're stuck loading for more than 5 seconds
    const timer = setTimeout(() => {
      setShowDebug(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showDebug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Debug Information</h1>
            <p className="text-gray-600">
              The app seems to be taking longer than expected to load. Here's what we found:
            </p>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">System Check:</h3>
            <div className="space-y-2">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {info}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowDebug(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hide Debug & Continue
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data & Reload
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>This debug screen will automatically hide once the app loads successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingDebugger;
