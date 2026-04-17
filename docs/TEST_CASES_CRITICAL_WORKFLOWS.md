# Test Cases - ExamCraft Critical Workflows

**Test Strategy:** Combination of unit tests, integration tests, and E2E tests  
**Coverage Target:** 80%+ for new modules  
**Testing Frameworks:** Jest (unit), Supertest (integration), Playwright (E2E)  

---

## TEST CASE 1: Academic Structure - Department Management

### TC-AS-001: Create Department Successfully
**Priority:** P0 (Critical)  
**Type:** Integration Test  
**Preconditions:** User authenticated with admin role

**Test Steps:**
1. Send POST request to /api/academic-structure/departments
2. Payload: { name: 'Computer Science', code: 'CS', description: 'CS Department' }
3. Include institution_id in headers

**Expected Results:**
- HTTP 201 Created
- Response contains department with auto-generated UUID
- Database record created with correct institution_id
- created_at and updated_at timestamps set

**Assertions:**
`	ypescript
expect(response.status).toBe(201);
expect(response.body.name).toBe('Computer Science');
expect(response.body.code).toBe('CS');
expect(response.body.institution_id).toBe(testInstitutionId);
expect(response.body.id).toBeDefined();
`

---

### TC-AS-002: Prevent Duplicate Department Codes
**Priority:** P0 (Critical)  
**Type:** Integration Test

**Test Steps:**
1. Create department with code 'CS'
2. Attempt to create second department with same code 'CS'

**Expected Results:**
- First creation: HTTP 201
- Second creation: HTTP 409 Conflict
- Error message: 'Department code already exists'

**Assertions:**
`	ypescript
expect(secondResponse.status).toBe(409);
expect(secondResponse.body.message).toContain('already exists');
`

---

### TC-AS-003: RLS Policy - Tenant Isolation
**Priority:** P0 (Critical)  
**Type:** E2E Test (Playwright)

**Test Steps:**
1. Login as user from Institution A
2. Navigate to Departments page
3. Verify only Institution A departments visible
4. Attempt to access Institution B department via API call

**Expected Results:**
- UI shows only Institution A departments
- API call to Institution B department returns 403 Forbidden or empty result

**Playwright Test:**
`	ypescript
test('tenant isolation for departments', async ({ page }) => {
  await login(page, 'user@institution-a.com');
  await page.goto('/dashboard/academic-structure/departments');
  
  const departments = await page.locator('[data-testid=\"department-row\"]').count();
  expect(departments).toBeGreaterThan(0);
  
  // Verify no cross-tenant data leakage
  const apiResponse = await page.request.get('/api/academic-structure/departments', {
    headers: { 'x-institution-id': 'institution-b-id' }
  });
  expect(apiResponse.status()).toBe(403);
});
`

---

### TC-AS-004: Update Department Head
**Priority:** P1 (High)  
**Type:** Integration Test

**Test Steps:**
1. Create department without head_user_id
2. Update department with valid user UUID as head
3. Verify update persisted

**Expected Results:**
- HTTP 200 OK
- head_user_id updated in database
- updated_at timestamp changed

---

### TC-AS-005: Delete Department with Dependencies
**Priority:** P1 (High)  
**Type:** Integration Test

**Test Steps:**
1. Create department
2. Create course linked to department
3. Attempt to delete department

**Expected Results:**
- Option A: HTTP 409 Conflict with message 'Cannot delete department with associated courses'
- Option B: Cascading delete removes department and all related courses (if ON DELETE CASCADE configured)

---

## TEST CASE 2: Batch Management with Enrollments

### TC-BM-001: Create Batch with Capacity
**Priority:** P0  
**Type:** Integration Test

**Test Steps:**
1. Create course first
2. Create batch with: { name: 'Section A', code: 'CS101-A', course_id: courseId, academic_year: '2024-2025', semester: 1, capacity: 60 }

**Expected Results:**
- HTTP 201 Created
- enrolled_count initialized to 0
- status defaults to 'active'

---

### TC-BM-002: Enroll Student in Batch
**Priority:** P0  
**Type:** Integration Test

**Test Steps:**
1. Create batch with capacity 60
2. Enroll 60 students (loop)
3. Attempt to enroll 61st student

**Expected Results:**
- First 60 enrollments: HTTP 201
- 61st enrollment: HTTP 409 Conflict with message 'Batch capacity exceeded'
- enrolled_count updated to 60

**Code Example:**
`	ypescript
for (let i = 1; i <= 60; i++) {
  const response = await enrollStudent(batchId, \student\@test.com\);
  expect(response.status).toBe(201);
}

const overflowResponse = await enrollStudent(batchId, 'student61@test.com');
expect(overflowResponse.status).toBe(409);
expect(overflowResponse.body.message).toContain('capacity exceeded');
`

