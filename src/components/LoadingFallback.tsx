import { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  maxWaitTime?: number;
}

const LoadingFallback: React.FC<Props> = ({ children, maxWaitTime = 10000 }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Show loading animation
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Show fallback after max wait time
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, maxWaitTime);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(fallbackTimer);
    };
  }, [maxWaitTime]);

  if (showFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Taking longer than expected...</h1>
          <p className="text-gray-600 mb-6">
            The app is still loading. This might be due to network connectivity or server initialization.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload App
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Data & Reload
            </button>
            <button
              onClick={() => setShowFallback(false)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Grocery Simplified</h2>
        <p className="text-lg opacity-90">Loading your dashboard{dots}</p>
        <div className="mt-4 text-sm opacity-70">
          <p>Connecting to services...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
