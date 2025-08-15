import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { BirthdayNotificationService } from "@/services/birthdayNotificationService";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingDebugger from "@/components/LoadingDebugger";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import CategoriesPanel from "./pages/CategoriesPanel";
import BrandDashboard from "./pages/BrandDashboard";
import Budget from "./pages/Budget";
import Groups from "./pages/Groups";
import GroupList from "./pages/GroupList";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Add global error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

const App = () => {
  useEffect(() => {
    console.log('🚀 App component mounted');
    console.log('Environment:', {
      mode: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
    });

    // Initialize birthday notification system when app loads
    try {
      BirthdayNotificationService.initialize();
      console.log('✅ Birthday notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize birthday notifications:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <LoadingDebugger>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <TooltipProvider>
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/categories" element={<CategoriesPanel />} />
                    <Route path="/brand-dashboard" element={<BrandDashboard />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/:groupId" element={<GroupList />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LoadingDebugger>
    </ErrorBoundary>
  );
};

export default App;
