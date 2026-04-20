import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Load environment variables - check both locations
const rootEnvPath = path.resolve(process.cwd(), '.env.local');
const webEnvPath = path.resolve(process.cwd(), 'apps/web/.env.local');

if (fs.existsSync(webEnvPath)) {
  dotenv.config({ path: webEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================
// PART 1: CLEAR ALL DATA (Preserve Structure)
// ============================================

async function clearAllData() {
  console.log('\n🗑️  Clearing all data...\n');

  const deletionOrder = [
    'institution_papers',
    'institution_questions',
    'institution_templates',
    'institution_subjects',
    'institution_terms',
    'institution_courses',
    'institution_departments',
    'institution_campuses',
    'invitations',
    'institution_user_roles',
    'institution_users',
    'institution_audit_logs',
    'institutions',
  ];

  for (const table of deletionOrder) {
    try {
      const { error } = await supabase.from(table).delete().gt('created_at', '1900-01-01T00:00:00Z');
      if (error && !error.message.includes('Could not find')) {
        console.warn(`⚠️  Could not clear ${table}: ${error.message}`);
      } else if (!error) {
        console.log(`✓ Cleared ${table}`);
      }
    } catch (err) {
      // Silently skip
    }
  }

  // Delete test auth users
  try {
    const { data: usersResult } = await supabase.auth.admin.listUsers();
    const users = usersResult?.users || [];
    const testUsers = (users as any[]).filter((u: any) => u.email?.includes('@examcraft-test.com')) || [];

    for (const user of testUsers) {
      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (err) {
        // Skip
      }
    }
    console.log(`✓ Deleted ${testUsers.length} test auth users`);
  } catch (err) {
    console.warn('⚠️  Could not cleanup auth users');
  }

  console.log('✓ Data cleared\n');
}

// ============================================
// PART 2: SEED TESTING DATA
// ============================================

async function createSuperAdmin() {
  console.log('👤 Creating Super Admin...');
  const email = 'superadmin@examcraft-test.com';
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'TestPass@123',
    email_confirm: true,
    user_metadata: { full_name: 'Super Admin' },
    app_metadata: { 
      role: 'super_admin',
      roles: ['super_admin'],
      isSuperAdmin: true 
    },
  });

  if (error && error.code !== 'email_exists') throw error;
  
  let userId = data?.user?.id;
  if (error?.code === 'email_exists') {
    const { data: usersResult } = await supabase.auth.admin.listUsers();
    userId = (usersResult?.users as any[]).find((u: any) => u.email === email)?.id;
    console.log('✓ Super Admin already exists');
  } else {
    console.log('✓ Super Admin created:', userId);
  }
  return userId;
}

async function createInstitutions() {
  console.log('\n🏛️  Creating Institutions...');
  const institutions = [
    {
      name: 'Delhi Technical College',
      slug: 'delhi-technical-college',
      institution_type: 'college',
      status: 'active',
    },
    {
      name: 'Bright Minds Tuition Center',
      slug: 'bright-minds-tuition',
      institution_type: 'tuition_center',
      status: 'active',
    },
    {
      name: 'Sunrise Academy',
      slug: 'sunrise-academy',
      institution_type: 'coaching_institute',
      status: 'active',
    },
  ];

  const created = [];
  for (const inst of institutions) {
    const { data, error } = await supabase.from('institutions').insert(inst).select().single();
    if (error) throw error;
    console.log(`✓ Created institution: ${inst.name}`);
    created.push(data);
  }
  return created;
}

async function createUsersPerInstitution(institutions: any[]) {
  console.log('\n👥 Creating Institution Users...');
  const userConfigs: any = {
    'delhi-technical-college': [
      { email: 'admin.dtc@examcraft-test.com', role: 'institution_admin', name: 'Rajesh Kumar' },
      { email: 'head.dtc@examcraft-test.com', role: 'academic_head', name: 'Dr. Priya Sharma' },
      { email: 'faculty1.dtc@examcraft-test.com', role: 'faculty', name: 'Amit Verma' },
      { email: 'reviewer.dtc@examcraft-test.com', role: 'reviewer_approver', name: 'Prof. Arun Mehta' },
    ],
    'bright-minds-tuition': [
      { email: 'admin.bmt@examcraft-test.com', role: 'institution_admin', name: 'Neha Joshi' },
      { email: 'faculty.bmt@examcraft-test.com', role: 'faculty', name: 'Rohit Singh' },
    ],
    'sunrise-academy': [
      { email: 'admin.sa@examcraft-test.com', role: 'institution_admin', name: 'Vikram Nair' },
    ]
  };

  for (const inst of institutions) {
    const configs = userConfigs[inst.slug] || [];
    for (const config of configs) {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: config.email,
        password: 'TestPass@123',
        email_confirm: true,
        user_metadata: { full_name: config.name },
        app_metadata: { 
          role: config.role,
          roles: [config.role],
          isSuperAdmin: false 
        },
      });

      if (authError && authError.code !== 'email_exists') throw authError;
      
      let userId = authData?.user?.id;
      if (authError?.code === 'email_exists') {
        const { data: usersResult } = await supabase.auth.admin.listUsers();
        userId = (usersResult?.users as any[]).find((u: any) => u.email === config.email)?.id;
      }

      // 2. Create Institution User record
      const { data: iuData, error: iuError } = await supabase.from('institution_users').insert({
        institution_id: inst.id,
        user_id: userId,
        display_name: config.name,
        status: 'active',
        joined_at: new Date().toISOString()
      }).select().single();

      if (iuError) throw iuError;

      // 3. Assign Role
      const { data: roleData, error: roleSearchErr } = await supabase.from('roles').select('id').eq('code', config.role).single();
      if (roleSearchErr || !roleData) {
        console.warn(`⚠️  Could not find role ${config.role}: ${roleSearchErr?.message}`);
        continue;
      }

      const { error: roleAssignErr } = await supabase.from('institution_user_roles').insert({
        institution_user_id: iuData.id,
        role_id: roleData.id
      });
      
      if (roleAssignErr) {
        console.error(`❌ Role assignment failed for ${config.email}:`, roleAssignErr.message);
      } else {
        console.log(`✓ Seeded user: ${config.email} as ${config.role}`);
      }
    }
  }
}

