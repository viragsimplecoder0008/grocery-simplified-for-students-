import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GroceryHeader from '@/components/GroceryHeader';
import BrandManagement from '@/components/BrandManagement';
import BudgetManagement from '@/components/BudgetManagement';
import CurrencySelector from '@/components/CurrencySelector';
import ProductManagement from '@/components/ProductManagement';
import { DatabaseStatus } from '@/components/DatabaseStatus';

const AdminPanel = () => {
  const { user, profile, loading, isAdmin, isCategoryManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 AdminPanel - Detailed Auth Debug:', { 
      user: !!user, 
      userEmail: user?.email,
      profile: profile,
      profileRole: profile?.role,
      loading, 
      isAdmin, 
      isCategoryManager 
    });
    
    if (!loading) {
      if (!user) {
        console.log('❌ AdminPanel - No user, redirecting to /auth');
        navigate('/auth');
        return;
      }
      
      // Debug: Check why admin access is being denied
      console.log('🔍 Role Check Details:', {
        profileExists: !!profile,
        profileRole: profile?.role,
        isAdminCheck: profile?.role === 'admin',
        isCategoryManagerCheck: profile?.role === 'category_manager',
        finalIsAdmin: isAdmin,
        finalIsCategoryManager: isCategoryManager
      });
      
      // Temporarily allow access if user email is admin - for debugging
      if (user.email === 'admin@grocerysimplified.com') {
        console.log('✅ AdminPanel - Allowing access for admin email override');
        return; // Allow access for debugging
      }
      
      // Also allow access if profile role is admin
      if (profile?.role === 'admin') {
        console.log('✅ AdminPanel - Allowing access for admin role');
        return;
      }
      
      // Enforce proper role-based access control
      if (!isAdmin && !isCategoryManager) {
        console.log('❌ AdminPanel - Access denied. User role:', profile?.role, 'isAdmin:', isAdmin, 'isCategoryManager:', isCategoryManager);
        navigate('/auth'); // Redirect to auth instead of 404 for better UX
        return;
      }
      
      console.log('✅ AdminPanel - Access granted for user:', user.email, 'with role:', profile?.role);
    }
  }, [user, profile, loading, navigate, isAdmin, isCategoryManager]);

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Block access if user is not authenticated or doesn't have admin/category_manager role
  if (!user || (!isAdmin && !isCategoryManager)) {
    return null; // Component will be redirected anyway
  }

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
            <BrandManagement />
          </div>
          
          <div className="space-y-6">
            <BudgetManagement />
          </div>
        </div>

        {/* Additional Admin Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Brand System Active</h3>
                        <p className="text-sm text-gray-600">Brands can now manage their products</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics Section */}
        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              System Diagnostics
            </h2>
            <p className="text-gray-600 mb-6">Monitor system health and database connectivity</p>
            <DatabaseStatus />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;