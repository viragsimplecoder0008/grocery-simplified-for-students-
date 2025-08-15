# Split Bills Feature 🧾💰

A comprehensive bill splitting feature for your Grocery Simplified app that allows group members to easily split expenses and track payments.

## ✨ Features

### 🎯 Core Functionality
- **Multiple Split Methods**: Equal splits, itemized splits, or custom amounts
- **Smart Bill Creation**: Add items with prices, tax, and tip calculations
- **Payment Tracking**: Record payments with various methods (cash, Venmo, PayPal, etc.)
- **Automatic Status Updates**: Bills automatically mark as completed when fully paid
- **Group Integration**: Seamlessly works with your existing group system

### 💸 Split Methods

1. **Equal Split** 📊
   - Divides total amount equally among all group members
   - Perfect for shared meals or group purchases

2. **Itemized Split** 🛒
   - Assign specific items to specific people
   - Proportional tax and tip distribution
   - Ideal for detailed expense tracking

3. **Custom Split** ⚖️
   - Manually set amounts for each person
   - Maximum flexibility for complex situations

### 💳 Payment Methods

#### 🏦 **Razorpay Integration** ⚡
- **Credit/Debit Cards** 💳 (Visa, Mastercard, RuPay)
- **UPI** 📱 (GPay, PhonePe, Paytm, BHIM)
- **Net Banking** 🏦 (All major Indian banks)
- **Digital Wallets** 👛 (Paytm, Mobikwik, Freecharge)
- **EMI Options** 💰 (Credit card EMI)

#### 📝 **Manual Recording** 
- **Cash Payments** 💵 (Record offline payments)
- **Bank Transfers** 🏧 (Manual entry with reference)
- **Other Methods** 📋 (Custom payment tracking)

#### 🔒 **Security Features**
- **PCI DSS Compliant** 🛡️ (Razorpay certified)
- **256-bit SSL Encryption** 🔐
- **No Card Storage** 🚫 (Cards never touch your servers)
- **Fraud Detection** 🕵️ (AI-powered security)

## 🚀 Getting Started

### 1. Database Setup
Run the migration file to create necessary tables:
```sql
-- In your Supabase SQL Editor, run:
-- supabase/migrations/20250815120000_add_split_bills.sql
```

Or use the complete setup script:
```sql
-- Run complete-database-setup.sql for full app setup including split bills
```

### 2. Access Split Bills
1. Navigate to any group in your app
2. Click the **"Split Bills"** tab
3. Click **"New Split Bill"** to create your first split

## 📋 How to Use

### Creating a Split Bill

1. **Basic Information**
   - Enter bill title (e.g., "Dinner at Tony's")
   - Add optional description
   - Choose split method

2. **Add Items**
   - Click "Add Item" to add bill items
   - Enter name, price, and quantity
   - For itemized splits, assign items to specific people

3. **Additional Costs**
   - Add tax amount
   - Add tip amount
   - These are distributed proportionally

4. **Review & Create**
   - Check the split breakdown
   - Verify everyone's amounts
   - Click "Create Split Bill"

### Recording Payments

1. **View Bill Details**
   - Click "View Details" on any bill
   - See individual split amounts

2. **Record Payment**
   - Click "Record Payment" next to any unpaid split
   - Enter payment amount and method
   - Add optional notes (reference numbers, etc.)

3. **Automatic Updates**
   - Bill splits automatically mark as "paid" when fully paid
   - Bills mark as "completed" when all splits are paid

## 🏗️ Technical Architecture

### Database Tables

**split_bills**
- Main bill information
- Total amount, tax, tip
- Split method and status
- Items stored as JSON

**bill_splits**
- Individual user amounts
- Payment tracking per person
- Status management

**split_bill_transactions**
- Payment history
- Multiple payment methods
- Transaction references

### Security Features
- **Row Level Security (RLS)**: Only group members can see bills
- **User Permissions**: Users can only update their own payments
- **Creator Rights**: Bill creators can manage their bills

