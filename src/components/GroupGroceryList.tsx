import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useGroupGroceryList } from '@/hooks/useGroupGroceryList';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencySymbol, formatPrice } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, ShoppingCart, Check, X, Trash2, Edit, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category } from '@/types/grocery';

export function GroupGroceryList() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { userGroups } = useGroups();
  const { 
    groupItems, 
    loading, 
    addGroupItem, 
    purchaseGroupItem, 
    unpurchaseGroupItem, 
    deleteGroupItem,
    getGroupSummary 
  } = useGroupGroceryList(groupId ? parseInt(groupId) : null);

  // Add Item Form State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  
  // Available products
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const currentGroup = userGroups.find(g => g.id === parseInt(groupId || '0'));
  const summary = getGroupSummary();
  const currencySymbol = getCurrencySymbol(currency);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, description, created_at, updated_at),
          brand:brands(id, name, description, logo_url)
        `)
        .order('name');

      if (error) {
        if (error.message?.includes('relation') || 
            error.message?.includes('table') || 
            error.message?.includes('schema cache') ||
            error.code === 'PGRST106') {
          console.warn('Products table not available, using fallback');
          // For demo purposes, create some sample products
          const sampleProducts: Product[] = [
            { id: 1, name: 'Milk', price: 3.50, category_id: 1, stock_quantity: 50, description: 'Fresh whole milk', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, name: 'Bread', price: 2.25, category_id: 2, stock_quantity: 30, description: 'Whole wheat bread', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 3, name: 'Eggs', price: 4.00, category_id: 1, stock_quantity: 25, description: 'Free-range eggs (12 pack)', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 4, name: 'Bananas', price: 1.50, category_id: 3, stock_quantity: 100, description: 'Fresh bananas per lb', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          ];
          setProducts(sampleProducts);
          return;
        }
        throw error;
      }

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
    if (!selectedProduct) {
      toast.error('Selected product not found');
      return;
    }

    setAddingItem(true);
    const result = await addGroupItem({
      name: selectedProduct.name,
      quantity: itemQuantity,
      price: selectedProduct.price,
      category: selectedProduct.category?.name,
      notes: itemNotes.trim() || undefined,
      product_id: selectedProduct.id
    });
    
    if (result.success) {
      setSelectedProductId('');
      setItemQuantity(1);
      setItemNotes('');
      setAddDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed to add item');
    }
    
    setAddingItem(false);
  };

  const handlePurchaseToggle = async (item: any) => {
    if (item.is_purchased) {
      await unpurchaseGroupItem(item.id);
    } else {
      await purchaseGroupItem(item.id);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const result = await deleteGroupItem(itemId);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete item');
    }
  };

  if (!groupId || !currentGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h2>
          <p className="text-gray-600 mb-6">The requested group could not be found or you don't have access to it.</p>
          <Button onClick={() => navigate('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group grocery list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/groups')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentGroup.name}</h1>
              <p className="text-gray-600">{currentGroup.description || 'Group Grocery List'}</p>
            </div>
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="grocery-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item to Group List</DialogTitle>
                <DialogDescription>
                  Select a product from our catalog to add to the group list
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-select">Select Product</Label>
                  {productsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading products...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedProductId}
                      onValueChange={setSelectedProductId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product from our catalog" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2" />
                            <p>No products available</p>
                          </div>
                        ) : (
                          products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{product.name}</span>
                                <span className="text-sm text-green-600 font-medium ml-4">
                                  {formatPrice(product.price, currency)}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedProductId && (
                    <div className="p-3 bg-blue-50 rounded-lg border">
                      {(() => {
                        const selected = products.find(p => p.id.toString() === selectedProductId);
                        return selected ? (
                          <div>
                            <h4 className="font-medium text-blue-900">{selected.name}</h4>
                            <p className="text-sm text-blue-700">
                              Price: {formatPrice(selected.price, currency)}
                            </p>
                            {selected.description && (
                              <p className="text-xs text-blue-600 mt-1">{selected.description}</p>
                            )}
                            {selected.category && (
                              <span className="inline-block mt-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                {selected.category.name}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-quantity">Quantity</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-notes">Notes (Optional)</Label>
                  <Textarea
                    id="item-notes"
                    placeholder="Any additional notes..."
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addingItem} className="flex-1">
                    {addingItem ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchased</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.purchasedItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <span className="h-4 w-4 text-muted-foreground">{currencySymbol}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{summary.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completionPercentage}%</div>
              <Progress value={summary.completionPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Grocery Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Grocery Items</CardTitle>
            <CardDescription>
              {summary.totalItems > 0 ? 
                `${summary.remainingItems} items remaining • ${summary.purchasedItems} completed` :
                'No items in this group list yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Yet</h3>
                <p className="text-gray-600 mb-6">Start building your shared grocery list by adding items!</p>
                <Button onClick={() => setAddDialogOpen(true)} className="grocery-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.is_purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePurchaseToggle(item)}
                        className={`${
                          item.is_purchased ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {item.is_purchased ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 border-2 rounded" />}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${item.is_purchased ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          {item.category && (
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>{currencySymbol}{item.price.toFixed(2)} each</span>
                          <span className="font-medium">{currencySymbol}{(item.price * item.quantity).toFixed(2)} total</span>
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1">
                          Added {new Date(item.created_at).toLocaleDateString()}
                          {item.is_purchased && item.purchased_at && (
                            <> • Purchased {new Date(item.purchased_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{item.name}" from the group list? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Item
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
