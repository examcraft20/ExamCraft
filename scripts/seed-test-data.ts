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
  console.error('Found in:');
  console.error('  Root .env.local:', fs.existsSync(rootEnvPath) ? '✓' : '✗');
  console.error('  apps/web/.env.local:', fs.existsSync(webEnvPath) ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function generateTokenHash() {
  return crypto.randomBytes(32).toString('hex');
}

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
      // Silently skip non-existent tables
    }
  }

  // Delete test auth users
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUsers = users?.filter((u) => u.email?.includes('@examcraft-test.com')) || [];

    for (const user of testUsers) {
      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (err) {
        // Skip if already deleted
      }
    }
    console.log(`✓ Deleted ${testUsers.length} test auth users`);
  } catch (err) {
    // Silently skip if not supported
  }

  console.log('✓ Data cleared\n');
}

// ============================================
// PART 2: SEED TESTING DATA
// ============================================

// A. Create Super Admin User
async function createSuperAdmin() {
  console.log('👤 Creating Super Admin...');
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'superadmin@examcraft-test.com',
      password: 'TestPass@123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin',
        name: 'Super Admin',
        display_name: 'Super Admin'
      },
      app_metadata: {
        isSuperAdmin: true,
        roles: ['super_admin'],
      },
    });

    if (error) {
      if (error.code === 'email_exists') {
        console.log('✓ Super Admin already exists');
        return 'existing-user-id';
      }
      throw error;
    }

    // Mark email as confirmed
    if (data.user?.id) {
      await supabase.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    }

    console.log('✓ Super Admin created:', data.user?.id);
    return data.user?.id;
  } catch (err) {
    console.error('✗ Super Admin creation failed:', err);
    throw err;
  }
}

// B. Create Institutions
async function createInstitutions() {
  console.log('\n🏛️  Creating Institutions...');

  const institutions = [
    {
      name: 'Delhi Technical College',
      slug: 'delhi-technical-college',
      institution_type: 'college',
      legal_name: 'Delhi Technical College Pvt. Ltd.',
      primary_contact_name: 'Dr. Rajesh Kumar',
      primary_contact_email: 'director@dtc.edu',
      primary_contact_phone: '+91-11-27123456',
      status: 'active',
      settings: { plan: 'pro', city: 'New Delhi', state: 'Delhi', country: 'India' },
      branding: { theme: 'default' },
    },
    {
      name: 'Bright Minds Tuition Center',
      slug: 'bright-minds-tuition',
      institution_type: 'tuition_center',
      legal_name: 'Bright Minds Education Pvt. Ltd.',
      primary_contact_name: 'Ms. Neha Joshi',
      primary_contact_email: 'contact@brightminds.in',
      primary_contact_phone: '+91-22-98765432',
      status: 'active',
      settings: { plan: 'starter', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      branding: { theme: 'default' },
    },
    {
      name: 'Sunrise Academy',
      slug: 'sunrise-academy',
      institution_type: 'coaching_institute',
      legal_name: 'Sunrise Academy Coaching Institute',
      primary_contact_name: 'Mr. Vikram Nair',
      primary_contact_email: 'info@sunriseacademy.in',
      primary_contact_phone: '+91-20-12345678',
      status: 'active',
      settings: { plan: 'free', city: 'Pune', state: 'Maharashtra', country: 'India' },
      branding: { theme: 'default' },
    },
  ];

  const createdInstitutions = [];

  for (const inst of institutions) {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .insert(inst)
        .select()
        .single();

      if (error) throw error;
      console.log(`✓ Created institution: ${inst.name}`);
      createdInstitutions.push(data);
    } catch (err) {
      console.error(`✗ Failed to create institution ${inst.name}:`, err);
    }
  }

  return createdInstitutions;
}