### Performance Optimizations
- **Smart Indexes**: Optimized queries for large groups
- **Automatic Triggers**: Status updates without manual intervention
- **Efficient Joins**: Minimal database calls for bill views

## 🎨 UI Components

### SplitBillDialog
- **Purpose**: Create new split bills
- **Features**: Form validation, real-time calculations, itemized assignments
- **Integration**: Works with existing group system

### SplitBillsManager
- **Purpose**: View and manage all group split bills
- **Features**: Filtering, payment recording, detailed bill views
- **Responsive**: Works on all screen sizes

## 📊 Example Use Cases

### 🍕 Group Dinner
```
Bill: "Pizza Night"
Items: 
- Large Pizza: $25.00 (shared by all 4 people)
- Garlic Bread: $8.00 (shared by all 4 people)
Tax: $3.50
Tip: $7.00
Total: $43.50

Split Method: Equal
Each person pays: $10.88
```

### 🛒 Grocery Shopping
```
Bill: "Weekly Groceries"
Items:
- Milk: $3.50 (assigned to Alice)
- Bread: $2.25 (assigned to Bob and Charlie)
- Eggs: $4.00 (assigned to all 3 people)
Tax: $0.85
Total: $10.60

Split Method: Itemized
Alice pays: $4.68 (milk + proportional tax/tip)
Bob pays: $2.96 (half bread + proportional tax/tip)
Charlie pays: $2.96 (half bread + proportional tax/tip)
```

### 🎉 Custom Event
```
Bill: "Birthday Party Supplies"
Total: $120.00

Split Method: Custom
Alice pays: $40.00 (host pays more)
Bob pays: $30.00
Charlie pays: $25.00
Dave pays: $25.00
```

## 🔧 Integration Guide

### Adding to Existing Groups
The split bills feature integrates seamlessly with your existing group system:

1. **GroupGroceryList Component**: Now includes tabs for both grocery lists and split bills
2. **Group Navigation**: Access split bills from any group page
3. **Notifications**: Group members get notified of new split bills

### Customization Options
- **Payment Methods**: Add/remove payment methods in the codebase
- **Split Types**: Extend with additional split calculation methods
- **UI Themes**: Components use your existing design system
- **Currency Support**: Works with your existing currency system

## 🚨 Important Notes

### Database Requirements
- Requires groups system to be set up
- Needs user authentication (profiles table)
- Uses Supabase RLS for security

### Performance Considerations
- Bills with many items load efficiently
- Payment history is paginated
- Group member lookups are cached

### Security Best Practices
- All database operations use RLS
- User permissions verified on all actions
- Payment data is encrypted in transit

## 🐛 Troubleshooting

### Common Issues

**"Table doesn't exist" errors**
```sql
-- Make sure you've run the migration:
-- 1. Go to Supabase Dashboard
-- 2. SQL Editor
-- 3. Run the split bills migration
```

**Bills not showing**
- Check if user is a member of the group
- Verify RLS policies are enabled
- Check browser console for errors

**Payment calculations wrong**
- Verify tax/tip amounts are numbers
- Check split method logic in code
- Ensure all required fields are filled

### Getting Help
1. Check browser console for errors
2. Verify database migrations are complete
3. Test with simple equal splits first
4. Check group membership permissions

## 🎯 Future Enhancements

### Planned Features
- **Receipt Scanning**: Auto-populate items from receipt photos
- **Integration APIs**: Connect with Venmo/PayPal for actual payments
- **Recurring Bills**: Set up monthly shared expenses
- **Export Features**: Generate PDF receipts and summaries
- **Advanced Analytics**: Spending patterns and group insights

### Contributing
Want to enhance the split bills feature? Here's how:

1. **Add Payment Methods**: Extend the payment method enum
2. **New Split Types**: Add calculation methods in the dialog
3. **UI Improvements**: Enhance the visual components
4. **Mobile App**: Create React Native versions

---

**Happy Bill Splitting! 🎉💰**

*Turn group expenses from headaches into seamless experiences with smart bill splitting.*