---

### TC-BM-003: Faculty Assignment to Batch
**Priority:** P1  
**Type:** Integration Test

**Test Steps:**
1. Create faculty user
2. Assign faculty to batch as primary instructor
3. Verify assignment created

**Expected Results:**
- HTTP 201 Created
- is_primary set to true
- Can query batches by faculty user_id

---

## TEST CASE 3: Paper Generation Engine

### TC-PG-001: Generate Paper with Difficulty Distribution
**Priority:** P0 (Critical)  
**Type:** Unit Test + Integration Test

**Test Steps:**
1. Populate question bank with 100 questions (30 easy, 50 medium, 20 hard)
2. Generate paper with template requesting: 10 questions, distribution {easy: 0.3, medium: 0.5, hard: 0.2}

**Expected Results:**
- Paper generated with exactly 10 questions
- 3 easy questions (30%)
- 5 medium questions (50%)
- 2 hard questions (20%)
- No duplicate questions

**Unit Test:**
`	ypescript
it('should respect difficulty distribution', () => {
  const questions = mockQuestionBank(100);
  const result = generationService.distributeByDifficulty(questions, 10, {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2
  });
  
  expect(result.length).toBe(10);
  expect(result.filter(q => q.difficulty === 'easy').length).toBe(3);
  expect(result.filter(q => q.difficulty === 'medium').length).toBe(5);
  expect(result.filter(q => q.difficulty === 'hard').length).toBe(2);
});
`

---

### TC-PG-002: Handle Insufficient Questions Gracefully
**Priority:** P0  
**Type:** Integration Test

**Test Steps:**
1. Question bank has only 5 easy questions
2. Request paper with 10 easy questions

**Expected Results:**
- HTTP 200 with warning in response
- Response includes: { success: true, warnings: ['Insufficient easy questions. Generated 5 of 10 requested'], paper: {...} }
- Paper contains 5 easy + redistributed remaining 5 from other difficulties

---

### TC-PG-003: No Duplicate Questions in Same Paper
**Priority:** P0  
**Type:** Unit Test

**Test Steps:**
1. Generate paper with 50 questions from bank of 100
2. Check for duplicates

**Expected Results:**
- All question IDs unique
- Set size equals array length

**Assertion:**
`	ypescript
const questionIds = paper.sections.flatMap(s => s.questions.map(q => q.id));
const uniqueIds = new Set(questionIds);
expect(uniqueIds.size).toBe(questionIds.length);
`

---

### TC-PG-004: Section Rule Validation
**Priority:** P1  
**Type:** Integration Test

**Test Steps:**
1. Template specifies Section A: 10 MCQs, 2 marks each (total 20 marks)
2. Generate paper from template

**Expected Results:**
- Section A contains exactly 10 questions
- All questions are MCQ type
- Section total_marks = 20
- Each question has marks = 2

---

## TEST CASE 4: Approval Workflow State Machine

### TC-AW-001: Valid State Transitions
**Priority:** P0 (Critical)  
**Type:** Unit Test

**Test Steps:**
Test all valid transitions:
1. draft → submitted
2. submitted → under_review
3. under_review → approved
4. under_review → rejected
5. approved → published

**Expected Results:**
- All transitions succeed with HTTP 200
- Status updated correctly
- approval_history entry created for each transition

**Unit Test:**
`	ypescript
it('should allow valid state transitions', async () => {
  const request = await createApprovalRequest('draft');
  
  // draft -> submitted
  await workflowService.transition(request.id, 'submitted', reviewerId, 'faculty');
  expect(request.status).toBe('submitted');
  
  // submitted -> under_review
  await workflowService.transition(request.id, 'under_review', headId, 'academic_head');
  expect(request.status).toBe('under_review');
  
  // under_review -> approved
  await workflowService.transition(request.id, 'approved', headId, 'academic_head');
  expect(request.status).toBe('approved');
});
`

---

### TC-AW-002: Invalid State Transition Rejected
**Priority:** P0  
**Type:** Unit Test

**Test Steps:**
1. Create approval request with status 'draft'
2. Attempt to transition directly to 'published' (skip intermediate states)

**Expected Results:**
- HTTP 400 Bad Request
- Error message: 'Invalid status transition from draft to published'
- Status remains 'draft'

---

### TC-AW-003: Role-Based Permission Enforcement
**Priority:** P0  
**Type:** Integration Test

**Test Steps:**
1. Create approval request with status 'under_review'
2. Attempt to approve as 'faculty' role (not allowed, requires 'academic_head')

**Expected Results:**
- HTTP 403 Forbidden
- Error message: 'Role faculty not allowed to perform this transition'
- Status unchanged

