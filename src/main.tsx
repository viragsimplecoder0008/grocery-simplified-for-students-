import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import App from './App.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);

root.render(
  <Suspense fallback={
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Grocery Simplified</h2>
        <p className="text-lg opacity-90">Loading...</p>
      </div>
    </div>
  }>
    <App />
  </Suspense>
);
