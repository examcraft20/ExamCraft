# ExamCraft Seed Data Guide

## Overview

The seed script (`scripts/seed-test-data.ts`) provides a complete database reset and repopulation workflow for ExamCraft testing and development.

**Key Features:**
- ✅ Clears all data while preserving table structures and RLS policies
- ✅ Creates realistic institutional hierarchy with 3 tenants
- ✅ Generates 11 test users across different roles
- ✅ Seeds complete academic structure (departments, courses, semesters, subjects)
- ✅ Creates 25+ realistic questions covering multiple difficulty levels
- ✅ Generates papers in various workflow states (draft, submitted, in_review, published, rejected)
- ✅ Includes review records with feedback and approval history
- ✅ Populates feature flags and audit logs
- ✅ Provides console summary of created data

---

## Prerequisites

1. **Environment Setup:**
   - Ensure `.env.local` exists at project root
   - Required variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

2. **Dependencies:**
   - `tsx` - already in devDependencies for running TypeScript
   - `@supabase/supabase-js` - already installed

---

## Usage

### Option 1: Full Reset & Seed (Recommended)

Reset all data AND populate with test data:

```bash
# From project root
pnpm seed

# Or from apps/web directory
pnpm seed
```

### Option 2: Reset Only

Clear all data but skip seeding:

```bash
# From project root
pnpm seed:reset

# Or from apps/web directory
cd apps/web && pnpm seed:reset
```

### Option 3: Direct Execution

```bash
cd scripts
tsx seed-test-data.ts
```

---

## What Gets Created

### Users (11 total)

#### Super Admin (Global)
- **Email:** superadmin@examcraft-test.com
- **Password:** TestPass@123
- **Role:** super_admin

#### Institution 1: Delhi Technical College (DTC)
- **Admin:** admin.dtc@examcraft-test.com
- **Academic Head:** head.dtc@examcraft-test.com
- **Faculty 1:** faculty1.dtc@examcraft-test.com
- **Faculty 2:** faculty2.dtc@examcraft-test.com
- **Reviewer:** reviewer.dtc@examcraft-test.com
- **Pending Invitation:** pending.dtc@examcraft-test.com

#### Institution 2: Bright Minds Tuition (BMT)
- **Admin:** admin.bmt@examcraft-test.com
- **Faculty:** faculty.bmt@examcraft-test.com
- **Reviewer:** reviewer.bmt@examcraft-test.com

#### Institution 3: Sunrise Academy (SA)
- **Admin:** admin.sa@examcraft-test.com
- **Faculty:** faculty.sa@examcraft-test.com

**All passwords:** `TestPass@123`

---

### Institutions (3)

| Name | Type | City | Plan | Status |
|------|------|------|------|--------|
| Delhi Technical College | college | New Delhi | pro | active |
| Bright Minds Tuition | tuition_center | Mumbai | starter | active |
| Sunrise Academy | coaching_institute | Pune | free | trial |

---

### Academic Structure (DTC Only - Full Setup)

**Departments (4):**
1. Computer Science Engineering (CSE)
2. Electronics & Communication (ECE)
3. Mechanical Engineering (ME)
4. Mathematics & Sciences (MS)

**Courses (under CSE):**
- B.Tech Computer Science (4 years)
- M.Tech Software Engineering (2 years)

**Semesters (B.Tech CSE):**
- Semester 1-4 (Semester 4 is current)

**Subjects (CSE, Semester 4):**
1. Data Structures & Algorithms (DSA) - 4 credits
2. Database Management Systems (DBMS) - 3 credits
3. Operating Systems (OS) - 3 credits
4. Computer Networks (CN) - 3 credits
5. Software Engineering (SE) - 3 credits

**ECE Subjects (minimal setup):**
- Digital Signal Processing
- VLSI Design
- Embedded Systems

---

### Questions (25+)

**DSA Subject (10 questions):**
- Mix of MCQ, short answer, and long answer
- Difficulty levels: easy, medium, hard
- Statuses: approved, submitted, draft
- Topics: Searching, Sorting, Graph Algorithms, Linear Data Structures

**DBMS Subject (8 questions):**
- SQL, Normalization, ACID properties, ER diagrams, Indexing, Transactions

**OS Subject (4 questions):**
- Process scheduling, Memory management, Deadlocks, Virtual memory

**CN Subject (3 questions):**
- OSI model, TCP/IP, Routing protocols

---

### Papers (5 - Various States)

| Title | Status | Created By | Notes |
|-------|--------|-----------|-------|
| DSA Unit Test - April 2026 | draft | Faculty 1 | No review |
| DBMS Mid-Semester Exam | submitted | Faculty 2 | Awaiting review |
| OS Internal Assessment | in_review | Faculty 1 | Active review |
| CN Quiz - Unit 1 | published | Faculty 2 | Approved & published |
| DSA Practice Test - March 2026 | rejected | Faculty 1 | With rejection reason |

---

### Feature Flags (7)

| Name | Enabled | Scope |
|------|---------|-------|
| ai_question_generation | ❌ | global |
| global_template_library | ✅ | global |
| bulk_question_import | ✅ | global |
| advanced_analytics | ❌ | per_tenant |
| paper_pdf_export | ✅ | global |
| paper_docx_export | ✅ | global |
| duplicate_detection | ❌ | global |

---

### Audit Logs (10)

Sample actions tracked:
- User login
- Department creation
- User invitations
- Question creation
- Paper submission
- Paper review and approval
- Paper rejection

---

## Expected Console Output

