
import { GroceryCategory } from "@/types/grocery";

interface CategoryBadgeProps {
  category: GroceryCategory;
  className?: string;
}

const CategoryBadge = ({ category, className = "" }: CategoryBadgeProps) => {
  const getCategoryIcon = (category: GroceryCategory) => {
    switch (category) {
      case 'produce': return '🥬';
      case 'dairy': return '🥛';
      case 'meat': return '🥩';
      case 'snacks': return '🍿';
      case 'beverages': return '🥤';
      case 'other': return '📦';
      default: return '📦';
    }
  };

  const getCategoryLabel = (category: GroceryCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border category-${category} ${className}`}>
      <span>{getCategoryIcon(category)}</span>
      {getCategoryLabel(category)}
    </span>
  );
};

export default CategoryBadge;
