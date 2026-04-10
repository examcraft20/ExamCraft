# Quick Testing Guide - ExamCraft Academic Structure Module

**Date:** 2026-04-04  
**Status:** Ready to Test  

---

## ⚠️ IMPORTANT: Environment Setup Required

Before running the project, you need to configure Supabase credentials.

### Option 1: Use Local Supabase (Recommended for Testing)

`ash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# This will give you:
# - API URL: http://localhost:54321
# - Anon Key: (copy from output)
# - Service Role Key: (copy from output)
`

### Option 2: Use Remote Supabase Project

1. Go to https://supabase.com
2. Create a new project or use existing
3. Get your credentials from Settings > API
4. Update .env.local with your credentials

---

## 📝 UPDATE .env.local

Open .env.local and add:

`env
# Supabase Configuration
SUPABASE_URL=http://localhost:54321  # or your remote URL
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
JWT_SECRET=your-jwt-secret-here

# Next.js Public Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_DEMO_MODE=true
`

---

## 🚀 RUNNING THE PROJECT

### Step 1: Apply Database Migration

`ash
# If using local Supabase
npx supabase db push

# If using remote Supabase, run SQL directly in Dashboard
# Copy contents of: supabase/migrations/20260405000100_academic_structure_complete.sql
# Paste into SQL Editor and run
`

### Step 2: Seed Test Data (Optional but Recommended)

`ash
# Set environment variables
="http://localhost:54321"
="your-service-role-key"

# Run seed script
npx ts-node scripts/seed-academic-structure.ts
`

### Step 3: Start Development Servers

**Terminal 1 - API Server:**
`ash
cd apps/api
pnpm dev
# API will run on http://localhost:4000
`

**Terminal 2 - Web Server:**
`ash
cd apps/web
pnpm dev
# Web will run on http://localhost:3000
`

### Step 4: Test the Application

#### Option A: Browser Testing
1. Open http://localhost:3000
2. Login (or use demo mode)
3. Navigate to: http://localhost:3000/dashboard/academic-structure/departments
4. Try creating, editing, and deleting departments

#### Option B: API Testing with curl

`ash
# Get all departments
curl http://localhost:4000/api/academic-structure/departments 
  -H "x-institution-id: YOUR_INSTITUTION_ID" 
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a department
curl -X POST http://localhost:4000/api/academic-structure/departments 
  -H "Content-Type: application/json" 
  -H "x-institution-id: YOUR_INSTITUTION_ID" 
  -H "x-user-id: YOUR_USER_ID" 
  -H "Authorization: Bearer YOUR_JWT_TOKEN" 
  -d '{\"name\":\"Physics\",\"code\":\"PHY\",\"description\":\"Physics Department\"}'
`

#### Option C: API Testing with Postman/Insomnia

1. Create new request
2. Method: GET
3. URL: http://localhost:4000/api/academic-structure/departments
4. Headers:
   - x-institution-id: YOUR_INSTITUTION_ID
   - Authorization: Bearer YOUR_JWT_TOKEN
5. Send request

---

## ✅ VERIFICATION CHECKLIST

### Database Verification
`sql
-- Run these in Supabase SQL Editor

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('institution_batches', 'faculty_assignments', 'student_enrollments');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('institution_batches', 'faculty_assignments', 'student_enrollments');

-- Count seeded data (if you ran seed script)
SELECT COUNT(*) as dept_count FROM institution_departments;
SELECT COUNT(*) as course_count FROM institution_courses;
SELECT COUNT(*) as batch_count FROM institution_batches;
SELECT COUNT(*) as subject_count FROM institution_subjects;
`

### Backend Verification
- [ ] API server starts without errors
- [ ] Swagger docs available at http://localhost:4000/api/docs
- [ ] Can access /api/academic-structure/departments endpoint
- [ ] Authentication working (JWT validation)
- [ ] Tenant isolation enforced (RLS policies)

### Frontend Verification
- [ ] Web server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Departments page loads at /dashboard/academic-structure/departments
- [ ] Can create new department
- [ ] Can edit existing department
- [ ] Can delete department
- [ ] Error messages display correctly
- [ ] Loading states work properly

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot connect to Supabase"
**Solution:** 
- Verify SUPABASE_URL is correct
- Check if Supabase is running (supabase status)
- Ensure network connectivity

### Issue: "Authentication failed"
**Solution:**
- Verify JWT_SECRET matches between API and auth provider
- Check token expiration
- Ensure Authorization header format is correct

### Issue: "Module not found" errors
**Solution:**
`ash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
`

### Issue: "Port already in use"
**Solution:**
`ash
# Kill process on port 4000 (API)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Kill process on port 3000 (Web)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
`

### Issue: TypeScript compilation errors
**Solution:**
`ash
# Clear build cache
cd apps/api
rm -rf dist
rm -rf .turbo

cd apps/web
rm -rf .next
rm -rf .turbo

# Rebuild
pnpm build
`

---

## 📊 EXPECTED OUTPUT

### Successful API Response (GET /departments)
`json
[
  {
    "id": "uuid-here",
    "name": "Computer Science",
    "code": "CS",
    "description": "Department of Computer Science",
    "is_active": true,
    "created_at": "2026-04-04T10:00:00Z",
    "updated_at": "2026-04-04T10:00:00Z"
  }
]
`

### Successful Create Response (POST /departments)
`json
{
  "id": "new-uuid-here",
  "name": "Physics",
  "code": "PHY",
  "description": "Physics Department",
  "is_active": true,
  "created_at": "2026-04-04T10:05:00Z",
  "updated_at": "2026-04-04T10:05:00Z"
}
`

---

## �� NEXT STEPS AFTER TESTING

1. **Write Unit Tests** - Test service layer methods
2. **Add More Pages** - Courses, Batches, Subjects management
3. **Implement Faculty Assignments** - UI for assigning faculty
4. **Add Bulk Import** - CSV import for departments/courses
5. **Performance Testing** - Load test with many records
6. **Deploy to Staging** - Test in production-like environment

---

## 📞 NEED HELP?

- Check logs: apps/api/logs and apps/web/.next-build
- Review documentation: IMPLEMENTATION_STARTER_PACK.md
- Check test cases: TEST_CASES_CRITICAL_WORKFLOWS.md
- View sprint plan: SPRINT_PLANNING_TEMPLATES.md

---

**Guide Created:** 2026-04-04  
**Last Updated:** 2026-04-04  
**Version:** 1.0
