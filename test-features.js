#!/usr/bin/env node

/**
 * SignalNote v1 - Complete Feature Testing Script
 * Run this before posting on LinkedIn to ensure everything works!
 */

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://signalnote.vercel.app';

// Test data for CSV upload
const testCSV = `text,source,created_at
"This product is amazing! Love the new features.",email,2025-08-25
"The interface is confusing and needs improvement.",support,2025-08-24
"Great customer service, but the app crashes sometimes.",app_store,2025-08-23
"Fast response time and helpful support team.",chat,2025-08-22
"The new update fixed all the bugs I reported.",email,2025-08-21`;

console.log('🚀 SignalNote v1 - Complete Feature Testing\n');

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Test 1: Landing Page
async function testLandingPage() {
  console.log('1️⃣ Testing Landing Page...');
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    if (response.status === 200) {
      console.log('   ✅ Landing page loads successfully');
      if (response.data.includes('SignalNote')) {
        console.log('   ✅ App title and branding visible');
      }
    } else {
      console.log(`   ❌ Landing page failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Landing page error: ${error.message}`);
  }
}

// Test 2: Demo Page
async function testDemoPage() {
  console.log('\n2️⃣ Testing Demo Page...');
  try {
    const response = await makeRequest(`${BASE_URL}/demo`);
    if (response.status === 200) {
      console.log('   ✅ Demo page loads successfully');
      if (response.data.includes('demo')) {
        console.log('   ✅ Demo functionality accessible');
      }
    } else {
      console.log(`   ❌ Demo page failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Demo page error: ${error.message}`);
  }
}

// Test 3: Health API
async function testHealthAPI() {
  console.log('\n3️⃣ Testing Health API...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    if (response.status === 200) {
      console.log('   ✅ Health API working');
      const healthData = JSON.parse(response.data);
      if (healthData.ok) {
        console.log('   ✅ All services configured');
        console.log(`   ✅ Environment: ${healthData.envs.length} env vars set`);
      }
    } else {
      console.log(`   ❌ Health API failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Health API error: ${error.message}`);
  }
}

// Test 4: Login Page
async function testLoginPage() {
  console.log('\n4️⃣ Testing Login Page...');
  try {
    const response = await makeRequest(`${BASE_URL}/login`);
    if (response.status === 200) {
      console.log('   ✅ Login page loads successfully');
      if (response.data.includes('login') || response.data.includes('email')) {
        console.log('   ✅ Login form accessible');
      }
    } else {
      console.log(`   ❌ Login page failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Login page error: ${error.message}`);
  }
}

// Test 5: App Routes (Protected)
async function testAppRoutes() {
  console.log('\n5️⃣ Testing App Routes (Protected)...');
  const routes = ['/app', '/dashboard', '/feedback', '/insights'];
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route}`);
      if (response.status === 200) {
        console.log(`   ✅ ${route} loads (may redirect to login)`);
      } else if (response.status === 302 || response.status === 401) {
        console.log(`   ✅ ${route} properly protected (${response.status})`);
      } else {
        console.log(`   ⚠️  ${route} unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${route} error: ${error.message}`);
    }
  }
}

// Test 6: Static Assets
async function testStaticAssets() {
  console.log('\n6️⃣ Testing Static Assets...');
  try {
    const response = await makeRequest(`${BASE_URL}/favicon.ico`);
    if (response.status === 200) {
      console.log('   ✅ Favicon loads');
    } else {
      console.log(`   ⚠️  Favicon status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Static assets error: ${error.message}`);
  }
}

// Test 7: Performance Check
async function testPerformance() {
  console.log('\n7️⃣ Testing Performance...');
  const start = Date.now();
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const loadTime = Date.now() - start;
    if (loadTime < 2000) {
      console.log(`   ✅ Fast load time: ${loadTime}ms`);
    } else if (loadTime < 5000) {
      console.log(`   ⚠️  Moderate load time: ${loadTime}ms`);
    } else {
      console.log(`   ❌ Slow load time: ${loadTime}ms`);
    }
  } catch (error) {
    console.log(`   ❌ Performance test error: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive feature testing...\n');
  
  await testLandingPage();
  await testDemoPage();
  await testHealthAPI();
  await testLoginPage();
  await testAppRoutes();
  await testStaticAssets();
  await testPerformance();
  
  console.log('\n🎯 Manual Testing Required:');
  console.log('   • Open https://signalnote.vercel.app in browser');
  console.log('   • Test CSV upload with sample data');
  console.log('   • Verify AI analysis results');
  console.log('   • Test export functionality');
  console.log('   • Check responsive design on mobile');
  console.log('   • Test authentication flow');
  
  console.log('\n📝 Sample CSV for testing:');
  console.log('   Save this as test.csv and upload:');
  console.log(testCSV);
  
  console.log('\n🚀 Ready for LinkedIn post!');
}

// Run tests
runAllTests().catch(console.error); 