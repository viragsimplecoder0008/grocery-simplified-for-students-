-- Add sample categories and products for testing

-- Insert sample categories
INSERT INTO public.categories (name, description, color, created_by)
VALUES
  ('Fruits & Vegetables', 'Fresh produce including fruits and vegetables', '#22c55e', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Dairy & Eggs', 'Milk, cheese, yogurt, and eggs', '#3b82f6', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Meat & Seafood', 'Fresh meat, poultry, and seafood', '#ef4444', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Pantry Staples', 'Rice, pasta, canned goods, and spices', '#f59e0b', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Beverages', 'Juices, water, tea, and coffee', '#8b5cf6', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, category_id, price, unit, nutritional_info, created_by)
VALUES
  ('Organic Apples', (SELECT id FROM public.categories WHERE name = 'Fruits & Vegetables' LIMIT 1), 2.99, 'per lb', '{"calories": 52, "fiber": "2.4g", "vitamin_c": "14% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Fresh Spinach', (SELECT id FROM public.categories WHERE name = 'Fruits & Vegetables' LIMIT 1), 1.99, 'per bunch', '{"calories": 7, "iron": "15% DV", "vitamin_k": "181% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Whole Milk', (SELECT id FROM public.categories WHERE name = 'Dairy & Eggs' LIMIT 1), 3.49, 'per gallon', '{"calories": 150, "protein": "8g", "calcium": "30% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Free Range Eggs', (SELECT id FROM public.categories WHERE name = 'Dairy & Eggs' LIMIT 1), 4.99, 'per dozen', '{"calories": 70, "protein": "6g", "vitamin_d": "10% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Atlantic Salmon', (SELECT id FROM public.categories WHERE name = 'Meat & Seafood' LIMIT 1), 12.99, 'per lb', '{"calories": 206, "protein": "22g", "omega_3": "1.8g"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Ground Beef', (SELECT id FROM public.categories WHERE name = 'Meat & Seafood' LIMIT 1), 6.99, 'per lb', '{"calories": 250, "protein": "26g", "iron": "12% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Basmati Rice', (SELECT id FROM public.categories WHERE name = 'Pantry Staples' LIMIT 1), 4.99, 'per 2lb bag', '{"calories": 160, "carbs": "36g", "fiber": "1g"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Extra Virgin Olive Oil', (SELECT id FROM public.categories WHERE name = 'Pantry Staples' LIMIT 1), 8.99, 'per 500ml', '{"calories": 120, "fat": "14g", "vitamin_e": "10% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Orange Juice', (SELECT id FROM public.categories WHERE name = 'Beverages' LIMIT 1), 3.99, 'per 64oz', '{"calories": 110, "vitamin_c": "120% DV", "folate": "10% DV"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1)),
  ('Green Tea', (SELECT id FROM public.categories WHERE name = 'Beverages' LIMIT 1), 5.49, 'per 20 bags', '{"calories": 0, "antioxidants": "high", "caffeine": "25mg"}', (SELECT id FROM auth.users WHERE email = 'admin@grocerysimplified.com' LIMIT 1))
ON CONFLICT (name) DO NOTHING;
