#!/usr/bin/env node

/**
 * Simple smoke test for SignalNote
 * Run with: node test-smoke.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

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
    return { success: true, data, status: response.status }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runSmokeTests() {
  console.log('🚀 Running SignalNote Smoke Tests...\n')

  // Test public endpoints
  console.log('Testing public endpoints...')
  await testEndpoint('/')
  await testEndpoint('/login')
  
  // Test API endpoints (should return 401 without auth)
  console.log('\nTesting API endpoints (expected: 401 unauthorized)...')
  await testEndpoint('/api/feedback', 'POST', { content: 'test', source: 'test' })
  await testEndpoint('/api/search', 'POST', { q: 'test' })
  await testEndpoint('/api/insights/cluster', 'POST')
  await testEndpoint('/api/feature-requests', 'POST', { title: 'test' })
  await testEndpoint('/api/stripe/create-checkout', 'POST')

  console.log('\n🎯 Smoke tests completed!')
  console.log('\nNext steps:')
  console.log('1. Set up your environment variables')
  console.log('2. Run the Supabase SQL migration')
  console.log('3. Start the dev server: npm run dev')
  console.log('4. Sign up and test the full flow')
}

runSmokeTests().catch(console.error) 