# ShopAbell Deployment Guide

This guide provides comprehensive instructions for deploying ShopAbell to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Testing](#testing)
6. [Staging Deployment](#staging-deployment)
7. [Production Deployment](#production-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for hosting)
- WhatsApp Business API access (for production)
- Git

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API (Production Only)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Optional: Payment Gateway Configuration
PAYMENT_GATEWAY_KEY=your_payment_key
PAYMENT_GATEWAY_SECRET=your_payment_secret

# Optional: Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket
```

### Development Environment Variables

For local development, you can use demo/test values:

```bash
# Demo WhatsApp Configuration (for testing)
WHATSAPP_ACCESS_TOKEN=demo_token
WHATSAPP_PHONE_NUMBER_ID=demo_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=demo_verify_token
```

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Database Migrations

```bash
# Apply the schema
npx supabase db reset

# Or manually run the SQL schema
# Copy content from supabase/schema.sql and run in Supabase SQL editor
```

### 3. Set Up Row Level Security (RLS)

The schema includes RLS policies, but verify they're applied:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Seed Demo Data (Recommended)

**Option A: Quick API Seeding**
```bash
# Fashion & jewelry sellers with authentic Indian products
curl -X POST https://your-app.vercel.app/api/demo/seed-fashion-jewelry

# General demo users and buyers  
curl -X POST https://your-app.vercel.app/api/demo/seed-users

# Sample chat conversations
curl -X POST https://your-app.vercel.app/api/demo/create-sample-chats
```

**Option B: Automated Script**
```bash
# Seed all demo data at once
npm run seed-demo https://your-app.vercel.app
```

**Option C: Demo Setup Page**
Visit: `https://your-app.vercel.app/demo-setup`

**Option D: Manual Database**
Run the SQL from `supabase/demo-fashion-jewelry-data.sql` in Supabase SQL Editor

**Demo Accounts Created:**
- 7 Indian fashion/jewelry sellers with authentic products
- Multiple buyer accounts for testing
- Sample chat conversations with "sell" commands
- Order history and analytics data

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Verify Setup

- Visit `http://localhost:3000`
- Check health endpoint: `http://localhost:3000/api/ping`
- Test WhatsApp onboarding: `http://localhost:3000/whatsapp-onboarding`

## Testing

### Run All Tests

```bash
npm run test
```

### Test Categories

```bash
# API Tests Only
npm run test:api

# Component Tests Only
npm run test:components

# Performance Analysis Only
npm run test:performance

# Verbose Output
npm run test -- --verbose
```

### Health Check

```bash
npm run health-check
```

## Staging Deployment

### 1. Deploy to Vercel Staging

```bash
# Dry run first
npm run deploy:dry-run

# Deploy to staging
npm run deploy:staging
```

### 2. Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all required env vars
```

### 3. Verify Staging Deployment

```bash
# Run tests against staging
npm run test -- --base-url=https://your-staging-url.vercel.app
```

## Production Deployment

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] WhatsApp Business API verified
- [ ] Performance optimized
- [ ] Security review completed

### 2. Deploy to Production

```bash
# Deploy to production
npm run deploy:production
```

### 3. Post-deployment Verification

```bash
# Health check
curl https://your-domain.com/api/ping

# WhatsApp webhook verification
curl "https://your-domain.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"
```

### 4. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring and Maintenance

### Performance Monitoring

```bash
# Generate performance report
npm run test:performance -- --verbose
```

### Database Monitoring

Monitor these metrics in Supabase dashboard:
- Connection count
- Query performance
- Storage usage
- API request volume

### Application Monitoring

Set up monitoring for:
- API response times
- Error rates
- User engagement metrics
- WhatsApp message delivery rates

### Log Monitoring

Key logs to monitor:
- WhatsApp webhook errors
- Payment processing failures
- Database connection issues
- Authentication failures

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if .env.local exists
ls -la .env.local

# Verify variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### 2. Database Connection Errors

- Verify Supabase URL and keys
- Check if database exists
- Ensure RLS policies are not blocking access

#### 3. WhatsApp Webhook Issues

- Verify webhook URL is publicly accessible
- Check verify token matches
- Ensure HTTPS is used in production

#### 4. Build Failures

```bash
# Check TypeScript errors
npm run type-check

# Check linting issues
npm run lint

# Clean build
rm -rf .next
npm run build
```

#### 5. Performance Issues

```bash
# Analyze bundle size
npm run build -- --analyze

# Run performance tests
npm run test:performance
```

### Debug Commands

```bash
# Verbose deployment
npm run deploy -- --verbose

# Skip certain steps
npm run deploy -- --skip-tests

# Test specific API endpoint
curl -X POST http://localhost:3000/api/whatsapp/onboarding \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'
```

### Getting Help

1. Check the logs in Vercel dashboard
2. Review Supabase logs and metrics
3. Check GitHub issues
4. Contact support with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Deployment logs

## Security Considerations

### Production Security Checklist

- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] HTTPS enforced
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication tokens rotated
- [ ] Webhook signatures verified
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CORS properly configured

### Regular Maintenance

- Update dependencies monthly
- Rotate API keys quarterly
- Review access logs weekly
- Monitor error rates daily
- Backup database regularly
- Update documentation as needed

## Performance Optimization

### Recommendations Implemented

- Image optimization with Next.js
- API response caching
- Database query optimization
- Bundle splitting and lazy loading
- Service Worker for offline functionality
- CDN for static assets
- Gzip compression
- Tree shaking for smaller bundles

### Monitoring Performance

Use the built-in performance testing:

```bash
npm run test:performance
```

This will generate a detailed report with recommendations for improvement.

## Conclusion

This guide covers the complete deployment process for ShopAbell. Follow the steps carefully and refer to the troubleshooting section if you encounter issues.

For additional support, refer to the documentation in the `/docs` folder or contact the development team.