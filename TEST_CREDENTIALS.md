# ExamCraft Test Credentials

## Universal Password
```
TestPass@123
```

---

## Platform Level

### Super Admin
```
Email: superadmin@examcraft-test.com
Password: TestPass@123
Role: Super Admin
Access: Platform-wide, all institutions
```

---

## Institution 1: Delhi Technical College

| Email | Password | Role | Department | Notes |
|-------|----------|------|------------|-------|
| `admin.dtc@examcraft-test.com` | `TestPass@123` | Institution Admin | N/A | Full institutional control |
| `head.dtc@examcraft-test.com` | `TestPass@123` | Academic Head | N/A | Review & oversight |
| `faculty1.dtc@examcraft-test.com` | `TestPass@123` | Faculty | CSE | Create questions, draft papers |
| `faculty2.dtc@examcraft-test.com` | `TestPass@123` | Faculty | CSE | Create questions, draft papers |
| `reviewer.dtc@examcraft-test.com` | `TestPass@123` | Reviewer Approver | N/A | Paper review & approval |

---

## Institution 2: Bright Minds Tuition Center

| Email | Password | Role | Department | Notes |
|-------|----------|------|------------|-------|
| `admin.bmt@examcraft-test.com` | `TestPass@123` | Institution Admin | N/A | Full institutional control |
| `faculty.bmt@examcraft-test.com` | `TestPass@123` | Faculty | N/A | Create questions, draft papers |
| `reviewer.bmt@examcraft-test.com` | `TestPass@123` | Reviewer Approver | N/A | Paper review & approval |

---

## Institution 3: Sunrise Academy

| Email | Password | Role | Department | Notes |
|-------|----------|------|------------|-------|
| `admin.sa@examcraft-test.com` | `TestPass@123` | Institution Admin | N/A | Full institutional control |
| `faculty.sa@examcraft-test.com` | `TestPass@123` | Faculty | N/A | Create questions, draft papers |

---

## What You Can Test

### With Faculty Accounts
- ✅ Create questions
- ✅ Create paper templates
- ✅ Draft papers
- ✅ Submit papers for review
- ✅ View institutional data

### With Reviewer Accounts
- ✅ Review submitted papers
- ✅ Approve/reject papers
- ✅ Publish papers
- ✅ Add review comments

### With Admin Accounts
- ✅ Manage institutional users
- ✅ Create academic structure (departments, courses, subjects)
- ✅ View all institutional data
- ✅ Configure institution settings

### With Super Admin Accounts
- ✅ Access all institutions
- ✅ Platform-wide administration
- ✅ User management across all institutions
- ✅ System settings

---

## Pre-Seeded Data

### Delhi Technical College (DTC)
- **Departments**: CSE, ECE, ME, MS
- **Courses**: B.Tech Computer Science, M.Tech Software Engineering
- **Semesters**: 1, 2, 3, 4 (Sem 4 is current)
- **Subjects in Sem 4**: DSA, DBMS, OS, CN, SE
- **Questions**: 5 questions (MCQ, Short Answer, Long Answer)
- **Templates**: 2 exam templates
- **Papers**: 5 papers in various states
  - Draft: DSA Unit Test
  - Submitted: DBMS Mid-Semester Exam
  - In Review: OS Internal Assessment
  - Published: CN Quiz - Unit 1
  - Rejected: DSA Practice Test

### Bright Minds Tuition Center (BMT)
- **Basic setup** (no departments/courses yet)
- Ready for admin to configure

### Sunrise Academy (SA)
- **Basic setup** (no departments/courses yet)
- Ready for admin to configure

---

## Login URLs

```
App:   http://localhost:3000/login
Admin: http://localhost:3000/admin/dashboard
```

---

## Database Check

### View Seeded Data via SQL
```sql
-- Check institutions
SELECT id, name, slug, status FROM institutions;

-- Check users
SELECT id, display_name, status FROM institution_users LIMIT 20;

-- Check departments
SELECT id, name, code FROM institution_departments;

-- Check subjects
SELECT id, name, code FROM institution_subjects;

-- Check questions
SELECT id, title, difficulty FROM institution_questions;

-- Check papers
SELECT id, title, status FROM institution_papers;
```

---

## Quick Test Flow

1. **Start App**
   ```bash
   pnpm dev
   ```

2. **Login as Faculty**
   - Email: `faculty1.dtc@examcraft-test.com`
   - Password: `TestPass@123`
   - Try: Create question, view papers

3. **Login as Reviewer**
   - Email: `reviewer.dtc@examcraft-test.com`
   - Password: `TestPass@123`
   - Try: Review submitted paper, approve/reject

4. **Login as Admin**
   - Email: `admin.dtc@examcraft-test.com`
   - Password: `TestPass@123`
   - Try: View users, departments, subjects

5. **Login as Super Admin**
   - Email: `superadmin@examcraft-test.com`
   - Password: `TestPass@123`
   - Try: Access admin dashboard, view all institutions
