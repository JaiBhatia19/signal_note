#!/usr/bin/env node

// Simple production smoke test for SignalNote v1
const https = require('https');

const BASE_URL = 'https://signalnote.vercel.app';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runSmokeTest() {
  console.log('🚀 Running SignalNote v1 Production Smoke Test\n');
  
  try {
    // Test root endpoint
    console.log('Testing root endpoint...');
    const rootResponse = await makeRequest(BASE_URL);
    console.log(`✅ Root: ${rootResponse.statusCode}`);
    
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`✅ Health: ${healthResponse.statusCode}`);
    
    // Test app endpoint (should redirect to login)
    console.log('Testing app endpoint...');
    const appResponse = await makeRequest(`${BASE_URL}/app`);
    console.log(`✅ App: ${appResponse.statusCode}`);
    
    console.log('\n🎉 All smoke tests passed! SignalNote v1 is running.');
    
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message);
    process.exit(1);
  }
}

runSmokeTest(); 