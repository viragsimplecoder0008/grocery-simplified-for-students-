import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useGroceryList } from "@/hooks/useGroceryList";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GroceryHeader from "@/components/GroceryHeader";
import BudgetCard from "@/components/BudgetCard";
import { AIRecommendations } from "@/components/AIRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ShoppingCart, Package, Plus, ArrowRight, Crown, Minus, Trash2, User } from "lucide-react";
import { Product, Category, GroceryListItem, BudgetSummary } from "@/types/grocery";

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { userGroups, loading: groupsLoading } = useGroups();
  const { 
    groceryList, 
    loading: groceryListLoading,
    addToGroceryList,
    updateQuantity,
    togglePurchased,
    removeFromList 
  } = useGroceryList();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Personal grocery list states (for users without groups)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !groupsLoading) {
      setLoading(false);
      // Only fetch products if user has no groups (for personal shopping)
      if (!authLoading && userGroups?.length === 0) {
        fetchProductData();
      }
    }
  }, [authLoading, groupsLoading, userGroups]);

  const fetchProductData = async () => {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select(`
          *,
          category:categories(id, name, description, created_at, updated_at)
        `).order('name')
      ]);

      if (categoriesResult.error) {
        console.warn('Categories fetch failed:', categoriesResult.error);
        // Don't throw error, just use empty array
      }
      if (productsResult.error) {
        console.warn('Products fetch failed:', productsResult.error);
        // Don't throw error, just use empty array
      }

      setCategories(categoriesResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Don't show error toast immediately, as this might happen during deployment
      // User can still use the app without products loaded
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

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
          <button 
            onClick={() => setLoading(false)}
            className="mt-4 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Continue without loading
          </button>
        </div>
      </div>
    );
  }

  // If no user and not loading, show minimal guest interface
  if (!user && !loading) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">🛒 Grocery Simplified</h1>
            <p className="text-xl mb-8">Smart Shopping & Budget Tracking for Students</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeGroups = userGroups?.filter(group => group.is_active) || [];
  const hasGroups = activeGroups.length > 0;

  // Render group-focused interface for users with groups
  if (hasGroups) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="container mx-auto px-4 py-8">
          <GroceryHeader showAddButton={false} />
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 text-shadow">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/90 text-lg text-shadow">
              Manage your group grocery lists and collaborate with others
            </p>
          </div>

          <Tabs defaultValue="groups" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Your Groups
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                AI Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="groups" className="space-y-6">
              {/* Groups Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          {group.name}
                        </CardTitle>
                        {group.leader_id === user?.id && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Leader
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {group.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{group.member_count || 0} members</span>
                          <span>•</span>
                          <span>Join code: {group.join_code}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="flex-1"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View List
                        </Button>
                        <Button 
                          onClick={() => navigate('/groups')}
                          variant="outline"
                          size="sm"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Group Card */}
                <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div 
                      className="text-center py-8"
                      onClick={() => navigate('/groups')}
                    >
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-600 mb-2">Create New Group</h3>
                      <p className="text-sm text-gray-500">Start a new collaborative grocery list</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/groups')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage All Groups
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <BudgetCard budget={budgetSummary} />
            </TabsContent>

            <TabsContent value="recommendations">
              <AIRecommendations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Render personal grocery list interface for users without groups
  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader 
          onAddClick={() => setDialogOpen(true)} 
          showAddButton={true}
        />
        
        {/* Welcome Section for Personal Users */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-white/90 text-lg text-shadow">
            {groceryList.length === 0 
              ? "Start building your personal grocery list" 
              : `You have ${groceryList.length} items in your list`
            }
          </p>
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/groups')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Users className="w-4 h-4 mr-2" />
              Want to collaborate? Join or create a group
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Budget Tracker
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Add Product Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Product to List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.map(product => (
                      <Card key={product.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(product.price, currency)}
                              {product.category && ` • ${product.category.name}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              addToGroceryList(product);
                              setDialogOpen(false);
                              setSearchTerm('');
                              setSelectedCategory('all');
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Shopping List Content */}
            {groceryList.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your list is empty</h3>
                  <p className="text-gray-600 mb-4">Add some products to get started</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedGroceryList).map(([category, items]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="secondary">
                          {items.length} items
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={item.is_purchased}
                              onCheckedChange={() => togglePurchased(item.id)}
                            />
                            <div className="flex-1">
                              <p className={`font-medium ${item.is_purchased ? 'line-through text-gray-500' : ''}`}>
                                {item.product?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatPrice((item.product?.price || 0) * item.quantity, currency)}
                                {item.notes && ` • ${item.notes}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromList(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="budget">
            <BudgetCard budget={budgetSummary} />
          </TabsContent>

          <TabsContent value="recommendations">
            <AIRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
