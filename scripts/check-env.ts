import * as fs from 'fs'
import * as path from 'path'

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_API_URL',
]

const envPath = path.resolve(__dirname, '../apps/web/.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ apps/web/.env.local not found!')
  console.error('   Copy apps/web/.env.local.example and fill in values')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const missing: string[] = []

for (const key of required) {
  if (!envContent.includes(key + '=') || 
      envContent.includes(key + '=\n') ||
      envContent.includes(key + '=""')) {
    missing.push(key)
  }
}

if (missing.length > 0) {
  console.error('❌ Missing required env variables:')
  missing.forEach(k => console.error('   • ' + k))
  process.exit(1)
}

console.log('✅ All required env variables present')
