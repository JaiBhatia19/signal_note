#!/usr/bin/env node

/**
 * SignalNote Health Check Script
 * 
 * This script checks if all the basic services are working
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

console.log('🏥 SignalNote Health Check');
console.log('==========================\n');

// Check if dev server is running
async function checkDevServer() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:3001', { method: 'GET' }, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Development server: RUNNING (http://localhost:3001)');
        resolve(true);
      } else {
        console.log(`❌ Development server: ERROR (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Development server: NOT RUNNING');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Development server: TIMEOUT');
      resolve(false);
    });
    
    req.end();
  });
}

// Check environment variables from .env.local
function checkEnvVars() {
  console.log('\n🔧 Environment Variables Check:');
  console.log('==============================');
  
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_PRICE_ID',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_APP_URL'
    ];
    
    let allSet = true;
    
    requiredVars.forEach(varName => {
      if (envVars[varName] && envVars[varName] !== '') {
        const value = envVars[varName];
        const displayValue = varName.includes('KEY') || varName.includes('SECRET') 
          ? `${value.substring(0, 10)}...` 
          : value;
        console.log(`✅ ${varName}: ${displayValue}`);
      } else {
        console.log(`❌ ${varName}: NOT SET`);
        allSet = false;
      }
    });
    
    return allSet;
  } catch (error) {
    console.log('❌ .env.local file not found or cannot be read');
    return false;
  }
}

// Check Supabase connection
async function checkSupabase() {
  return new Promise((resolve) => {
    try {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const supabaseUrl = envContent.split('\n').find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
      
      if (!supabaseUrl) {
        console.log('\n❌ Supabase: CANNOT CHECK (URL not set)');
        resolve(false);
        return;
      }
      
      const url = new URL(supabaseUrl.split('=')[1]);
      const req = https.request(url, { method: 'GET' }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log('✅ Supabase: CONNECTED');
          resolve(true);
        } else {
          console.log(`❌ Supabase: ERROR (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
      
      req.on('error', () => {
        console.log('❌ Supabase: CONNECTION FAILED');
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        console.log('❌ Supabase: TIMEOUT');
        resolve(false);
      });
      
      req.end();
    } catch (error) {
      console.log('\n❌ Supabase: CANNOT CHECK (error reading .env.local)');
      resolve(false);
    }
  });
}

// Main health check
async function runHealthCheck() {
  console.log('Starting health check...\n');
  
  const devServerOk = await checkDevServer();
  const envVarsOk = checkEnvVars();
  const supabaseOk = await checkSupabase();
  
  console.log('\n📊 Health Check Summary:');
  console.log('========================');
  console.log(`Development Server: ${devServerOk ? '✅' : '❌'}`);
  console.log(`Environment Variables: ${envVarsOk ? '✅' : '❌'}`);
  console.log(`Supabase Connection: ${supabaseOk ? '✅' : '❌'}`);
  
  if (devServerOk && envVarsOk && supabaseOk) {
    console.log('\n🎉 All systems are healthy! Ready for testing.');
  } else {
    console.log('\n⚠️  Some issues detected. Please fix them before testing.');
    
    if (!devServerOk) {
      console.log('→ Start the development server: npm run dev');
    }
    
    if (!envVarsOk) {
      console.log('→ Check your .env.local file for missing variables');
    }
    
    if (!supabaseOk) {
      console.log('→ Verify your Supabase configuration');
    }
  }
  
  console.log('\n🔍 Next steps:');
  console.log('1. Fix any issues above');
  console.log('2. Run: node test-features.js');
  console.log('3. Open http://localhost:3000 in your browser');
}

// Run health check
runHealthCheck(); 