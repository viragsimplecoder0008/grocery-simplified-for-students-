export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: GroceryCategory;
  purchased: boolean;
  createdAt: Date;
  notes?: string;
}

export type GroceryCategory = 'produce' | 'dairy' | 'meat' | 'snacks' | 'beverages' | 'other';

export interface BudgetSummary {
  totalItems: number;
  totalCost: number;
  purchasedItems: number;
  purchasedCost: number;
  remainingCost: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'category_manager' | 'student';
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryListItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  is_purchased: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}