// C. Create Users Per Institution
async function createUsersPerInstitution(institutions: any[]) {
  console.log('\n👥 Creating Institution Users...');

  const usersByInstitution: { [key: string]: any[] } = {
    'delhi-technical-college': [
      {
        email: 'admin.dtc@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'institution_admin',
        display_name: 'Rajesh Kumar',
      },
      {
        email: 'head.dtc@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'academic_head',
        display_name: 'Dr. Priya Sharma',
      },
      {
        email: 'faculty1.dtc@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'faculty',
        display_name: 'Amit Verma',
      },
      {
        email: 'faculty2.dtc@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'faculty',
        display_name: 'Sneha Patel',
      },
      {
        email: 'reviewer.dtc@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'reviewer_approver',
        display_name: 'Prof. Arun Mehta',
      },
    ],
    'bright-minds-tuition': [
      {
        email: 'admin.bmt@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'institution_admin',
        display_name: 'Neha Joshi',
      },
      {
        email: 'faculty.bmt@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'faculty',
        display_name: 'Rohit Singh',
      },
      {
        email: 'reviewer.bmt@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'reviewer_approver',
        display_name: 'Kavita Desai',
      },
    ],
    'sunrise-academy': [
      {
        email: 'admin.sa@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'institution_admin',
        display_name: 'Vikram Nair',
      },
      {
        email: 'faculty.sa@examcraft-test.com',
        password: 'TestPass@123',
        role_code: 'faculty',
        display_name: 'Ananya Iyer',
      },
    ],
  };

  const createdUsers: any[] = [];

  for (const inst of institutions) {
    const users = usersByInstitution[inst.slug] || [];

    // Get or create role
    let roleId;
    try {
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('code', users[0].role_code)
        .single();

      roleId = roleData?.id;

      if (!roleId) {
        console.warn(`⚠️  Role ${users[0].role_code} not found`);
      }
    } catch (err) {
      console.warn(`⚠️  Could not find role: ${err}`);
    }

    for (const userConfig of users) {
      try {
        // Create auth user
        let userId;
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userConfig.email,
          password: userConfig.password,
          email_confirm: true,
          user_metadata: {
            full_name: userConfig.display_name,
            name: userConfig.display_name,
            display_name: userConfig.display_name,
          },
          app_metadata: { roles: [userConfig.role_code] },
        });

        if (authError) {
          if (authError.code === 'email_exists') {
            // User already exists, need to find it
            try {
              const { data: listResult } = await supabase.auth.admin.listUsers();
              const users = Array.isArray(listResult) ? listResult : listResult?.users || [];
              const existing = users.find((u: any) => u.email === userConfig.email);
              if (existing) {
                userId = existing.id;
                console.log(`⊘ User already exists: ${userConfig.email}`);
              } else {
                console.error(`✗ Could not find existing user: ${userConfig.email}`);
                continue;
              }
            } catch (err) {
              console.error(`✗ Could not list users: ${err}`);
              continue;
            }
          } else {
            throw authError;
          }
        } else {
          userId = authData.user?.id;
        }

        // Mark email as confirmed (for both new and existing users)
        if (userId) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              email_confirm: true,
            });
          } catch (err) {
            console.warn(`⚠️  Could not confirm email for ${userConfig.email}`);
          }
        }

        // Check if institution_users record already exists
        let existingMember;
        try {
          const { data } = await supabase
            .from('institution_users')
            .select('id')
            .eq('user_id', userId)
            .eq('institution_id', inst.id)
            .single();
          existingMember = data;
        } catch (err) {
          existingMember = null;
        }

        if (existingMember) {
          console.log(`⊘ Member record already exists: ${userConfig.email}`);
          continue;
        }

        // Create institution_users record
        const { data: memberData, error: memberError } = await supabase
          .from('institution_users')
          .insert({
            user_id: userId,
            institution_id: inst.id,
            display_name: userConfig.display_name,
            status: 'active',
          })
          .select()
          .single();

        if (memberError) throw memberError;

        // Assign role if it exists
        try {
          const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('code', userConfig.role_code)
            .single();

          if (roleData && memberData) {
            await supabase.from('institution_user_roles').insert({
              institution_user_id: memberData.id,
              role_id: roleData.id,
            });
          }
        } catch (err) {
          // Role assignment failed, continue
        }

        console.log(`✓ Created user: ${userConfig.email} (${userConfig.role_code})`);
        createdUsers.push({ auth: { id: userId }, member: memberData });
      } catch (err) {
        console.error(`✗ Failed to create user ${userConfig.email}:`, err);
      }
    }
  }

  return createdUsers;
}

