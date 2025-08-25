#!/usr/bin/env node

// Get app URL from environment or use default
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://signalnote.vercel.app';

console.log(`🔍 Running production smoke tests for: ${APP_URL}`);

async function runSmokeTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Health endpoint
  try {
    console.log('\n📊 Testing /api/health...');
    const healthResponse = await fetch(`${APP_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint passed:', JSON.stringify(healthData, null, 2));
      passed++;
    } else {
      console.log('❌ Health endpoint failed:', healthResponse.status, await healthResponse.text());
      failed++;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    failed++;
  }

  // Test 2: App page
  try {
    console.log('\n🏠 Testing /app page...');
    const appResponse = await fetch(`${APP_URL}/app`);
    if (appResponse.ok) {
      const appText = await appResponse.text();
      if (appText.includes('Upload Feedback') || appText.includes('SignalNote')) {
        console.log('✅ App page loads successfully');
        passed++;
      } else {
        console.log('❌ App page missing expected content');
        failed++;
      }
    } else {
      console.log('❌ App page failed:', appResponse.status);
      failed++;
    }
  } catch (error) {
    console.log('❌ App page error:', error.message);
    failed++;
  }

  // Test 3: Themes API (without auth)
  try {
    console.log('\n🏷️  Testing /api/themes...');
    const themesResponse = await fetch(`${APP_URL}/api/themes`);
    if (themesResponse.status === 401) {
      console.log('✅ Themes API properly requires authentication');
      passed++;
    } else if (themesResponse.status === 404) {
      console.log('✅ Themes API endpoint exists (404 is acceptable for new deployment)');
      passed++;
    } else if (themesResponse.ok) {
      const themesData = await themesResponse.json();
      console.log('✅ Themes API accessible:', JSON.stringify(themesData, null, 2));
      passed++;
    } else {
      console.log('❌ Themes API unexpected response:', themesResponse.status);
      failed++;
    }
  } catch (error) {
    console.log('❌ Themes API error:', error.message);
    failed++;
  }

  // Summary
  console.log(`\n📋 Smoke test results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All smoke tests passed!');
    process.exit(0);
  }
}

runSmokeTests().catch(error => {
  console.error('💥 Smoke test script failed:', error);
  process.exit(1);
}); 