
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroceryItem, GroceryCategory } from "@/types/grocery";

interface AddEditItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<GroceryItem, 'id' | 'createdAt'>) => void;
  editingItem?: GroceryItem;
}

const AddEditItemDialog = ({ open, onClose, onSave, editingItem }: AddEditItemDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    price: 0,
    category: 'other' as GroceryCategory,
    purchased: false
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        quantity: editingItem.quantity,
        price: editingItem.price,
        category: editingItem.category,
        purchased: editingItem.purchased
      });
    } else {
      setFormData({
        name: '',
        quantity: 1,
        price: 0,
        category: 'other',
        purchased: false
      });
    }
  }, [editingItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
    onClose();
  };

  const categories: { value: GroceryCategory; label: string; icon: string }[] = [
    { value: 'produce', label: 'Produce', icon: '🥬' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'meat', label: 'Meat', icon: '🥩' },
    { value: 'snacks', label: 'Snacks', icon: '🍿' },
    { value: 'beverages', label: 'Beverages', icon: '🥤' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bananas, Milk, Bread"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: GroceryCategory) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 grocery-gradient text-white hover:opacity-90"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditItemDialog;
