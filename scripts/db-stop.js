#!/usr/bin/env node

/**
 * Script to stop Supabase database
 * Usage: pnpm db:stop
 */

const { execSync } = require('child_process');

console.log('🛑 Stopping ExamCraft Supabase Database...\n');

try {
  execSync('docker compose down', { 
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\n✅ Database stopped successfully!\n');
  console.log('💡 Data is preserved. To start again, run: pnpm db:start\n');

} catch (error) {
  console.error('\n❌ Failed to stop database:', error.message);
  process.exit(1);
}
