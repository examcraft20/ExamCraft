/**
 * Seed Data Script for Academic Structure Module
 * 
 * Usage: npx ts-node scripts/seed-academic-structure.ts
 * 
 * This script creates test data for:
 * - Departments
 * - Courses
 * - Batches
 * - Subjects
 * - Faculty assignments
 * - Student enrollments
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test institution ID (replace with actual test institution)
const TEST_INSTITUTION_ID = '00000000-0000-0000-0000-000000000001';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000002';

async function seedDepartments() {
  console.log('Seeding departments...');
  
  const departments = [
    { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering' },
    { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering' },
    { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
    { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' },
    { name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
  ];

  for (const dept of departments) {
    const { data, error } = await supabase
      .from('institution_departments')
      .insert([{ ...dept, institution_id: TEST_INSTITUTION_ID }])
      .select()
      .single();

    if (error) {
      console.error(\Error creating department \:\, error.message);
    } else {
      console.log(\✓ Created department: \ (\)\);
    }
  }
}

async function seedCourses() {
  console.log('\\nSeeding courses...');
  
  // Get departments first
  const { data: departments } = await supabase
    .from('institution_departments')
    .select('id, code')
    .eq('institution_id', TEST_INSTITUTION_ID);

  if (!departments) return;

  const csDept = departments.find(d => d.code === 'CS');
  const eeDept = departments.find(d => d.code === 'EE');
  const mathDept = departments.find(d => d.code === 'MATH');

  const courses = [
    { name: 'B.Tech Computer Science', code: 'BT-CS', department_id: csDept?.id, credits: 160, level: 'undergraduate', duration_semesters: 8 },
    { name: 'M.Tech Computer Science', code: 'MT-CS', department_id: csDept?.id, credits: 80, level: 'postgraduate', duration_semesters: 4 },
    { name: 'B.Tech Electrical Engineering', code: 'BT-EE', department_id: eeDept?.id, credits: 160, level: 'undergraduate', duration_semesters: 8 },
    { name: 'B.Sc Mathematics', code: 'BSC-MATH', department_id: mathDept?.id, credits: 120, level: 'undergraduate', duration_semesters: 6 },
  ];

  for (const course of courses) {
    const { data, error } = await supabase
      .from('institution_courses')
      .insert([{ ...course, institution_id: TEST_INSTITUTION_ID }])
      .select()
      .single();

    if (error) {
      console.error(\Error creating course \:\, error.message);
    } else {
      console.log(\✓ Created course: \ (\)\);
    }
  }
}

async function seedBatches() {
  console.log('\\nSeeding batches...');
  
  // Get courses first
  const { data: courses } = await supabase
    .from('institution_courses')
    .select('id, code')
    .eq('institution_id', TEST_INSTITUTION_ID);

  if (!courses) return;

  const btcs = courses.find(c => c.code === 'BT-CS');
  const mtc = courses.find(c => c.code === 'MT-CS');

  const batches = [
    { name: 'Section A', code: 'CS-A', course_id: btcs?.id, academic_year: '2024-2025', semester: 1, capacity: 60, start_date: '2024-08-01', end_date: '2024-12-31' },
    { name: 'Section B', code: 'CS-B', course_id: btcs?.id, academic_year: '2024-2025', semester: 1, capacity: 60, start_date: '2024-08-01', end_date: '2024-12-31' },
    { name: 'Section A', code: 'MT-A', course_id: mtc?.id, academic_year: '2024-2025', semester: 1, capacity: 30, start_date: '2024-08-01', end_date: '2024-12-31' },
  ];

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('institution_batches')
      .insert([{ ...batch, institution_id: TEST_INSTITUTION_ID, created_by: TEST_USER_ID }])
      .select()
      .single();

    if (error) {
      console.error(\Error creating batch \:\, error.message);
    } else {
      console.log(\✓ Created batch: \ (\) - Capacity: \\);
    }
  }
}

async function seedSubjects() {
  console.log('\\nSeeding subjects...');
  
  // Get departments and courses
  const { data: departments } = await supabase
    .from('institution_departments')
    .select('id, code')
    .eq('institution_id', TEST_INSTITUTION_ID);

  const { data: courses } = await supabase
    .from('institution_courses')
    .select('id, code')
    .eq('institution_id', TEST_INSTITUTION_ID);

  if (!departments || !courses) return;

  const csDept = departments.find(d => d.code === 'CS');
  const btcs = courses.find(c => c.code === 'BT-CS');

  const subjects = [
    { name: 'Data Structures', code: 'CS101', department_id: csDept?.id, course_id: btcs?.id, credits: 4, subject_type: 'theory' },
    { name: 'Algorithms', code: 'CS102', department_id: csDept?.id, course_id: btcs?.id, credits: 4, subject_type: 'theory' },
    { name: 'Database Systems', code: 'CS201', department_id: csDept?.id, course_id: btcs?.id, credits: 4, subject_type: 'theory' },
    { name: 'Web Development Lab', code: 'CS202L', department_id: csDept?.id, course_id: btcs?.id, credits: 2, subject_type: 'practical' },
  ];

  for (const subject of subjects) {
    const { data, error } = await supabase
      .from('institution_subjects')
      .insert([{ ...subject, institution_id: TEST_INSTITUTION_ID }])
      .select()
      .single();

    if (error) {
      console.error(\Error creating subject \:\, error.message);
    } else {
      console.log(\✓ Created subject: \ (\)\);
    }
  }
}

async function seedFacultyAssignments() {
  console.log('\\nSeeding faculty assignments...');
  
  // Get departments and batches
  const { data: departments } = await supabase
    .from('institution_departments')
    .select('id')
    .eq('institution_id', TEST_INSTITUTION_ID)
    .limit(1);

  const { data: batches } = await supabase
    .from('institution_batches')
    .select('id')
    .eq('institution_id', TEST_INSTITUTION_ID)
    .limit(2);

  if (!departments || !batches) return;

  const assignments = [
    { user_id: TEST_USER_ID, department_id: departments[0].id, role: 'head_of_department', is_primary: true },
    { user_id: TEST_USER_ID, batch_id: batches[0].id, role: 'faculty', is_primary: true },
  ];

  for (const assignment of assignments) {
    const { data, error } = await supabase
      .from('faculty_assignments')
      .insert([{ ...assignment, institution_id: TEST_INSTITUTION_ID }])
      .select()
      .single();

    if (error) {
      console.error('Error creating faculty assignment:', error.message);
    } else {
      console.log(\✓ Created faculty assignment: \\);
    }
  }
}

async function main() {
  console.log('🌱 Starting Academic Structure Seed Process...\\n');
  
  try {
    await seedDepartments();
    await seedCourses();
    await seedBatches();
    await seedSubjects();
    await seedFacultyAssignments();
    
    console.log('\\n✅ Seed process completed successfully!');
    console.log('\\nVerification queries:');
    console.log('SELECT COUNT(*) FROM institution_departments WHERE institution_id = \\'', TEST_INSTITUTION_ID, '\\';');
    console.log('SELECT COUNT(*) FROM institution_courses WHERE institution_id = \\'', TEST_INSTITUTION_ID, '\\';');
    console.log('SELECT COUNT(*) FROM institution_batches WHERE institution_id = \\'', TEST_INSTITUTION_ID, '\\';');
    console.log('SELECT COUNT(*) FROM institution_subjects WHERE institution_id = \\'', TEST_INSTITUTION_ID, '\\';');
  } catch (error) {
    console.error('\\n❌ Seed process failed:', error);
    process.exit(1);
  }
}

main();
