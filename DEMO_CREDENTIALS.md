# 🚀 ShopAbell Demo Credentials

Welcome to ShopAbell! Here are demo credentials to test the platform functionality.

## 📱 How to Login

1. **Go to Login Page**: Visit `/login` on your deployed ShopAbell site
2. **Enter Phone Number**: Use one of the demo phone numbers below
3. **Get OTP**: The OTP will be displayed prominently on screen in a green box
4. **Enter OTP**: Copy the displayed OTP to complete login

## 👥 Demo User Accounts

### 🏪 Seller Accounts

#### **Demo Seller 1 - Fashion Store**


- **Phone**: `+919876543210`
- **Name**: Priya Sharma
- **Business**: Fashion Junction
- **Role**: Seller
- **Features**: Full seller dashboard, product management, analytics
- **Demo OTP**: `123456` (in development mode)

#### **Demo Seller 2 - Electronics Store**  
- **Phone**: `+919876543211`
- **Name**: Rajesh Kumar
- **Business**: Tech Mart
- **Role**: Seller
- **Features**: Electronics catalog, shipping integration
- **Demo OTP**: `123456` (in development mode)

#### **Demo Seller 3 - Food & Beverages**
- **Phone**: `+919876543212` 
- **Name**: Anita Verma
- **Business**: Healthy Bites
- **Role**: Seller
- **Features**: F&B products, livestream selling
- **Demo OTP**: `123456` (in development mode)

### 🛒 Buyer Accounts

#### **Demo Buyer 1**
- **Phone**: `+919876543220`
- **Name**: Vikram Singh
- **Role**: Buyer
- **Features**: Shopping, chat with sellers, order tracking
- **Demo OTP**: `123456` (in development mode)

#### **Demo Buyer 2**
- **Phone**: `+919876543221`
- **Name**: Meera Patel
- **Role**: Buyer  
- **Features**: Multi-seller cart, social commerce
- **Demo OTP**: `123456` (in development mode)

### 👨‍💼 Admin Account

#### **Platform Admin**
- **Phone**: `+919876543200`
- **Name**: Admin User
- **Role**: Admin
- **Features**: Partnership management, user analytics, platform oversight
- **Demo OTP**: `123456` (in development mode)
- **Access**: Visit `/admin` after login

## 🔐 Authentication Flow

### Development Mode (Localhost/Testing)
1. Enter any demo phone number
2. Click "Send OTP"
3. **OTP will be displayed in**:
   - Browser console (`F12` → Console tab)
   - Toast notification (top-right corner)
4. Enter the displayed OTP (usually `123456`)
5. Access granted!

### Production Mode
1. Enter demo phone number
2. OTP will be "sent" (simulated in demo)
3. Use `123456` as the OTP for all demo accounts
4. Login successful!

## 🎯 What to Test

### As a Seller (`+919876543210`)
- ✅ **Dashboard**: View sales analytics and metrics
- ✅ **Products**: Add/edit products with images
- ✅ **Orders**: Manage customer orders
- ✅ **Chat**: Respond to customer inquiries
- ✅ **Shipping**: Generate shipping labels
- ✅ **Livestream**: Test live selling features
- ✅ **Analytics**: View business insights

### As a Buyer (`+919876543220`)
- ✅ **Explore**: Browse seller stores and products
- ✅ **Cart**: Add products from multiple sellers
- ✅ **Chat**: Message sellers about products
- ✅ **Checkout**: Complete purchase flow
- ✅ **Orders**: Track order status
- ✅ **PWA**: Install app on mobile device

### As an Admin (`+919876543200`)
- ✅ **Partnerships**: Manage seller applications
- ✅ **Users**: View platform user analytics
- ✅ **Reports**: Generate business reports
- ✅ **Payments**: Monitor transaction flow

## 🔧 Setup Demo Data (REQUIRED FIRST!)

**⚠️ IMPORTANT: You MUST seed demo users before testing login!**

**Option 1: API Endpoint (Recommended)**
After deployment, visit: `https://shopabellv1.vercel.app/api/demo/seed-users`
This will automatically create all demo users in your database.

**Option 2: Manual SQL (Alternative)**
If you want to manually populate your Supabase database, run this SQL script in your Supabase SQL Editor:

\`\`\`sql
-- Insert demo users
INSERT INTO users (id, phone, name, email, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', '+919876543210', 'Priya Sharma', 'priya@shopabell.demo', 'seller', true),
('550e8400-e29b-41d4-a716-446655440002', '+919876543211', 'Rajesh Kumar', 'rajesh@shopabell.demo', 'seller', true),
('550e8400-e29b-41d4-a716-446655440003', '+919876543212', 'Anita Verma', 'anita@shopabell.demo', 'seller', true),
('550e8400-e29b-41d4-a716-446655440004', '+919876543220', 'Vikram Singh', 'vikram@shopabell.demo', 'buyer', true),
('550e8400-e29b-41d4-a716-446655440005', '+919876543221', 'Meera Patel', 'meera@shopabell.demo', 'buyer', true),
('550e8400-e29b-41d4-a716-446655440006', '+919876543200', 'Admin User', 'admin@shopabell.demo', 'admin', true);

-- Insert demo sellers
INSERT INTO sellers (id, business_name, business_category, subscription_plan, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Fashion Junction', 'Fashion & Apparel', 'premium', true),
('550e8400-e29b-41d4-a716-446655440002', 'Tech Mart', 'Electronics', 'basic', true),
('550e8400-e29b-41d4-a716-446655440003', 'Healthy Bites', 'Food & Beverages', 'free', true);

-- Insert demo buyers  
INSERT INTO buyers (id, delivery_address) VALUES
('550e8400-e29b-41d4-a716-446655440004', '{"street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'),
('550e8400-e29b-41d4-a716-446655440005', '{"street": "456 Park Ave", "city": "Delhi", "state": "Delhi", "pincode": "110001"}');
\`\`\`

## 📱 Mobile Testing

For PWA testing on mobile:
1. Open your deployed site on mobile browser
2. Look for "Add to Home Screen" prompt
3. Install the PWA
4. Test offline functionality
5. Verify push notifications (if configured)

## 🆘 Troubleshooting

### ❌ Authentication Errors?
**First, seed demo data:**
1. Visit: `https://your-app.vercel.app/api/demo/seed-users`
2. Should return: `{"success": true, "message": "Demo users seeded successfully"}`
3. Now try logging in with demo credentials

### ❌ OTP Not Showing?
- Check browser console (`F12` → Console)
- Look for toast notifications (top-right corner)
- In dev mode, OTP is always logged as `123456`

### ❌ Can't Login?
- **FIRST**: Run the demo seed API endpoint above
- Ensure you're using the exact phone format: `+919876543210`
- Try clearing browser cache/cookies
- Check network connection
- Verify demo users exist in Supabase dashboard

### ❌ "Email is invalid" Error?
- This is fixed in the latest update
- Phone numbers are now properly sanitized for auth
- Clear browser cache and try again

### ❌ Features Not Loading?
- Verify environment variables are set
- Check Supabase connection
- Ensure database schema is properly imported
- Run demo seed endpoint first

### ❌ 404 Errors?
- Ensure all API routes are deployed
- Check `/api/ping` endpoint exists
- Verify Vercel deployment completed successfully

## 🎉 Success!

You now have full access to test ShopAbell's complete social commerce platform! 

**Happy Testing!** 🛍️✨

---

**Need Help?** Check the deployment guide at `/VERCEL_DEPLOY_GUIDE.md` or create an issue on GitHub.