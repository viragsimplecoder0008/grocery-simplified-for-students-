
import { useState, useMemo } from "react";
import { toast } from "sonner";
import GroceryHeader from "@/components/GroceryHeader";
import BudgetCard from "@/components/BudgetCard";
import GroceryItem from "@/components/GroceryItem";
import AddEditItemDialog from "@/components/AddEditItemDialog";
import { GroceryItem as GroceryItemType, BudgetSummary } from "@/types/grocery";

const Index = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItemType[]>([
    {
      id: '1',
      name: 'Bananas',
      quantity: 6,
      price: 2.99,
      category: 'produce',
      purchased: false,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Milk',
      quantity: 1,
      price: 3.49,
      category: 'dairy',
      purchased: true,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Instant Ramen',
      quantity: 12,
      price: 4.99,
      category: 'snacks',
      purchased: false,
      createdAt: new Date()
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItemType | undefined>();

  const budgetSummary: BudgetSummary = useMemo(() => {
    const totalItems = groceryItems.length;
    const totalCost = groceryItems.reduce((sum, item) => sum + item.price, 0);
    const purchasedItems = groceryItems.filter(item => item.purchased).length;
    const purchasedCost = groceryItems
      .filter(item => item.purchased)
      .reduce((sum, item) => sum + item.price, 0);
    const remainingCost = totalCost - purchasedCost;

    return {
      totalItems,
      totalCost,
      purchasedItems,
      purchasedCost,
      remainingCost
    };
  }, [groceryItems]);

  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: GroceryItemType) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSaveItem = (itemData: Omit<GroceryItemType, 'id' | 'createdAt'>) => {
    if (editingItem) {
      // Update existing item
      setGroceryItems(items => 
        items.map(item => 
          item.id === editingItem.id 
            ? { ...itemData, id: editingItem.id, createdAt: editingItem.createdAt }
            : item
        )
      );
      toast.success("Item updated successfully!");
    } else {
      // Add new item
      const newItem: GroceryItemType = {
        ...itemData,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      setGroceryItems(items => [...items, newItem]);
      toast.success("Item added to your list!");
    }
  };

  const handleDeleteItem = (id: string) => {
    setGroceryItems(items => items.filter(item => item.id !== id));
    toast.success("Item removed from your list!");
  };

  const handleTogglePurchased = (id: string) => {
    setGroceryItems(items =>
      items.map(item =>
        item.id === id 
          ? { ...item, purchased: !item.purchased }
          : item
      )
    );
    
    const item = groceryItems.find(item => item.id === id);
    if (item) {
      toast.success(item.purchased ? "Item unmarked as purchased" : "Item marked as purchased!");
    }
  };

  // Group items by category for better organization
  const groupedItems = useMemo(() => {
    const groups = groceryItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItemType[]>);

    // Sort within each category by purchased status (unpurchased first)
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        if (a.purchased === b.purchased) return 0;
        return a.purchased ? 1 : -1;
      });
    });

    return groups;
  }, [groceryItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader onAddClick={handleAddItem} />
        
        <BudgetCard budget={budgetSummary} />

        <div className="mt-8">
          {groceryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your grocery list is empty</h3>
              <p className="text-gray-600 mb-6">Start adding items to track your shopping and budget!</p>
              <button 
                onClick={handleAddItem}
                className="grocery-gradient text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="capitalize">{category}</span>
                    <span className="text-sm text-gray-500 font-normal">({items.length} items)</span>
                  </h2>
                  
                  <div className="grid gap-3">
                    {items.map(item => (
                      <GroceryItem
                        key={item.id}
                        item={item}
                        onTogglePurchased={handleTogglePurchased}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddEditItemDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />
    </div>
  );
};

export default Index;
