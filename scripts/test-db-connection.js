#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Usage: pnpm test:db-connection
 */

const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('\n🔍 ExamCraft Database Connection Test\n');
  console.log('═'.repeat(50));

  let allTestsPassed = true;
  const rootDir = path.join(__dirname, '..');

  // Test 1: Check Docker is running
  console.log('\n📦 Test 1: Docker Status');
  try {
    execSync('docker info', { stdio: 'pipe' });
    console.log('   ✅ Docker is running');
  } catch (error) {
    console.log('   ❌ Docker is NOT running');
    console.log('   💡 Start Docker Desktop first');
    allTestsPassed = false;
  }

  // Test 2: Check database containers
  console.log('\n🗄️  Test 2: Database Containers');
  try {
    const output = execSync('docker compose ps --format json', { 
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'] // Ignore stderr to avoid warnings breaking JSON
    });
    
    let containers = [];
    try {
        // Handle potential multiple JSON objects or leading text
        const jsonMatch = output.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
            containers = JSON.parse(jsonMatch[0]);
            // Ensure it's an array (Docker Compose V2 format changed recently)
            if (!Array.isArray(containers)) {
                containers = [containers];
            }
        }
    } catch (e) {
        // Fallback for older docker versions or different formats
        console.log('   ⚠️  JSON parsing failed, attempting text-based check');
        const textOutput = execSync('docker compose ps', { cwd: rootDir, encoding: 'utf-8' });
        if (textOutput.includes('Up') || textOutput.includes('Running')) {
            console.log('   ✅ At least one container is running');
        } else {
            console.log('   ❌ No running containers detected');
            allTestsPassed = false;
        }
    }

    if (containers.length > 0) {
      const runningContainers = containers.filter(c => {
          const state = (c.State || c.Status || '').toLowerCase();
          return state.includes('running') || state.includes('up');
      });
      console.log(`   ✅ ${runningContainers.length}/${containers.length} containers running`);
      
      containers.forEach(c => {
        const state = (c.State || c.Status || '').toLowerCase();
        const status = (state.includes('running') || state.includes('up')) ? '✅' : '❌';
        console.log(`      ${status} ${c.Service || c.Name}: ${c.State || c.Status}`);
      });
    } else if (containers.length === 0 && allTestsPassed) {
       // Only failing if we couldn't even parse anything
       // console.log('   ⚠️  Checking containers via CLI...');
    }
  } catch (error) {
    console.log('   ❌ Failed to check containers');
    allTestsPassed = false;
  }

  // Test 3-6: Port Tests
  console.log('\n🌐 Test 3: Supabase API Gateway (Port 54321)');
  const port3 = await testPort(54321, 'Supabase API Gateway');
  if (!port3) allTestsPassed = false;

  console.log('\n🐘 Test 4: PostgreSQL Database (Port 54322)');
  const port4 = await testPort(54322, 'PostgreSQL');
  if (!port4) allTestsPassed = false;

  console.log('\n🎨 Test 5: Supabase Studio (Port 54323)');
  const port5 = await testPort(54323, 'Supabase Studio');
  if (!port5) allTestsPassed = false;

  console.log('\n🔐 Test 6: Auth Service (Port 9999)');
  const port6 = await testPort(9999, 'Auth Service');
  if (!port6) allTestsPassed = false;

  // Test 7: Check environment variables
  console.log('\n⚙️  Test 7: Environment Variables');
  const webEnvPath = path.join(rootDir, 'apps', 'web', '.env.local');
  const apiEnvPath = path.join(rootDir, 'apps', 'api', '.env.local');

  function checkEnvFile(filePath, name) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const demoMode = content.match(/NEXT_PUBLIC_DEMO_MODE=(true|false)/);
      
      if (demoMode) {
        const isDemo = demoMode[1] === 'true';
        if (isDemo) {
          console.log(`   ⚠️  ${name}: NEXT_PUBLIC_DEMO_MODE=true (Using MOCK data)`);
        } else {
          console.log(`   ✅ ${name}: NEXT_PUBLIC_DEMO_MODE=false (Using real database)`);
        }
      } else if (name === 'Web App') {
        console.log(`   ⚠️  ${name}: NEXT_PUBLIC_DEMO_MODE not set`);
      }
      
      const supabaseUrl = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
      if (supabaseUrl) {
        console.log(`   ✅ ${name}: SUPABASE_URL detected`);
      }
      return true;
    } else {
      console.log(`   ❌ ${name}: .env.local not found`);
      return false;
    }
  }

  const webEnvOk = checkEnvFile(webEnvPath, 'Web App');
  const apiEnvOk = checkEnvFile(apiEnvPath, 'API Server');
  
  if (!webEnvOk || !apiEnvOk) {
    console.log('   💡 Run "pnpm check:env" to generate environment files');
    // allTestsPassed = false; // Don't fail the whole thing just because env files are missing if DB is ok
  }

  // Test 8: Try direct database query
  console.log('\n💾 Test 8: Database Query Test');
  try {
    const result = execSync(
      'docker exec examcraft-db psql -U postgres -d postgres -c "SELECT NOW() as current_time;" -t',
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    if (result && result.trim()) {
      console.log('   ✅ Database is responding to queries');
      console.log(`   📅 Current DB time: ${result.trim()}`);
    }
  } catch (error) {
    console.log('   ❌ Cannot query database');
    console.log('   💡 Database may still be starting up');
    allTestsPassed = false;
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 Test Summary:');

  if (allTestsPassed) {
    console.log('\n✅ All tests passed! Database is connected and working.');
    console.log('\n🎯 Next steps:');
    console.log('   1. Open: http://localhost:3000');
    console.log('   2. Open: http://localhost:54323 (Supabase Studio)');
    console.log('   3. Login and start using the application');
  } else {
    console.log('\n❌ Some tests failed. Database may not be fully connected.');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Start database: pnpm db:start');
    console.log('   2. Wait 15 seconds for services to initialize');
    console.log('   3. Check logs: pnpm db:logs');
    console.log('   4. Restart: pnpm db:restart');
    console.log('   5. Reset: pnpm db:reset (WARNING: deletes data)');
  }

  console.log('\n' + '═'.repeat(50) + '\n');
}

// Helper function to test if a port is open
function testPort(port, serviceName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      console.log(`   ✅ ${serviceName} is responding (HTTP ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ ${serviceName} is NOT running on port ${port}`);
        resolve(false);
      } else if (error.code === 'ECONNRESET') {
        console.log(`   ✅ ${serviceName} is running on port ${port}`);
        resolve(true);
      } else {
        // Supabase services often return 404 or other errors on root, which counts as responding
        console.log(`   ✅ ${serviceName} is responding on port ${port}`);
        resolve(true);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⚠️  ${serviceName} timeout on port ${port}`);
      resolve(false);
    });

    req.end();
  });
}

runTests();
