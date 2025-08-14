import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GroceryHeader from '@/components/GroceryHeader';
import ProductManagement from '@/components/ProductManagement';
import CurrencySelector from '@/components/CurrencySelector';

const AdminPanel = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminPanel - Auth state:', { user: !!user, profile, loading }); // Debug log
    
    if (!loading) {
      if (!user) {
        console.log('AdminPanel - No user, redirecting to /auth'); // Debug log
        navigate('/auth');
        return;
      }
      
      // For now, allow any logged-in user to access admin panel for testing
      // Later we'll enforce proper roles
      console.log('AdminPanel - User authenticated, allowing access'); // Debug log
      
      // Uncomment these lines once roles are properly set up in Supabase
      // if (profile?.role !== 'admin' && profile?.role !== 'category_manager') {
      //   console.log('AdminPanel - Invalid role:', profile?.role, 'redirecting to /'); // Debug log
      //   navigate('/');
      //   return;
      // }
      
      console.log('AdminPanel - Access granted for user:', user.email); // Debug log
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // For testing, allow any logged-in user to access admin panel
  if (!user) {
    return null;
  }

  // Uncomment this once roles are properly configured
  // if (!user || (profile?.role !== 'admin' && profile?.role !== 'category_manager')) {
  //   return null;
  // }

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader />
        
        {/* Admin Dashboard Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="grocery-gradient p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.role === 'admin' ? 'Admin Dashboard' : 'Category Manager Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {profile?.role === 'admin' 
                    ? 'Manage products, categories, and system settings' 
                    : 'Manage categories and organize products'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ProductManagement />
          </div>
          
          {/* Currency Management Section */}
          <div className="space-y-6">
            <CurrencySelector />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/categories')}
                  className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Manage Categories</h3>
                      <p className="text-sm text-gray-600">Create and organize product categories</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full text-left p-4 grocery-gradient-light border border-purple-200 rounded-lg hover:opacity-90 transition-all duration-200 text-purple-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">View Store Front</h3>
                      <p className="text-sm text-gray-600">See the customer experience</p>
                    </div>
                  </div>
                </button>
                
                {profile?.role === 'admin' && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Full Admin Access</h3>
                        <p className="text-sm text-gray-600">You have complete system access</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;