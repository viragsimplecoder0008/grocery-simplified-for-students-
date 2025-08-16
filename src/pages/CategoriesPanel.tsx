import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GroceryHeader from '@/components/GroceryHeader';
import CategoryManager from '@/components/CategoryManager';

const CategoriesPanel = () => {
  const { user, profile, loading, isAdmin, isCategoryManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Allow both admins and category managers to access this page
      if (!isAdmin && !isCategoryManager) {
        navigate('/404'); // Redirect to 404 to hide existence from unauthorized users
        return;
      }
    }
  }, [user, profile, loading, navigate, isAdmin, isCategoryManager]);

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isCategoryManager)) {
    return null;
  }

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader />
        
        {/* Category Manager Dashboard Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="grocery-gradient p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                <p className="text-gray-600">Create, edit, and organize product categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Management and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CategoryManager />
          </div>
          
          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full text-left p-4 grocery-gradient-light border border-blue-200 rounded-lg hover:opacity-90 transition-all duration-200 text-blue-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Manage Products</h3>
                      <p className="text-sm text-gray-600">Add and edit products</p>
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
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Overview</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Categories:</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span>Products Assigned:</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Role:</span>
                  <span className="font-medium text-green-600">
                    {profile?.role === 'admin' ? 'Administrator' : 'Category Manager'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPanel;