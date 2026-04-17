# ExamCraft Pre-Pilot Smoke Test

Run before every demo or pilot onboarding. Mark each: ✅ Pass | ❌ Fail.

## Core Flows
### 1. Onboarding & Invites
- [ ] Signup with fresh email creates institution record.
- [ ] Onboarding form redirects to Admin dashboard.
- [ ] Role-based invitations (Faculty) accepted via email link.
- [ ] Team list shows active members correctly.

### 2. Content Management
- [ ] Manual question entry saves as `draft`.
- [ ] Bulk import (JSON/CSV) populates list with correct metadata.
- [ ] Database verify: all rows have correct `institution_id`.

### 3. Templates & Generation
- [ ] Clone Global Library template (e.g., CBSE Midterm).
- [ ] Edit/Rename cloned template in "My Templates".
- [ ] Auto-generate paper matches blueprint structure.

### 4. Workflow Lifecycle
- [ ] Submit for review (Draft → Submitted).
- [ ] Reviewer approves with comments (Submitted → Approved).
- [ ] Final Lock: Published papers reject further faculty edits.

### 5. Branded Export
- [ ] PDF Export shows institution header and section numbering.
- [ ] MCQ options (a/b/c/d) render correctly for objective items.
- [ ] Metadata (Duration, Marks) matches current blueprint.

### 6. Security & Isolation
- [ ] Super Admin sees tenant counts but **cannot** access question data.
- [ ] Cross-tenant API calls reject without proper institution context.