---

### TC-AW-004: Approval History Audit Trail
**Priority:** P1  
**Type:** Integration Test

**Test Steps:**
1. Create approval request
2. Perform 3 status transitions
3. Query approval_history table

**Expected Results:**
- 3 history entries created
- Each entry contains: previous_status, new_status, changed_by, changed_at, metadata
- Timestamps in chronological order

---

## TEST CASE 5: PDF/DOCX Export Service

### TC-EX-001: PDF Generation with Branding
**Priority:** P0  
**Type:** Integration Test

**Test Steps:**
1. Upload institution logo to storage
2. Generate paper
3. Request PDF export

**Expected Results:**
- HTTP 200 with download URL
- PDF contains institution logo in header
- PDF formatted correctly (A4 size, proper margins)
- File size < 5MB
- Download URL is signed and expires in 1 hour

---

### TC-EX-002: DOCX Editable Format
**Priority:** P1  
**Type:** Integration Test

**Test Steps:**
1. Generate paper
2. Request DOCX export
3. Download and open in Microsoft Word

**Expected Results:**
- HTTP 200 with download URL
- DOCX opens without errors
- All text editable
- Tables properly formatted
- Images (if any) embedded correctly

---

### TC-EX-003: Export Storage and Tracking
**Priority:** P1  
**Type:** Integration Test

**Test Steps:**
1. Export paper as PDF
2. Check Supabase Storage bucket
3. Query exports tracking table

**Expected Results:**
- File stored in exports/{institution_id}/{paper_id}.pdf
- Tracking entry created with: user_id, paper_id, format, file_path, downloaded_count = 0
- Signed URL generated successfully

---

## TEST CASE 6: Performance & Load Testing

### TC-PERF-001: Department List Pagination
**Priority:** P2  
**Type:** Performance Test

**Test Steps:**
1. Create 1000 departments
2. Request page 1 with limit 50

**Expected Results:**
- Response time < 200ms
- Returns exactly 50 departments
- Total count header present (1000)
- Next page link provided

---

### TC-PERF-002: Paper Generation Under Load
**Priority:** P2  
**Type:** Load Test

**Test Steps:**
1. Simulate 10 concurrent paper generation requests
2. Measure response times

**Expected Results:**
- Average response time < 3 seconds
- No timeouts
- All papers generated successfully
- Memory usage stable (< 512MB per request)

---

### TC-PERF-003: RLS Policy Performance
**Priority:** P2  
**Type:** Performance Test

**Test Steps:**
1. Create institution with 10,000 records across all tables
2. Query as authenticated user
3. Measure query time

**Expected Results:**
- Query time < 500ms (indexes working)
- Correct filtering applied (only user's institution)
- No N+1 query issues

---

## TEST EXECUTION CHECKLIST

### Unit Tests
- [ ] All services have unit tests
- [ ] Mock external dependencies (Supabase, notifications)
- [ ] Test edge cases (empty arrays, null values, boundary conditions)
- [ ] Coverage report generated (target: 80%+)
- [ ] Tests run in CI pipeline

### Integration Tests
- [ ] API endpoints tested with real database
- [ ] Authentication and authorization verified
- [ ] RLS policies validated
- [ ] Transaction rollback on errors tested
- [ ] Database constraints enforced

### E2E Tests (Playwright)
- [ ] Critical user workflows tested end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive layouts verified
- [ ] Accessibility checks (axe-core integration)
- [ ] Visual regression tests (optional)

### Performance Tests
- [ ] Load testing with k6 or Artillery
- [ ] Database query optimization verified
- [ ] Caching strategies tested
- [ ] Memory leak detection
- [ ] API rate limiting tested

---

## TEST DATA MANAGEMENT

### Seed Data Script
`	ypescript
// scripts/seed-test-data.ts
async function seedTestData() {
  // Create test institution
  const institution = await createInstitution('Test University');
  
  // Create departments
  await createDepartments(institution.id, 10);
  
  // Create courses
  await createCourses(institution.id, 50);
  
  // Create batches
  await createBatches(institution.id, 100);
  
  // Create question bank
  await createQuestions(institution.id, 1000);
  
  console.log('Test data seeded successfully');
}
`

### Test Data Cleanup
`	ypescript
afterEach(async () => {
  // Clean up test data after each test
  await supabase.from('institution_batches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('institution_courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // ... cleanup other tables
});
`

---

## CONTINUOUS INTEGRATION PIPELINE

### GitHub Actions Workflow
`yaml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm db:migrate
      - run: pnpm test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:e2e
`

---

**Test Plan Created:** 2026-04-04  
**Next Review:** After Sprint 1 completion  
**Maintenance:** Update test cases when requirements change
