
import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroceryHeaderProps {
  onAddClick: () => void;
}

const GroceryHeader = ({ onAddClick }: GroceryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="grocery-gradient p-3 rounded-xl">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grocery List</h1>
          <p className="text-gray-600">Smart shopping for student budgets</p>
        </div>
      </div>
      
      <Button 
        onClick={onAddClick}
        className="grocery-gradient text-white hover:opacity-90 transition-opacity shadow-lg"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Item
      </Button>
    </div>
  );
};

export default GroceryHeader;
