# SignalNote - Customer Feedback Analysis Platform

Turn customer feedback into actionable insights with AI-powered analysis, semantic search, and automated clustering.

## Features

- **Smart Feedback Storage**: Paste transcripts, notes, or feedback with automatic AI embedding generation
- **Semantic Search**: Find relevant feedback using natural language queries powered by pgvector
- **AI Clustering**: Automatically group feedback into actionable themes and pain points
- **Feature Request Tracking**: Simple tracker for managing feature requests with status updates
- **Pro Subscription**: $100/month plan with access to Search and Insights features
- **Multi-tenant**: Each user only sees their own data with proper isolation

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL) with pgvector extension
- **AI**: OpenAI embeddings and GPT-4 for clustering
- **Payments**: Stripe Checkout for subscriptions
- **Authentication**: Supabase Auth with email/password

## Quick Start

### 1. Environment Setup

Copy the environment variables template:

```bash
cp env.local.example .env.local
```

Fill in your environment variables:

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

### 2. Supabase Setup

1. Create a new Supabase project
2. Enable the pgvector extension in the SQL editor
3. Run the SQL from `supabase/init.sql` in your Supabase SQL editor
4. Copy your project URL and anon key to `.env.local`

### 3. Stripe Setup

1. Create a Stripe account and get your API keys
2. Create a product with a $100/month recurring price
3. Copy the price ID to `STRIPE_PRICE_ID`
4. Set up webhook endpoints for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Point webhooks to: `https://your-domain.vercel.app/api/stripe/webhook`

### 4. OpenAI Setup

1. Get your OpenAI API key from the dashboard
2. Add it to `OPENAI_API_KEY` in `.env.local`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses these main tables:

- **profiles**: User profiles with subscription status
- **feedback**: Feedback content with AI embeddings
- **feature_requests**: Feature request tracking
- **feedback_feature_link**: Many-to-many relationship between feedback and feature requests

## API Routes

- `POST /api/feedback` - Create feedback with AI embedding
- `POST /api/search` - Semantic search using pgvector
- `POST /api/insights/cluster` - Generate AI-powered clusters
- `POST /api/feature-requests` - Create feature requests
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all the same environment variables in your Vercel project settings.

## Usage Flow

1. **Sign Up**: Create an account with email/password
2. **Add Feedback**: Paste transcripts, notes, or feedback content
3. **Search** (Pro): Use semantic search to find relevant feedback
4. **Insights** (Pro): Generate AI-powered clusters to identify themes
5. **Feature Requests**: Create and track feature requests from clusters
6. **Upgrade**: Subscribe to Pro for $100/month to unlock Search and Insights

## Security Features

- Row Level Security (RLS) enabled on all tables
- User isolation - each user only sees their own data
- Protected API routes with authentication checks
- Pro feature gating based on subscription status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 