```
🌱 Starting ExamCraft Test Data Seed...

🗑️  Clearing all data...

✓ Cleared paper_reviews
✓ Cleared paper_review_notes
✓ Cleared paper_approval_history
✓ Cleared paper_questions
✓ Cleared papers
... (all tables cleared)
✓ Data cleared

🌱 Seeding test data...

👤 Creating Super Admin...
✓ Super Admin created: [uuid]

🏛️  Creating Institutions...
✓ Created institution: Delhi Technical College
✓ Created institution: Bright Minds Tuition Center
✓ Created institution: Sunrise Academy

👥 Creating Institution Users...
✓ Created user: admin.dtc@examcraft-test.com (institution_admin)
✓ Created user: head.dtc@examcraft-test.com (academic_head)
... (all users created)

📚 Creating Academic Structure...
✓ Created department: Computer Science Engineering
✓ Created course: B.Tech Computer Science
✓ Created semester: Semester 4
✓ Created subject: Data Structures & Algorithms
... (all academic structure created)

❓ Creating Question Bank...
✓ Created question: Searching Algorithms
... (all questions created)

📋 Creating Paper Templates...
✓ Created template: DSA Mid-Semester Exam Template
✓ Created template: DBMS End Semester Exam Template

📄 Creating Papers...
✓ Created paper: DSA Unit Test - April 2026
... (all papers created)

📝 Creating Review Records...
✓ Created review record for paper 3

🚩 Creating Feature Flags...
✓ Created feature flag: ai_question_generation
... (all flags created)

📊 Creating Audit Logs...
✓ Created audit log: LOGIN - User logged in
... (all logs created)

==================================================
  ExamCraft Test Data Seed Complete
==================================================

👤 USERS CREATED:
  ✅ superadmin@examcraft-test.com (Super Admin)
  ✅ admin.dtc@examcraft-test.com (Institution Admin - DTC)
  ... (all users listed)

📊 STATISTICS:
  ✅ INSTITUTIONS: 3 created
  ✅ DEPARTMENTS: 4 created
  ✅ SUBJECTS: 8 created
  ✅ QUESTIONS: 5+ created
  ✅ TEMPLATES: 2 created
  ✅ PAPERS: 5 created
  ✅ FEATURE FLAGS: 7 created
  ✅ AUDIT LOGS: 10 created

🔐 CREDENTIALS:
  All passwords: TestPass@123

🌐 TEST URLS:
  App:   http://localhost:3000/login
  Admin: http://localhost:3000/admin/dashboard

==================================================
Ready for testing! 🚀
==================================================
```

---

## Testing the Seeded Data

### 1. Verify Institutions

```bash
curl "http://localhost:4000/api/institutions" \
  -H "Authorization: Bearer [super_admin_token]"
```

### 2. Login with Different Roles

Visit `http://localhost:3000/login` and try:

- **Super Admin:** superadmin@examcraft-test.com / TestPass@123
- **Institution Admin:** admin.dtc@examcraft-test.com / TestPass@123
- **Academic Head:** head.dtc@examcraft-test.com / TestPass@123
- **Faculty:** faculty1.dtc@examcraft-test.com / TestPass@123
- **Reviewer:** reviewer.dtc@examcraft-test.com / TestPass@123

### 3. Check Dashboard

Each role should see their workspace:
- Admin → Institution admin dashboard
- Academic Head → Academic structure & analytics
- Faculty → Question bank & paper creation
- Reviewer → Review queue & approval workflow

### 4. Verify Database

```bash
# Check institution count
SELECT COUNT(*) FROM institutions;

# Check users
SELECT email, role FROM institution_members;

# Check papers
SELECT title, status FROM papers;

# Check questions
SELECT COUNT(*) FROM questions GROUP BY subject_id;
```

---

## Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution:**
- Ensure `.env.local` exists in project root
- Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart any running dev servers

### Issue: "User already exists"

**Solution:**
- The script checks for existing test users
- Previous runs may have partially seeded data
- Use `pnpm seed:reset` first to clear everything
- Or manually delete test users with pattern `@examcraft-test.com`

### Issue: "Foreign key constraint violation"

**Solution:**
- The script respects deletion order for FK constraints
- Ensure database is accessible and not locked
- Check database logs: `supabase logs` (if using Supabase CLI)

### Issue: "Table doesn't exist"

**Solution:**
- Run migrations first: `supabase migration up`
- Or: `supabase db push` if using Supabase CLI
- Verify Supabase database is properly initialized

---

## Customization

To modify seeded data, edit `scripts/seed-test-data.ts`:

**Add more institutions:**
```typescript
const institutions = [
  // ... existing
  {
    name: "Your Institution",
    slug: "your-institution",
    type: "college",
    // ...
  }
];
```

**Add more questions:**
```typescript
const dsaQuestions = [
  // ... existing
  {
    text: "Your question?",
    type: "mcq",
    // ...
  }
];
```

**Modify user roles:**
Update the `usersByInstitution` object to change role assignments or add more users.

---

## Performance Notes

**Typical execution time:** 10-30 seconds (depends on network latency to Supabase)

**Database changes:**
- ~80+ rows inserted across institutions, users, academic structure, questions, papers
- All previous data deleted
- No schema changes

---

## Security Notes

⚠️ **This script is for development only!**

- Test credentials are intentionally weak (`TestPass@123`)
- Never run on production databases
- All test users use email pattern `@examcraft-test.com`
- Service role key should only be used in secure environments

---

## Next Steps

After seeding:

1. **Start the application:**
   ```bash
   pnpm dev
   ```

2. **Login** to test different user flows

3. **Create more resources** using the UI to populate additional data

4. **Run tests:**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

---

## Related Documentation

- [Quick Start Guide](../QUICK_START.md)
- [Project Structure](../FILE_STRUCTURE.md)
- [Architecture Document](../Architecture.md)
- [API Documentation](./api/README.md)