async function getOrCreate(table: string, match: any, data: any) {
  const { data: existing } = await supabase.from(table).select('id').match(match).maybeSingle();
  if (existing) {
    console.log(`  ✓ Found existing ${table}: ${existing.id}`);
    return existing;
  }
  const { data: created, error } = await supabase.from(table).insert([{ ...match, ...data }]).select().single();
  if (error) {
    console.error(`  ❌ Error creating ${table}:`, error.message);
    throw error;
  }
  console.log(`  ✓ Created ${table}: ${created.id}`);
  return created;
}

async function createAcademicStructure(institutions: any[]) {
  const dtc = institutions.find(i => i.slug === 'delhi-technical-college');
  if (!dtc) return;
  console.log(`\n📚 Seeding Academic Structure for DTC (${dtc.slug})...`);
  
  try {
    // 1. Department
    const dept = await getOrCreate('institution_departments', 
      { institution_id: dtc.id, code: 'CSE' }, 
      { name: 'Computer Science Engineering' }
    );

    // 2. Course
    const course = await getOrCreate('institution_courses', 
      { institution_id: dtc.id, code: 'BTECH-CS' }, 
      { department_id: dept.id, name: 'Bachelor of Technology (CS)' }
    );

    // 3. Batch
    const batch = await getOrCreate('institution_batches', 
      { institution_id: dtc.id, course_id: course.id, code: '2024-A' }, 
      { name: 'Batch 2024 Section A', academic_year: '2024-2025', semester: 4 }
    );

    // 4. Subjects
    const subConfigs = [
      { name: 'Data Structures', code: 'DS101' },
      { name: 'Design & Analysis of Algorithms', code: 'ALGO201' },
      { name: 'Database Management Systems', code: 'DBMS301' },
      { name: 'Operating Systems', code: 'OS401' },
      { name: 'Computer Networks', code: 'NW501' }
    ];

    for (const s of subConfigs) {
      await getOrCreate('institution_subjects', 
        { institution_id: dtc.id, code: s.code }, 
        { name: s.name, department_id: dept.id, course_id: course.id }
      );
    }

    console.log('✓ Academic structure seeded successfully');
  } catch (err: any) {
    console.error('❌ SEED ACADEMIC ERROR:', err.message);
    throw err;
  }
}

async function main() {
  try {
    console.log('🌱 Starting Production-Ready Seed...');
    await clearAllData();
    await createSuperAdmin();
    const institutions = await createInstitutions();
    await createUsersPerInstitution(institutions);
    await createAcademicStructure(institutions);
    console.log('\n✅ SEED COMPLETE.');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ SEED FAILED:', err.message || err);
    process.exit(1);
  }
}

main();
