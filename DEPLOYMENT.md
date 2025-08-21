# SignalNote Deployment Guide

## 🚀 Quick Deploy to Production

This guide will get your SignalNote app live on Vercel in under 30 minutes.

## Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click "+" → "New repository"
3. Name: `SignalNote`
4. Description: "Customer Feedback Analysis Platform with AI-powered insights"
5. Make it Public (recommended)
6. **Don't** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 1.2 Push Your Code
```bash
# Your local repo is already initialized and committed
# Just add the remote and push:

git remote add origin https://github.com/YOUR_USERNAME/SignalNote.git
git push -u origin main
```

## Step 2: Vercel Deployment

### 2.1 Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click "New Project"
4. Import your `SignalNote` repository
5. Click "Import"

### 2.2 Configure Project
- **Project Name**: `signalnote`
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `.` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 2.3 Add Environment Variables
**Critical**: Add these in Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

**Note**: For `NEXT_PUBLIC_APP_URL`, use the Vercel domain that will be assigned (e.g., `https://signalnote.vercel.app`)

### 2.4 Deploy
Click "Deploy" and wait for build to complete!

## Step 3: Post-Deployment Setup

### 3.1 Update Stripe Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to Vercel environment variables

### 3.2 Test Your App
1. Visit your Vercel domain
2. Test signup/login
3. Test adding feedback
4. Test Pro subscription flow
5. Verify webhooks are working

## Step 4: Production Verification

### 4.1 Health Check
```bash
curl https://your-vercel-domain.vercel.app/api/health
```
Should return: `{"status":"healthy","timestamp":"..."}`

### 4.2 Test Core Features
- [ ] User registration works
- [ ] Feedback can be added
- [ ] Pro subscription checkout works
- [ ] Search and insights are gated properly

### 4.3 Monitor Logs
- Check Vercel function logs for any errors
- Monitor Stripe webhook delivery
- Watch for authentication issues

## 🎯 You're Live!

Your SignalNote app is now deployed and ready for users!

**Next Steps:**
1. Share your app URL with potential users
2. Monitor usage and performance
3. Set up error monitoring (optional)
4. Consider custom domain setup

## 🆘 Troubleshooting

### Common Issues:
- **Build fails**: Check environment variables are set correctly
- **Database errors**: Verify Supabase configuration
- **Stripe not working**: Check webhook configuration and secrets
- **Authentication fails**: Verify Supabase auth settings

### Get Help:
- Check the detailed [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- Review Vercel function logs
- Test locally with `npm run dev`

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com/YOUR_USERNAME/SignalNote) 