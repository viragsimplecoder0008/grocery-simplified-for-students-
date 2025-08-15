import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Package } from 'lucide-react';
import { Category } from '@/types/grocery';
import { toast } from 'sonner';

const CategoryManager: React.FC = () => {
  const { isCategoryManager, isAdmin, user, profile, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Check if user has permission to manage categories
  const canManageCategories = isAdmin || isCategoryManager;

  useEffect(() => {
    if (!authLoading && user && canManageCategories) {
      fetchCategories();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, canManageCategories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to load categories: ${error.message}`);
        throw error;
      }
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) {
          console.error('Update error:', error);
          toast.error(`Failed to update category: ${error.message}`);
          throw error;
        }
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);
        
        if (error) {
          console.error('Insert error:', error);
          toast.error(`Failed to create category: ${error.message}`);
          throw error;
        }
        toast.success('Category created successfully');
      }

      setFormData({ name: '', description: '', color: '#3B82F6' });
      setEditingCategory(null);
      setDialogOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      // Error message already shown above
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canManageCategories) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              You don't have permission to manage categories. Only administrators and category managers can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              ADD CATEGORY
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="color">Category Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Information:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          <p><strong>User Email:</strong> {user?.email || 'None'}</p>
          <p><strong>User Role:</strong> {profile?.role || 'Unknown'}</p>
          <p><strong>Can Manage Categories:</strong> {canManageCategories ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Category Manager:</strong> {isCategoryManager ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Categories Count:</strong> {categories.length}</p>
          <p><strong>Component:</strong> CategoryManager (Fixed Version)</p>
          <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
          <p><strong>Data Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                    title={`Color: ${category.color || '#3B82F6'}`}
                  />
                  {category.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              )}
              <div className="flex items-center text-xs text-gray-500">
                <Package className="h-3 w-3 mr-1" />
                <span>ID: {category.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-bold"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            CREATE YOUR FIRST CATEGORY
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
