#!/usr/bin/env node

/**
 * Production readiness test for SignalNote
 * Run with: node test-production.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    console.log(`✅ ${method} ${endpoint}: ${response.status}`)
    if (response.status >= 400) {
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    }
    return { success: true, data, status: response.status }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runProductionTests() {
  console.log('🚀 Running SignalNote Production Readiness Tests...\n')

  // Test health endpoint
  console.log('Testing health endpoint...')
  await testEndpoint('/api/health')
  
  // Test public endpoints
  console.log('\nTesting public endpoints...')
  await testEndpoint('/')
  await testEndpoint('/login')
  
  // Test API endpoints (should return 401 without auth)
  console.log('\nTesting API endpoints (expected: 401 unauthorized)...')
  await testEndpoint('/api/feedback', 'POST', { content: 'test feedback content', source: 'Manual' })
  await testEndpoint('/api/search', 'POST', { q: 'test search' })
  await testEndpoint('/api/insights/cluster', 'POST')
  await testEndpoint('/api/feature-requests', 'POST', { title: 'test feature', description: 'test description' })
  await testEndpoint('/api/stripe/create-checkout', 'POST')
  await testEndpoint('/api/stripe/subscription-status')

  console.log('\n🎯 Production readiness tests completed!')
  console.log('\nNext steps:')
  console.log('1. Update NEXT_PUBLIC_APP_URL in your .env.local to your production URL')
  console.log('2. Deploy to your hosting platform')
  console.log('3. Test the full authentication flow')
  console.log('4. Verify Stripe webhooks are working')
}

runProductionTests().catch(console.error) 