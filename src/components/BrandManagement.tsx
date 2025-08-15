import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Building2, Mail, Eye, EyeOff } from 'lucide-react';
import { Brand } from '@/types/grocery';
import { toast } from 'sonner';

const BrandManagement = () => {
  const { isAdmin } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    description: '',
    logo_url: '',
    is_active: true
  });

  useEffect(() => {
    if (isAdmin) {
      fetchBrands();
    }
  }, [isAdmin]);

  const fetchBrands = async () => {
    try {
      // Since brands table doesn't exist yet in the database schema,
      // we'll use localStorage fallback for now
      console.warn('Brands table not available, using localStorage fallback');
      const localBrands = JSON.parse(localStorage.getItem('fallback_brands') || '[]');
      setBrands(localBrands);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      setBrands([]);
      toast.error('Error loading brands');
    } finally {
      setLoading(false);
    }
  };

  const generateBrandEmail = (brandName: string) => {
    const cleanName = brandName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    return `${cleanName}@grocerysimplified.com`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (!formData.password && !editingBrand) {
      toast.error('Password is required for new brands');
      return;
    }

    try {
      const brandData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        description: formData.description.trim() || null,
        logo_url: formData.logo_url.trim() || null,
        is_active: formData.is_active
      };

      if (editingBrand) {
        // Update existing brand in localStorage
        const localBrands = brands.map(brand => 
          brand.id === editingBrand.id 
            ? { ...brand, ...brandData, updated_at: new Date().toISOString() }
            : brand
        );
        setBrands(localBrands);
        localStorage.setItem('fallback_brands', JSON.stringify(localBrands));
        toast.success('Brand updated successfully (localStorage mode)');
      } else {
        // Create new brand in localStorage
        const newBrand: Brand = {
          ...brandData,
          id: Date.now(),
          password_hash: formData.password, // In real app, this would be hashed
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const localBrands = [...brands, newBrand];
        setBrands(localBrands);
        localStorage.setItem('fallback_brands', JSON.stringify(localBrands));
        toast.success('Brand created successfully (localStorage mode)');
      }

      setDialogOpen(false);
      setEditingBrand(null);
      resetForm();
    } catch (error: any) {
      toast.error('Failed to save brand');
      console.error('Error saving brand:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      description: '',
      logo_url: '',
      is_active: true
    });
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      email: brand.email,
      password: '', // Don't show existing password
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      is_active: brand.is_active
    });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBrand(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      email: generateBrandEmail(name)
    }));
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-gray-600">You need admin permissions to manage brands.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading brands...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Management</h2>
          <p className="text-gray-600">Create and manage brand accounts for product management</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="grocery-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Brand Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Organic Valley"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Auto-generated from brand name"
                    required
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingBrand ? "Leave empty to keep current password" : "Generated password"}
                  required={!editingBrand}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brand description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-gray-600">Enable brand to manage products</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 grocery-gradient text-white"
                >
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {brands.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Brands Yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first brand account.</p>
              <Button onClick={handleAddNew} className="grocery-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create First Brand
              </Button>
            </CardContent>
          </Card>
        ) : (
          brands.map((brand) => (
            <Card key={brand.id} className={!brand.is_active ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {brand.name}
                    {!brand.is_active && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
                    )}
                  </CardTitle>
                  {brand.description && (
                    <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{brand.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(brand)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Created {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BrandManagement;
