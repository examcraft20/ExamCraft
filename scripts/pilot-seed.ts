import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const rootEnvPath = path.resolve(process.cwd(), '.env.local');
const webEnvPath = path.resolve(process.cwd(), 'apps/web/.env.local');

if (fs.existsSync(webEnvPath)) dotenv.config({ path: webEnvPath });
if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath, override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedPilotDemo() {
  console.log('🚀 Seeding Pilot Demo Institution...\n');
  
  // 1. Create Institution
  const { data: inst, error: instError } = await supabase
    .from('institutions')
    .insert({
      name: 'Pilot Beta Academy',
      slug: 'pilot-beta',
      institution_type: 'college',
      status: 'active',
      settings: { city: 'Mumbai', country: 'India'}
    })
    .select()
    .single();

  if (instError) throw instError;
  console.log(`✅ Created Institution: ${inst.name}`);

  // 2. Create Users
  const usersToCreate = [
    { email: 'admin@pilotbeta.edu', role: 'institution_admin', name: 'Raj Kumar (Admin)' },
    { email: 'head@pilotbeta.edu', role: 'academic_head', name: 'Dr. Priya (Head)' },
    { email: 'faculty1@pilotbeta.edu', role: 'faculty', name: 'Amit Singh (Faculty)' },
    { email: 'faculty2@pilotbeta.edu', role: 'faculty', name: 'Neha Joshi (Faculty)' },
    { email: 'reviewer@pilotbeta.edu', role: 'reviewer_approver', name: 'Prof. Desai (Reviewer)' }
  ];

  const createdAuthUsers = [];
  for (const u of usersToCreate) {
    const { data: auth, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: u.name, display_name: u.name },
      app_metadata: { roles: [u.role] }
    });
    
    // Skip if already exists
    if (authError && !authError.message.includes('already exists')) throw authError;

    const authUsersList = await supabase.auth.admin.listUsers();
    const userObj = auth.user || authUsersList.data.users.find(x => x.email === u.email);

    if (userObj) {
      // Map to institution_users
      const { data: member } = await supabase.from('institution_users')
        .upsert({ 
          user_id: userObj.id, 
          institution_id: inst.id, 
          display_name: u.name, 
          status: 'active' 
        }, { onConflict: 'user_id,institution_id' })
        .select()
        .single();
        
      createdAuthUsers.push({ user_id: userObj.id, role: u.role, member_id: member?.id });
      console.log(`✅ Created User: ${u.email} (${u.role})`);
    }
  }

  const faculty1 = createdAuthUsers.find(u => u.role === 'faculty')?.user_id;

  if (!faculty1) throw new Error("Faculty 1 creation failed");

  // 3. Create Questions (20 mixed)
  const questionsToInsert = [];
  for(let i=1; i<=20; i++) {
    questionsToInsert.push({
      institution_id: inst.id,
      created_by_user_id: faculty1,
      title: `Sample Question ${i}: Explain the core concepts and methodologies related to this topic.`,
      subject: i > 10 ? 'Mathematics' : 'Computer Science',
      difficulty: ['easy', 'medium', 'medium', 'hard'][i % 4],
      bloom_level: ['Remember', 'Understand', 'Apply', 'Analyze'][i % 4],
      status: 'ready'
    });
  }
  await supabase.from('institution_questions').insert(questionsToInsert);
  console.log('✅ Inserted 20 mixed difficulty Questions (Status: Ready)');

  // 4. Create Template (Simulate cloned global)
  const { data: template } = await supabase.from('institution_templates')
    .insert({
      institution_id: inst.id,
      created_by_user_id: faculty1,
      name: '[Cloned] CBSE Standard Board Format',
      exam_type: 'Midterm',
      total_marks: 50,
      duration_minutes: 60,
      status: 'published',
      metadata: { cloned_from: 'global-seed' }
    }).select().single();
    
  await supabase.from('institution_template_sections').insert({
    template_id: template.id,
    title: 'Section A - Core Concepts',
    question_count: 5,
    marks_per_question: 10,
    allowed_difficulty: ['medium', 'hard']
  });
  console.log('✅ Created 1 Published Template (Cloned from Global)');

  // 5. Create Approved Paper
  await supabase.from('institution_papers')
    .insert({
       institution_id: inst.id,
       template_id: template.id,
       created_by_user_id: faculty1,
       title: 'Spring 2026 Core Assessment',
       status: 'approved',
       metadata: { 
         sections: [{
           title: 'Section A - Core Concepts',
           marks: 50,
           questions: []
         }] 
       }
    });
  console.log('✅ Created 1 Approved Exam Paper');

  console.log('\n🎉 Seed Complete! You can now login with: admin@pilotbeta.edu / Password123!');
}

seedPilotDemo().catch(console.error);
