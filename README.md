# SignalNote v1 - Customer Feedback Analysis

Turn customer feedback into actionable insights with AI-powered analysis and intelligent theme discovery.

## 🚀 **Quick Start**

### Prerequisites
- Node.js 20+
- Supabase account
- OpenAI API key (optional - fallback analysis available)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd SignalNote
npm install
```

### 2. Environment Setup
```bash
cp env.local.example .env.local
```

Fill in your environment variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Run the Supabase migration
npx supabase db push

# Add missing tables for v1
npx supabase db push --file supabase/create-missing-tables.sql
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌟 **v1 Features**

### Core Functionality
- **Authentication**: Supabase Auth with email magic links
- **CSV Upload**: Upload feedback with validation (required: "text", optional: "source", "created_at")
- **AI Analysis**: Sentiment (0-100), urgency (low/medium/high), themes, action suggestions
- **Explore**: Filter and search analyzed results with export to CSV
- **Themes**: Discover patterns with counts and example quotes each
- **Demo Mode**: Try the app without database access

### CSV Schema
Your CSV must contain:
- `text` (required): The feedback content (max 1000 chars)
- `source` (optional): Source of the feedback
- `created_at` (optional): ISO date string

### Limits
- Text length: 1000 characters max
- Batch size: 5 items processed simultaneously
- Fallback analysis: Available when OpenAI key is missing

## 🏗️ **Architecture**

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini with fallback analysis
- **Authentication**: Supabase Auth with magic links
- **Database**: PostgreSQL with Row-Level Security (RLS)

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (all Node.js runtime)
│   ├── app/            # Main app with three tabs
│   │   ├── UploadTab   # CSV upload and validation
│   │   ├── ExploreTab  # Results table with filters
│   │   └── ThemesTab   # Theme discovery
│   ├── demo/           # No-DB demo mode
│   └── auth/           # Authentication flows
├── components/         # Reusable UI components
├── lib/               # Utility functions and clients
└── supabase/          # Database schema and migrations
```

## 🧪 **Testing**

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript checks
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests (Playwright)
```

## 🚀 **Deployment**

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## 🔧 **Development**

### Adding New Features
1. Create database migration in `supabase/`
2. Add API endpoints in `src/app/api/`
3. Create UI components in `src/components/`
4. Add tests and update documentation

### Database Changes
```bash
# Create new migration
npx supabase db diff --file supabase/new-feature.sql

# Apply migration
npx supabase db push --file supabase/new-feature.sql
```

## 🐛 **Troubleshooting**

### Common Issues
- **Build fails**: Ensure all API routes have `export const runtime = "nodejs"`
- **Database errors**: Run `supabase/create-missing-tables.sql` first
- **OpenAI errors**: App works without API key (uses fallback analysis)

### Performance
- Batch processing limited to 5 items for v1
- Consider Redis for job queues in production
- Implement caching for analysis results

## 📚 **Resources**

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 📄 **License**

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**SignalNote v1 - Ready for production use! 🎉** 