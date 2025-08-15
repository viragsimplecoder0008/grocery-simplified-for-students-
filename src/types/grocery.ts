export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate relative to USD
}

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
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  brand_id?: number;
  image_url?: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
}

export interface Brand {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'category_manager' | 'student';
  full_name?: string;
  currency?: Currency;
  budget?: number;
  budget_updated_at?: string;
  birth_day?: number;
  birth_month?: number;
  favorite_cake?: string;
  favorite_snacks?: string;
  hobbies?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetRequest {
  id: number;
  group_id?: number;
  budget: number;
  requested_by: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  requested_by_user?: UserProfile;
  approved_by_user?: UserProfile;
}

export interface GeminiRecommendation {
  product_name: string;
  reason: string;
  category: 'birthday' | 'seasonal' | 'hobby' | 'preference';
  confidence_score?: number;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: GeminiRecommendation[];
  birthday_message?: string;
  seasonal_note?: string;
  days_until_birthday: number;
  error?: string;
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

// Group System Types
export interface Group {
  id: number;
  name: string;
  description?: string;
  join_code: string;
  leader_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  leader?: UserProfile;
  member_count?: number;
}

export interface GroupMembership {
  id: number;
  group_id: number;
  user_id: string;
  joined_at: string;
  is_active: boolean;
  user?: UserProfile;
  group?: Group;
}

export interface GroupGroceryItem {
  id: number;
  group_id: number;
  product_id?: number;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  added_by: string;
  is_purchased: boolean;
  purchased_by?: string;
  purchased_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  added_by_user?: UserProfile;
  purchased_by_user?: UserProfile;
}

export type NotificationType = 'item_added' | 'item_purchased' | 'item_removed' | 'member_joined' | 'member_left';

export interface GroupNotification {
  id: number;
  group_id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  group?: Group;
}

// Split Bill Types
export interface GroupOrder {
  id: number;
  group_id: number;
  order_date: string;
  total_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  group?: Group;
  created_by_user?: UserProfile;
}

export interface GroupOrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  created_at: string;
  product?: Product;
}

export interface GroupBillSplit {
  id: number;
  order_id: number;
  user_id: string;
  amount_owed: number;
  amount_paid: number;
  is_paid: boolean;
  joined_before_order: boolean;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  order?: GroupOrder;
}

export interface BillSummary {
  order_id: number;
  total_amount: number;
  total_members: number;
  members_who_joined_before: number;
  amount_per_member: number;
  total_paid: number;
  total_outstanding: number;
  splits: GroupBillSplit[];
}