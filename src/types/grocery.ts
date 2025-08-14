
export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: GroceryCategory;
  purchased: boolean;
  createdAt: Date;
}

export type GroceryCategory = 'produce' | 'dairy' | 'meat' | 'snacks' | 'beverages' | 'other';

export interface BudgetSummary {
  totalItems: number;
  totalCost: number;
  purchasedItems: number;
  purchasedCost: number;
  remainingCost: number;
}
