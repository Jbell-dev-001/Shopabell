# 🚀 ShopAbell Deployment Guide

This guide will help you deploy ShopAbell to Vercel with Supabase backend.

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] A Vercel account (free tier is sufficient)
- [ ] A Supabase account and project
- [ ] GitHub account with the repository
- [ ] All environment variables ready

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `shopabell-prod` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema
1. Wait for your project to be ready (2-3 minutes)
2. Go to **SQL Editor** in the left sidebar
3. Copy the entire content from `/supabase/schema.sql`
4. Paste it in the SQL editor
5. Click **Run** to execute the schema
6. Verify tables are created in **Table Editor**

### 1.3 Configure Authentication
1. Go to **Authentication** > **Settings**
2. Configure **Site URL**: `https://your-app-name.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/dashboard
   ```
4. **Disable email confirmations** for phone auth:
   - Go to **Authentication** > **Settings** > **Auth**
   - Turn off "Enable email confirmations"

### 1.4 Configure Storage
1. Go to **Storage**
2. Create a new bucket called `product-images`
3. Set it to **Public** (for product image access)
4. Upload test images if needed

### 1.5 Get Your Supabase Credentials
1. Go to **Settings** > **API**
2. Copy these values for environment variables:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API Keys** > **anon public** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Project API Keys** > **service_role** (`SUPABASE_SERVICE_ROLE_KEY`)

## 🌐 Step 2: Deploy to Vercel

### 2.1 Prepare Your Repository
1. **Push your code to GitHub**:
   ```bash
   cd /workspaces/Shopabell/shopabell
   git add .
   git commit -m "Ready for deployment to Vercel"
   git push origin main
   ```

### 2.2 Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. **Import Git Repository**:
   - Select your GitHub account
   - Choose the `Shopabell` repository
   - Select the `shopabell` folder (if monorepo)

### 2.3 Configure Project Settings
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `shopabell` (if needed)
3. **Build Command**: `npm run build` (default)
4. **Install Command**: `npm install` (default)

### 2.4 Add Environment Variables
Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**⚠️ Important**: Replace `your-app-name` with your actual Vercel app name

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## ✅ Step 3: Post-Deployment Configuration

### 3.1 Update Supabase URLs
1. Go back to **Supabase Dashboard**
2. **Authentication** > **Settings** > **URL Configuration**
3. Update **Site URL** to your actual Vercel URL:
   ```
   https://your-actual-app-name.vercel.app
   ```
4. Update **Redirect URLs**:
   ```
   https://your-actual-app-name.vercel.app/auth/callback
   https://your-actual-app-name.vercel.app/dashboard
   https://your-actual-app-name.vercel.app/**
   ```

### 3.2 Test Your Deployment
1. **Visit your app**: `https://your-app-name.vercel.app`
2. **Test phone registration**:
   - Try registering with a phone number
   - Check OTP simulation works
3. **Test PWA features**:
   - Look for "Install App" prompt
   - Try installing the PWA
4. **Test core features**:
   - Create a seller account
   - Add a test product
   - Test the chat system

### 3.3 Set Up Custom Domain (Optional)
1. In Vercel Dashboard, go to your project
2. Click **"Domains"** tab
3. Add your custom domain
4. Update Supabase URLs to use your custom domain

## 🔧 Step 4: Environment-Specific Configuration

### 4.1 Production Environment Variables
Add these additional variables for production:

```env
# Security
NODE_ENV=production

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Error Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

### 4.2 Database Security
1. **Enable RLS policies** (already configured in schema)
2. **Review API keys** - ensure service role key is secure
3. **Set up database backups** in Supabase

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# If build fails, check locally first:
npm run build

# Check TypeScript errors:
npm run type-check
```

#### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

#### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check if RLS policies are blocking access
- Ensure database schema is properly applied

#### PWA Not Working
- PWA requires HTTPS (Vercel provides this automatically)
- Check if service worker is being cached
- Clear browser cache and try again

#### Authentication Issues
- Verify redirect URLs in Supabase match your domain
- Check if Site URL is set correctly
- Ensure phone auth is configured properly

### Debugging Steps
1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard > Project > Functions tab
   - Check for runtime errors

2. **Check Browser Console**:
   - Open DevTools
   - Look for network errors or JavaScript errors

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs
   - Filter by error level

## 📊 Step 5: Monitoring & Analytics

### 5.1 Vercel Analytics
1. Go to your Vercel project dashboard
2. Enable **Vercel Analytics** (free tier available)
3. Monitor performance and usage

### 5.2 Supabase Monitoring
1. Monitor database performance in Supabase Dashboard
2. Check **Logs** for any errors
3. Monitor **API** usage

### 5.3 PWA Analytics
- Monitor app installations
- Track offline usage
- Monitor service worker performance

## 🎉 Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied successfully
- [ ] Authentication settings configured
- [ ] Storage bucket created and configured
- [ ] Repository pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Environment variables added
- [ ] Site URLs updated in Supabase
- [ ] App tested and working
- [ ] PWA features verified
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and analytics set up

## 🔗 Useful Links

- **Your App**: `https://your-app-name.vercel.app`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**🚀 Congratulations!** Your ShopAbell platform is now live and ready for users!

For any issues, check the troubleshooting section above or create an issue in the repository.