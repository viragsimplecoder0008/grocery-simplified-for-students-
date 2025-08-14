
import { useState } from "react";
import { Check, Edit, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryBadge from "./CategoryBadge";
import { GroceryItem as GroceryItemType } from "@/types/grocery";

interface GroceryItemProps {
  item: GroceryItemType;
  onTogglePurchased: (id: string) => void;
  onEdit: (item: GroceryItemType) => void;
  onDelete: (id: string) => void;
}

const GroceryItem = ({ item, onTogglePurchased, onEdit, onDelete }: GroceryItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`grocery-card animate-slide-in ${item.purchased ? 'item-purchased' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePurchased(item.id)}
            className={`rounded-full w-8 h-8 p-0 ${
              item.purchased 
                ? 'bg-grocery-success text-white hover:bg-grocery-success/90' 
                : 'border-2 border-gray-300 hover:border-grocery-mint'
            }`}
          >
            {item.purchased && <Check className="w-4 h-4" />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <CategoryBadge category={item.category} />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Qty: {item.quantity}</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">{item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="text-grocery-mint hover:text-grocery-mint-light hover:bg-grocery-mint/10"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroceryItem;
