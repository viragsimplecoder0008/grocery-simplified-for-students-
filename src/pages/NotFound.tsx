import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center page-gradient">
      <div className="text-center p-8 max-w-2xl">
        <div className="text-6xl mb-8 opacity-80">🛒</div>
        <div className="text-8xl font-bold mb-4 text-white text-shadow-lg bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-4xl font-semibold mb-4 text-white text-shadow">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          It looks like you've wandered off the grocery aisle. 
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-block px-8 py-4 bg-white/20 border-2 border-white/30 rounded-xl text-white font-semibold text-lg transition-all duration-300 backdrop-blur-sm shadow-lg hover:bg-white/30 hover:border-white/50 hover:-translate-y-1 hover:shadow-xl"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
