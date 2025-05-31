#!/bin/bash

# ShopAbell Deployment Script for Vercel
echo "🚀 Preparing ShopAbell for Vercel deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "feat: Complete ShopAbell social commerce platform

- ✅ Phone number authentication with OTP
- ✅ Seller dashboard with product management
- ✅ Buyer store frontend with shopping cart
- ✅ Chat commerce with sell commands
- ✅ Live selling with screen capture
- ✅ Shipping integration with multiple couriers
- ✅ Analytics dashboard with business insights
- ✅ Admin partnership system with tiers
- ✅ PWA with offline support and push notifications
- ✅ Complete database schema with 30+ tables
- ✅ Responsive design for mobile and desktop

Ready for production deployment! 🎉"
else
    echo "✅ No uncommitted changes found."
fi

# Test build locally
echo "🔧 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo ""
echo "🎉 ShopAbell is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Set up Supabase project (see DEPLOYMENT.md)"
echo "3. Connect to Vercel and deploy"
echo "4. Add environment variables in Vercel"
echo "5. Update Supabase URLs with your Vercel domain"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🚀 Quick deploy with Vercel CLI:"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""