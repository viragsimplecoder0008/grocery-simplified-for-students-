import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import App from './App.tsx'
import LoadingFallback from './components/LoadingFallback.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);

root.render(
  <Suspense fallback={<LoadingFallback><div /></LoadingFallback>}>
    <App />
  </Suspense>
);
