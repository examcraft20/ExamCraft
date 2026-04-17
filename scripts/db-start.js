#!/usr/bin/env node

/**
 * Script to start Supabase database via Docker
 * Usage: pnpm db:start
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting ExamCraft Supabase Database via Docker...\n');

try {
  // Check if Docker is running
  console.log('📦 Checking Docker status...');
  execSync('docker info', { stdio: 'pipe' });
  console.log('✅ Docker is running\n');

  // Check if containers are already running
  try {
    const status = execSync('docker compose ps --format json', { 
      cwd: __dirname,
      encoding: 'utf-8'
    });
    
    const containers = JSON.parse(status);
    if (Array.isArray(containers) && containers.length > 0) {
      console.log('⚠️  Database containers are already running!\n');
      console.log('📊 Current containers:');
      containers.forEach(c => {
        console.log(`   - ${c.Service}: ${c.State}`);
      });
      console.log('\n💡 To restart, run: pnpm db:restart');
      process.exit(0);
    }
  } catch (e) {
    // Containers not running, continue
  }

  // Start database services
  console.log('🔧 Starting database services...\n');
  execSync('docker compose up -d', { 
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\n✅ Database services started!\n');
  console.log('📊 Service URLs:');
  console.log('   - Supabase API Gateway: http://localhost:54321');
  console.log('   - Supabase Studio:      http://localhost:54323');
  console.log('   - PostgreSQL:           localhost:54322');
  console.log('   - Auth Service:         http://localhost:9999');
  console.log('\n🎯 Next steps:');
  console.log('   1. Wait 10-15 seconds for services to initialize');
  console.log('   2. Run: pnpm db:migrate (apply database migrations)');
  console.log('   3. Run: pnpm seed (seed test data)');
  console.log('   4. Run: pnpm dev (start application)\n');
  console.log('💡 Useful commands:');
  console.log('   - pnpm db:status    - Check database status');
  console.log('   - pnpm db:stop      - Stop database');
  console.log('   - pnpm db:restart   - Restart database');
  console.log('   - pnpm db:logs      - View database logs');
  console.log('   - pnpm db:reset     - Reset database (WARNING: deletes all data)\n');

} catch (error) {
  console.error('\n❌ Failed to start database:');
  console.error(error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure Docker Desktop is installed and running');
  console.error('   2. Download: https://www.docker.com/products/docker-desktop');
  console.error('   3. Check Docker is running: docker info');
  console.error('   4. Then try again: pnpm db:start\n');
  process.exit(1);
}
