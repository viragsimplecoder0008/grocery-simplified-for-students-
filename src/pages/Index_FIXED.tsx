import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroceryList } from "@/hooks/useGroceryList";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GroceryHeader from "@/components/GroceryHeader";
import BudgetCard from "@/components/BudgetCard";
import { AIRecommendations } from "@/components/AIRecommendations";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProfileDebug } from "@/components/ProfileDebug";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart, Package, Trash2, User, Sparkles } from "lucide-react";
import { Product, Category, GroceryListItem, BudgetSummary } from "@/types/grocery";

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { 
    groceryList, 
    loading: groceryListLoading,
    addToGroceryList,
    updateQuantity,
    togglePurchased,
    removeFromList 
  } = useGroceryList();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and products
      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select(`
          *,
          category:categories(id, name, description, created_at, updated_at)
        `).order('name')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (productsResult.error) throw productsResult.error;

      setCategories(categoriesResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const budgetSummary: BudgetSummary = useMemo(() => {
    const totalItems = groceryList.length;
    const totalCost = groceryList.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const purchasedItems = groceryList.filter(item => item.is_purchased).length;
    const purchasedCost = groceryList
      .filter(item => item.is_purchased)
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const remainingCost = totalCost - purchasedCost;

    return {
      totalItems,
      totalCost,
      purchasedItems,
      purchasedCost,
      remainingCost
    };
  }, [groceryList]);

  const groupedGroceryList = useMemo(() => {
    const groups = groceryList.reduce((acc, item) => {
      const categoryName = item.product?.category?.name || 'Other';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as Record<string, GroceryListItem[]>);

    // Sort within each category by purchased status
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        if (a.is_purchased === b.is_purchased) return 0;
        return a.is_purchased ? 1 : -1;
      });
    });

    return groups;
  }, [groceryList]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient">
      {user && <ProfileDebug />}
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader 
          onAddClick={() => setDialogOpen(true)} 
          showAddButton={true}
        />
        
        {user && <BudgetCard budget={budgetSummary} />}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <AIRecommendations />
            <ProfileEditor />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                      <p className="text-gray-600">No products match your search criteria.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-green-600">{formatPrice(product.price, currency)}</span>
                              {product.category && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {product.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToGroceryList(product)}
                            className="grocery-gradient text-white"
                            disabled={!user}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Grocery List Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'My Grocery List' : 'Sign in to create your list'}
            </h2>

            {!user ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                  <p className="text-gray-600 mb-4">
                    Sign in to create and manage your personal grocery list.
                  </p>
                  <Button onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            ) : groceryList.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Your list is empty</h3>
                  <p className="text-gray-600">Start adding products to your grocery list!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedGroceryList).map(([categoryName, items]) => (
                  <div key={categoryName} className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{categoryName}</h3>
                    {items.map((item) => (
                      <Card key={item.id} className={`${item.is_purchased ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={item.is_purchased}
                              onCheckedChange={() => togglePurchased(item.id)}
                            />
                            <div className="flex-1">
                              <h4 className={`font-medium ${item.is_purchased ? 'line-through' : ''}`}>
                                {item.product?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.product?.price || 0, currency)} × {item.quantity} = {formatPrice((item.product?.price || 0) * item.quantity, currency)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromList(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
