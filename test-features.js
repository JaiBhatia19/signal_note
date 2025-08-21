#!/usr/bin/env node

/**
 * SignalNote Feature Test Script
 * 
 * This script helps test all the free and pro features locally
 * Run this after setting up your environment variables
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SignalNote Feature Test Script');
console.log('================================\n');

console.log('📋 Pre-Test Checklist:');
console.log('1. ✅ Development server running (npm run dev)');
console.log('2. ✅ .env.local configured with:');
console.log('   - OPENAI_API_KEY (your actual key)');
console.log('   - NEXT_PUBLIC_APP_URL=http://localhost:3001');
console.log('3. ✅ Supabase database running');
console.log('4. ✅ Stripe test keys configured\n');

console.log('🧪 Test Plan:');
console.log('=============');
console.log('');

console.log('🔓 FREE FEATURES:');
console.log('1. User registration/login');
console.log('2. Add customer feedback');
console.log('3. View dashboard with feedback stats');
console.log('4. Basic feedback storage');

console.log('\n💎 PRO FEATURES:');
console.log('1. Semantic search across feedback');
console.log('2. AI-powered clustering and insights');
console.log('3. Stripe subscription upgrade');
console.log('4. Advanced analytics');

console.log('\n📱 Manual Testing Steps:');
console.log('=======================');
console.log('');

console.log('1. Open http://localhost:3001 in your browser');
console.log('2. Click "Get Started Free" or "Sign In"');
console.log('3. Create a new account or sign in');
console.log('4. Test adding feedback (should work for free users)');
console.log('5. Try to access /search or /insights (should redirect to upgrade)');
console.log('6. Go to /settings and test Stripe upgrade flow');
console.log('7. After upgrade, test pro features');

console.log('\n🔍 API Endpoints to Test:');
console.log('========================');
console.log('POST /api/feedback - Add feedback (Free)');
console.log('GET  /api/feedback - Get feedback (Free)');
console.log('POST /api/search - Semantic search (Pro)');
console.log('POST /api/insights/cluster - AI clustering (Pro)');
console.log('POST /api/stripe/create-checkout - Upgrade to Pro');

console.log('\n⚠️  Common Issues & Solutions:');
console.log('==============================');
console.log('');

console.log('❌ "OpenAI API key not set"');
console.log('   → Add OPENAI_API_KEY to .env.local');
console.log('');

console.log('❌ "Stripe redirect failed"');
console.log('   → Set NEXT_PUBLIC_APP_URL=http://localhost:3001');
console.log('');

console.log('❌ "Database connection failed"');
console.log('   → Check Supabase URL and keys in .env.local');
console.log('');

console.log('❌ "Authentication failed"');
console.log('   → Check Supabase configuration and database schema');
console.log('');

console.log('🎯 Ready to test? Open http://localhost:3001 in your browser!');
console.log('');

rl.question('Press Enter when you\'re ready to start testing...', () => {
  console.log('\n🚀 Happy testing! Check the browser console for any errors.');
  console.log('📧 If you encounter issues, check the terminal running npm run dev for server errors.');
  rl.close();
}); 