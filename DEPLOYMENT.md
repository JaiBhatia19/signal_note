# SignalNote Deployment Guide

Complete guide to deploy SignalNote MVP to production.

## 🚀 Quick Deploy

### 1. Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/signalnote)

1. Click the button above
2. Connect your GitHub repository
3. Set environment variables
4. Deploy!

### 2. Manual Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

## 🗄️ Supabase Setup

### 1. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region close to your users
4. Wait for setup to complete

### 2. Enable Extensions
```sql
-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. Run Database Migration
```bash
# Copy your init.sql content to Supabase SQL Editor
# Or use Supabase CLI
npx supabase db push
```

### 4. Configure Auth
1. Go to Authentication > Settings
2. Set Site URL to your domain
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 5. Set Up RLS Policies
The migration script includes RLS policies, but verify they're working:
```sql
-- Test RLS is working
SELECT * FROM profiles LIMIT 1;
-- Should return empty if not authenticated
```

## 🔑 Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optional Variables
```bash
# AI Models
EMBEDDINGS_MODEL=text-embedding-3-small
ANALYSIS_MODEL=gpt-4o-mini

# Features
BETA_FEATURES=true
```

### Where to Set
- **Vercel**: Project Settings > Environment Variables
- **Local**: `.env.local` file
- **Production**: `.env.production` file

## 💳 Stripe Configuration

### 1. Create Product
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Products > Add Product
3. Name: "SignalNote Pro"
4. Price: $100/month
5. Billing: Recurring

### 2. Configure Webhooks
1. Webhooks > Add endpoint
2. URL: `https://yourdomain.com/api/stripe/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Test Webhooks
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🌐 Domain & SSL

### 1. Custom Domain
1. Go to Vercel Project Settings
2. Domains > Add Domain
3. Enter your domain
4. Update DNS records as instructed

### 2. DNS Records
```bash
# A Record
yourdomain.com -> 76.76.19.34

# CNAME Record
www.yourdomain.com -> cname.vercel-dns.com
```

### 3. SSL Certificate
- Vercel automatically provisions SSL
- No additional configuration needed

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
1. Project Settings > Analytics
2. Enable Web Analytics
3. Track page views and performance

### 2. Error Monitoring
```bash
# Add Sentry or similar
npm install @sentry/nextjs
```

### 3. Health Checks
```bash
# Test your API endpoints
curl https://yourdomain.com/api/health
```

## 🔒 Security Checklist

### 1. Environment Variables
- [ ] No secrets in code
- [ ] Production keys are different from development
- [ ] Service role key is secure

### 2. Authentication
- [ ] RLS policies are working
- [ ] Auth redirects are secure
- [ ] Session management is configured

### 3. API Security
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Input validation implemented

### 4. Database
- [ ] pgvector extension enabled
- [ ] RLS policies tested
- [ ] Backup strategy in place

## 🧪 Testing Production

### 1. Smoke Tests
```bash
# Run E2E tests against production
npm run test:e2e -- --base-url=https://yourdomain.com
```

### 2. API Tests
```bash
# Test all endpoints
curl -X GET https://yourdomain.com/api/health
curl -X POST https://yourdomain.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. User Flow Tests
1. Visit landing page
2. Join waitlist
3. Sign up with email
4. Add feedback
5. Test AI analysis
6. Verify search works
7. Check clustering

## 📈 Performance Optimization

### 1. Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_feedback_owner_created ON feedback(owner_id, created_at);
CREATE INDEX idx_clusters_owner ON clusters(owner_id);
```

### 2. Caching
```typescript
// Implement Redis or similar for AI analysis caching
// Cache embeddings and analysis results
```

### 3. CDN
- Vercel automatically serves static assets from CDN
- Consider image optimization

## 🚨 Troubleshooting

### Common Issues

#### 1. pgvector Not Working
```sql
-- Check if extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Enable if not
CREATE EXTENSION vector;
```

#### 2. RLS Policies Not Working
```sql
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

#### 3. Stripe Webhooks Failing
```bash
# Check webhook logs in Stripe dashboard
# Verify endpoint URL is correct
# Test with Stripe CLI locally
```

#### 4. OpenAI Rate Limits
```typescript
// Implement exponential backoff
// Add request queuing
// Use smaller models for development
```

### Debug Commands
```bash
# Check Vercel deployment
vercel ls

# View logs
vercel logs

# Check Supabase status
npx supabase status

# Test database connection
npx supabase db reset
```

## 🔄 Deployment Workflow

### 1. Development
```bash
npm run dev          # Local development
npm run test         # Run tests
npm run build        # Test build
```

### 2. Staging
```bash
# Deploy to staging environment
vercel --env staging

# Test staging deployment
npm run test:e2e -- --base-url=https://staging.yourdomain.com
```

### 3. Production
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://yourdomain.com/api/health
```

### 4. Post-Deployment
- [ ] Run smoke tests
- [ ] Check all features work
- [ ] Monitor error rates
- [ ] Verify analytics tracking

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase dashboard for errors
4. Open a GitHub issue with details

---

**Happy Deploying! 🚀** 