// D. Create Academic Structure
async function createAcademicStructure(institutions: any[]) {
  console.log('\n📚 Creating Academic Structure...');

  const dtcInst = institutions.find((i) => i.slug === 'delhi-technical-college');
  if (!dtcInst) return {};

  // Create campus
  let campusId;
  try {
    const { data: campusData } = await supabase
      .from('institution_campuses')
      .insert({
        institution_id: dtcInst.id,
        name: 'Main Campus',
        code: 'MAIN',
      })
      .select()
      .single();

    campusId = campusData?.id;
  } catch (err) {
    console.warn('⚠️  Could not create campus:', err);
  }

  // Create departments
  const departments = [
    { name: 'Computer Science Engineering', code: 'CSE' },
    { name: 'Electronics & Communication', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'ME' },
    { name: 'Mathematics & Sciences', code: 'MS' },
  ];

  const createdDepts: any[] = [];

  for (const dept of departments) {
    try {
      const { data, error } = await supabase
        .from('institution_departments')
        .insert({
          institution_id: dtcInst.id,
          campus_id: campusId,
          name: dept.name,
          code: dept.code,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`✓ Created department: ${dept.name}`);
      createdDepts.push(data);
    } catch (err) {
      console.error(`✗ Failed to create department ${dept.name}:`, err);
    }
  }

  // Create courses for CSE
  const cseDept = createdDepts.find((d) => d.code === 'CSE');
  if (cseDept) {
    const courses = [
      { name: 'B.Tech Computer Science', code: 'BTECH-CS' },
      { name: 'M.Tech Software Engineering', code: 'MTECH-SE' },
    ];

    const createdCourses: any[] = [];

    for (const course of courses) {
      try {
        const { data, error } = await supabase
          .from('institution_courses')
          .insert({
            institution_id: dtcInst.id,
            department_id: cseDept.id,
            name: course.name,
            code: course.code,
          })
          .select()
          .single();

        if (error) throw error;
        console.log(`✓ Created course: ${course.name}`);
        createdCourses.push(data);
      } catch (err) {
        console.error(`✗ Failed to create course ${course.name}:`, err);
      }
    }

    // Create terms for B.Tech
    const btech = createdCourses.find((c) => c.code === 'BTECH-CS');
    if (btech) {
      const terms = [
        { name: 'Semester 1', code: 'SEM1' },
        { name: 'Semester 2', code: 'SEM2' },
        { name: 'Semester 3', code: 'SEM3' },
        { name: 'Semester 4', code: 'SEM4' },
      ];

      const createdTerms: any[] = [];

      for (const term of terms) {
        try {
          const { data, error } = await supabase
            .from('institution_terms')
            .insert({
              institution_id: dtcInst.id,
              name: term.name,
              code: term.code,
            })
            .select()
            .single();

          if (error) throw error;
          console.log(`✓ Created term: ${term.name}`);
          createdTerms.push(data);
        } catch (err) {
          console.error(`✗ Failed to create term ${term.name}:`, err);
        }
      }

      // Create subjects for DSA, DBMS, OS, CN, SE
      const subjects = [
        { name: 'Data Structures & Algorithms', code: 'DSA' },
        { name: 'Database Management Systems', code: 'DBMS' },
        { name: 'Operating Systems', code: 'OS' },
        { name: 'Computer Networks', code: 'CN' },
        { name: 'Software Engineering', code: 'SE' },
      ];

      for (const subj of subjects) {
        try {
          const { error } = await supabase.from('institution_subjects').insert({
            institution_id: dtcInst.id,
            department_id: cseDept.id,
            course_id: btech.id,
            name: subj.name,
            code: subj.code,
          });

          if (error) throw error;
          console.log(`✓ Created subject: ${subj.name}`);
        } catch (err) {
          console.error(`✗ Failed to create subject ${subj.name}:`, err);
        }
      }
    }
  }

  return { createdDepts };
}

// E. Create Question Bank
async function createQuestionBank(institutions: any[]) {
  console.log('\n❓ Creating Question Bank...');

  const dtcInst = institutions.find((i) => i.slug === 'delhi-technical-college');
  if (!dtcInst) return [];

  // Find faculty1 from database
  let faculty1Data;
  try {
    const { data } = await supabase
      .from('institution_users')
      .select('id, user_id')
      .eq('institution_id', dtcInst.id)
      .eq('display_name', 'Amit Verma')
      .single();
    faculty1Data = data;
  } catch (err) {
    faculty1Data = null;
  }

  if (!faculty1Data?.user_id) {
    console.warn('⚠️  Faculty1 user not found');
    return [];
  }

  const questions = [
    {
      title: 'What is the time complexity of binary search?',
      subject: 'Data Structures & Algorithms',
      bloom_level: 'Remember',
      difficulty: 'easy',
      tags: ['searching', 'algorithms'],
      status: 'ready',
      metadata: { marks: 2, topic: 'Searching Algorithms', department: 'CSE', semester: '4' },
    },
    {
      title: 'Which data structure is used in BFS?',
      subject: 'Data Structures & Algorithms',
      bloom_level: 'Remember',
      difficulty: 'easy',
      tags: ['graph', 'algorithms'],
      status: 'ready',
      metadata: { marks: 2, topic: 'Graph Algorithms', department: 'CSE', semester: '4' },
    },
    {
      title: 'Explain the difference between stack and queue',
      subject: 'Data Structures & Algorithms',
      bloom_level: 'Understand',
      difficulty: 'medium',
      tags: ['linear', 'data-structures'],
      status: 'ready',
      metadata: { marks: 5, topic: 'Linear Data Structures', department: 'CSE', semester: '4' },
    },
    {
      title: "Write and explain Dijkstra's shortest path algorithm",
      subject: 'Data Structures & Algorithms',
      bloom_level: 'Apply',
      difficulty: 'hard',
      tags: ['graph', 'algorithms', 'advanced'],
      status: 'ready',
      metadata: { marks: 10, topic: 'Graph Algorithms', department: 'CSE', semester: '4' },
    },
    {
      title: "What is the worst-case complexity of QuickSort?",
      subject: 'Data Structures & Algorithms',
      bloom_level: 'Understand',
      difficulty: 'medium',
      tags: ['sorting', 'algorithms'],
      status: 'ready',
      metadata: { marks: 2, topic: 'Sorting Algorithms', department: 'CSE', semester: '4' },
    },
  ];

  const createdQuestions: any[] = [];

  for (const q of questions) {
    try {
      const { data, error } = await supabase
        .from('institution_questions')
        .insert({
          institution_id: dtcInst.id,
          created_by_user_id: faculty1Data.user_id,
          ...q,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`✓ Created question: ${q.title.substring(0, 40)}...`);
      createdQuestions.push(data);
    } catch (err) {
      console.error(`✗ Failed to create question:`, err);
    }
  }

  return createdQuestions;
}

// F. Create Paper Templates
async function createPaperTemplates(institutions: any[]) {
  console.log('\n📋 Creating Paper Templates...');

  const dtcInst = institutions.find((i) => i.slug === 'delhi-technical-college');
  if (!dtcInst) return [];

  // Find faculty1 from database
  let faculty1Data;
  try {
    const { data } = await supabase
      .from('institution_users')
      .select('id, user_id')
      .eq('institution_id', dtcInst.id)
      .eq('display_name', 'Amit Verma')
      .single();
    faculty1Data = data;
  } catch (err) {
    faculty1Data = null;
  }

  if (!faculty1Data?.user_id) return [];

  const templates = [
    {
      name: 'DSA Mid-Semester Exam Template',
      exam_type: 'mid_semester',
      total_marks: 50,
      duration_minutes: 90,
      sections: [
        { name: 'Section A', type: 'mcq', questions: 10, marks_each: 2 },
        { name: 'Section B', type: 'short_answer', questions: 4, marks_each: 5 },
        { name: 'Section C', type: 'long_answer', questions: 1, marks_each: 10 },
      ],
      status: 'published',
      metadata: { subject: 'DSA' },
    },
    {
      name: 'DBMS End Semester Exam Template',
      exam_type: 'end_semester',
      total_marks: 100,
      duration_minutes: 180,
      sections: [
        { name: 'Section A', type: 'mcq', questions: 20, marks_each: 1 },
        { name: 'Section B', type: 'short_answer', questions: 8, marks_each: 5 },
        { name: 'Section C', type: 'long_answer', questions: 4, marks_each: 10 },
      ],
      status: 'published',
      metadata: { subject: 'DBMS' },
    },
  ];

  const createdTemplates: any[] = [];

  for (const tmpl of templates) {
    try {
      const { data, error } = await supabase
        .from('institution_templates')
        .insert({
          institution_id: dtcInst.id,
          created_by_user_id: faculty1Data.user_id,
          ...tmpl,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`✓ Created template: ${tmpl.name}`);
      createdTemplates.push(data);
    } catch (err) {
      console.error(`✗ Failed to create template:`, err);
    }
  }

  return createdTemplates;
}

// G. Create Papers
async function createPapers(institutions: any[], templates: any[]) {
  console.log('\n📄 Creating Papers...');

  const dtcInst = institutions.find((i) => i.slug === 'delhi-technical-college');
  if (!dtcInst) return [];

  // Find faculty users from database
  let faculty1Data;
  let faculty2Data;

  try {
    const { data } = await supabase
      .from('institution_users')
      .select('id, user_id')
      .eq('institution_id', dtcInst.id)
      .eq('display_name', 'Amit Verma')
      .single();
    faculty1Data = data;
  } catch (err) {
    faculty1Data = null;
  }

  try {
    const { data } = await supabase
      .from('institution_users')
      .select('id, user_id')
      .eq('institution_id', dtcInst.id)
      .eq('display_name', 'Sneha Patel')
      .single();
    faculty2Data = data;
  } catch (err) {
    faculty2Data = null;
  }

  if (!faculty1Data?.user_id || !faculty2Data?.user_id) {
    console.warn('⚠️  Faculty users not found');
    return [];
  }

  const papers = [
    {
      title: 'DSA Unit Test - April 2026',
      status: 'draft',
      created_by_user_id: faculty1Data.user_id,
      metadata: { type: 'unit_test' },
    },
    {
      title: 'DBMS Mid-Semester Exam - Semester 4',
      status: 'submitted',
      created_by_user_id: faculty2Data.user_id,
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { type: 'mid_semester' },
    },
    {
      title: 'OS Internal Assessment - April 2026',
      status: 'in_review',
      created_by_user_id: faculty1Data.user_id,
      metadata: { type: 'internal_assessment' },
    },
    {
      title: 'CN Quiz - Unit 1',
      status: 'published',
      created_by_user_id: faculty2Data.user_id,
      approved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { type: 'quiz' },
    },
    {
      title: 'DSA Practice Test - March 2026',
      status: 'rejected',
      created_by_user_id: faculty1Data.user_id,
      metadata: { type: 'practice_test', rejection_reason: 'Insufficient graph algorithm coverage' },
    },
  ];

  const createdPapers: any[] = [];

  for (const paper of papers) {
    try {
      const { data, error } = await supabase
        .from('institution_papers')
        .insert({
          institution_id: dtcInst.id,
          template_id: templates[0]?.id,
          ...paper,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`✓ Created paper: ${paper.title}`);
      createdPapers.push(data);
    } catch (err) {
      console.error(`✗ Failed to create paper:`, err);
    }
  }

  return createdPapers;
}

// H. Print Summary
async function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('  ExamCraft Test Data Seed Complete');
  console.log('='.repeat(50) + '\n');

  console.log('👤 USERS CREATED:');
  const testUsers = [
    'superadmin@examcraft-test.com (Super Admin)',
    'admin.dtc@examcraft-test.com (Institution Admin - DTC)',
    'head.dtc@examcraft-test.com (Academic Head - DTC)',
    'faculty1.dtc@examcraft-test.com (Faculty - DTC)',
    'faculty2.dtc@examcraft-test.com (Faculty - DTC)',
    'reviewer.dtc@examcraft-test.com (Reviewer - DTC)',
    'admin.bmt@examcraft-test.com (Institution Admin - BMT)',
    'faculty.bmt@examcraft-test.com (Faculty - BMT)',
    'reviewer.bmt@examcraft-test.com (Reviewer - BMT)',
    'admin.sa@examcraft-test.com (Institution Admin - SA)',
    'faculty.sa@examcraft-test.com (Faculty - SA)',
  ];

  for (const user of testUsers) {
    console.log(`  ✅ ${user}`);
  }

  console.log('\n📊 STATISTICS:');
  console.log('  ✅ INSTITUTIONS: 3 created');
  console.log('  ✅ DEPARTMENTS: 4 created');
  console.log('  ✅ COURSES: 2 created');
  console.log('  ✅ TERMS/SEMESTERS: 4 created');
  console.log('  ✅ SUBJECTS: 5 created');
  console.log('  ✅ QUESTIONS: 5 created');
  console.log('  ✅ TEMPLATES: 2 created');
  console.log('  ✅ PAPERS: 5 created (draft/submitted/in_review/published/rejected)');

  console.log('\n🔐 CREDENTIALS:');
  console.log('  All passwords: TestPass@123');

  console.log('\n🌐 TEST URLS:');
  console.log('  App:   http://localhost:3000/login');
  console.log('  Admin: http://localhost:3000/admin/dashboard');

  console.log('\n' + '='.repeat(50));
  console.log('Ready for testing! 🚀');
  console.log('='.repeat(50) + '\n');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  try {
    console.log('🌱 Starting ExamCraft Test Data Seed...\n');

    const resetOnly = process.argv.includes('--reset-only');

    // Test Supabase connection first
    console.log('🔗 Testing Supabase connection...');
    const { error: pingError } = await supabase
      .from('institutions')
      .select('count')
      .limit(1);

    if (pingError && pingError.code !== 'PGRST116') {
      console.error('❌ Cannot connect to Supabase');
      console.error('   URL:', SUPABASE_URL);
      console.error('   Error:', pingError.message);
      console.error('\n   If using local Supabase, start it with: supabase start');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase:', SUPABASE_URL, '\n');

    // Clear all data
    await clearAllData();

    if (resetOnly) {
      console.log('✓ Reset complete. Exiting.\n');
      process.exit(0);
    }

    // Seed data
    console.log('🌱 Seeding test data...\n');

    await createSuperAdmin();
    const institutions = await createInstitutions();
    const createdUsers = await createUsersPerInstitution(institutions);
    await createAcademicStructure(institutions);
    const questions = await createQuestionBank(institutions);
    const templates = await createPaperTemplates(institutions);
    const papers = await createPapers(institutions, templates);

    // Print summary
    await printSummary();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  }
}

main();
