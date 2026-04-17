#!/usr/bin/env node

/**
 * Script to apply database migrations
 * Usage: pnpm db:migrate
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Applying database migrations...\n');

try {
  // Check if database is running
  console.log('📦 Checking database status...');
  execSync('docker compose ps db --format json', { 
    cwd: __dirname,
    stdio: 'pipe'
  });

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    throw new Error('Migrations directory not found: supabase/migrations');
  }

  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    console.log('⚠️  No migration files found in supabase/migrations\n');
    process.exit(0);
  }

  console.log(`📝 Found ${migrations.length} migration(s)\n`);

  // Apply migrations using psql
  for (const migration of migrations) {
    console.log(`📄 Applying: ${migration}`);
    
    const migrationPath = path.join(migrationsDir, migration);
    
    try {
      execSync(
        `docker exec -i examcraft-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/migrations/${migration}`,
        { stdio: 'pipe' }
      );
      console.log(`   ✅ ${migration} applied successfully`);
    } catch (error) {
      console.error(`   ❌ Failed to apply ${migration}`);
      console.error(`   Error: ${error.message}`);
      console.error('\n💡 You may need to fix the migration and run: pnpm db:migrate\n');
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations applied successfully!\n');
  console.log('🎯 Next step: Run "pnpm seed" to populate test data\n');

} catch (error) {
  console.error('\n❌ Failed to apply migrations:');
  console.error(error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure database is running: pnpm db:status');
  console.error('   2. Start database: pnpm db:start');
  console.error('   3. Then try again: pnpm db:migrate\n');
  process.exit(1);
}
