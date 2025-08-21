# SignalNote Production Deployment Checklist

## ✅ Pre-Deployment Tasks

### 1. Environment Variables
- [ ] All required environment variables are set in production
- [ ] `NEXT_PUBLIC_APP_URL` points to your production domain
- [ ] Supabase production project is configured
- [ ] Stripe production keys are configured
- [ ] OpenAI API key is configured

### 2. Database Setup
- [ ] Supabase production database is running
- [ ] Database schema has been migrated (`supabase/init.sql`)
- [ ] Row-level security policies are active
- [ ] Vector extension (pgvector) is enabled

### 3. External Services
- [ ] Stripe webhook endpoint is configured
- [ ] Webhook secret is set in environment
- [ ] Stripe price ID for subscription is configured

## 🚀 Deployment Steps

### 1. Build and Deploy
```bash
# Build the application
npm run build

# Deploy to your platform (Vercel, Netlify, etc.)
# The vercel.json is already configured
```

### 2. Post-Deployment Verification
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Test public pages
curl https://yourdomain.com/
curl https://yourdomain.com/login

# Test API endpoints (should return 401)
curl -X POST https://yourdomain.com/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"content":"test","source":"Manual"}'
```

### 3. Stripe Webhook Setup
```bash
# Forward webhooks to production (for testing)
stripe listen --forward-to https://yourdomain.com/api/stripe/webhook

# In Stripe Dashboard:
# 1. Go to Webhooks
# 2. Add endpoint: https://yourdomain.com/api/stripe/webhook
# 3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
# 4. Copy webhook secret to environment variables
```

## 🔍 Testing Checklist

### 1. Authentication Flow
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can access protected routes
- [ ] User is redirected to login when unauthorized

### 2. Core Features
- [ ] User can add feedback
- [ ] Feedback is stored with embeddings
- [ ] Dashboard shows feedback statistics
- [ ] Pro features are gated properly

### 3. Pro Features
- [ ] Semantic search works
- [ ] AI clustering works
- [ ] Stripe checkout works
- [ ] Subscription status updates correctly

### 4. Error Handling
- [ ] Invalid input shows validation errors
- [ ] API errors are handled gracefully
- [ ] Error boundary catches React errors
- [ ] Health endpoint reports service status

## 🚨 Critical Issues to Check

### 1. Environment Validation
- [ ] Health endpoint validates all required env vars
- [ ] Missing env vars cause clear error messages
- [ ] Services report connection status

### 2. Security
- [ ] All API routes require authentication
- [ ] Row-level security is enforced
- [ ] User can only access their own data
- [ ] Pro features are properly gated

### 3. Performance
- [ ] Vector search queries are optimized
- [ ] Database indexes are created
- [ ] API responses are reasonable size

## 📊 Monitoring Setup

### 1. Logging
- [ ] Application errors are logged
- [ ] API requests are logged
- [ ] Performance metrics are tracked

### 2. Health Checks
- [ ] Health endpoint responds quickly
- [ ] All services report status
- [ ] Errors are reported clearly

## 🎯 Go-Live Checklist

- [ ] All tests pass
- [ ] Health endpoint shows "healthy"
- [ ] Stripe webhooks are receiving events
- [ ] User can complete full signup → feedback → pro upgrade flow
- [ ] Error monitoring is active
- [ ] Backup procedures are documented

## 🆘 Troubleshooting

### Common Issues:
1. **Environment variables missing**: Check health endpoint
2. **Database connection failed**: Verify Supabase configuration
3. **Stripe webhooks not working**: Check webhook secret and endpoint URL
4. **Vector search slow**: Verify pgvector extension and indexes
5. **Authentication errors**: Check Supabase auth configuration

### Debug Commands:
```bash
# Check environment
curl https://yourdomain.com/api/health

# Test Stripe webhook locally
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Check database connection
# Use Supabase dashboard to verify tables and policies
``` 