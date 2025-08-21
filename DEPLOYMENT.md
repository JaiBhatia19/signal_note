# SignalNote Deployment Checklist

## Pre-deployment Setup

### 1. Supabase Configuration
- [ ] Create Supabase project
- [ ] Enable pgvector extension
- [ ] Run `supabase/init.sql` in SQL editor
- [ ] Copy project URL and keys
- [ ] Test database connection

### 2. Stripe Configuration
- [ ] Create Stripe account
- [ ] Create product with $100/month recurring price
- [ ] Copy price ID to `STRIPE_PRICE_ID`
- [ ] Get API keys (publishable and secret)
- [ ] Set up webhook endpoints

### 3. OpenAI Configuration
- [ ] Get OpenAI API key
- [ ] Test API access
- [ ] Verify embedding model access

### 4. Environment Variables
Ensure all these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Vercel Deployment

### 1. Repository Setup
- [ ] Push code to GitHub
- [ ] Ensure all files are committed
- [ ] Verify `.gitignore` excludes `.env.local`

### 2. Vercel Project
- [ ] Create new Vercel project
- [ ] Connect to GitHub repository
- [ ] Set framework preset to Next.js
- [ ] Configure build settings

### 3. Environment Variables in Vercel
- [ ] Add all environment variables from `.env.local`
- [ ] Set `NODE_ENV=production`
- [ ] Verify `NEXT_PUBLIC_APP_URL` matches your Vercel domain

### 4. Build and Deploy
- [ ] Trigger deployment
- [ ] Monitor build logs for errors
- [ ] Verify successful deployment

## Post-deployment Verification

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Login/signup forms work
- [ ] Navigation functions properly
- [ ] Responsive design works on mobile

### 2. Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Session persistence works
- [ ] Logout works

### 3. Core Features
- [ ] Add feedback functionality
- [ ] Dashboard displays correctly
- [ ] Feature request creation works
- [ ] Basic CRUD operations function

### 4. Pro Features (after subscription)
- [ ] Search functionality works
- [ ] Insights clustering works
- [ ] Pro feature gating works correctly

### 5. Stripe Integration
- [ ] Checkout flow works
- [ ] Webhook receives events
- [ ] Subscription status updates correctly
- [ ] Pro features unlock after payment

### 6. Security
- [ ] API routes are protected
- [ ] User data isolation works
- [ ] RLS policies are enforced
- [ ] No sensitive data exposed

## Monitoring and Maintenance

### 1. Error Tracking
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Monitor API response times
- [ ] Track user engagement metrics

### 2. Database Monitoring
- [ ] Monitor Supabase usage
- [ ] Check pgvector performance
- [ ] Monitor storage usage

### 3. API Monitoring
- [ ] Monitor OpenAI API usage
- [ ] Track Stripe webhook delivery
- [ ] Monitor rate limits

## Troubleshooting Common Issues

### Build Failures
- Check environment variables are set
- Verify all dependencies are installed
- Check for TypeScript errors

### Database Connection Issues
- Verify Supabase credentials
- Check RLS policies
- Test database functions

### Stripe Issues
- Verify webhook endpoint URL
- Check webhook secret
- Monitor Stripe dashboard for errors

### OpenAI Issues
- Check API key validity
- Monitor rate limits
- Verify model access

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs) 