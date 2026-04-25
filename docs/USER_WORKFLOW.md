# ExamCraft - Detailed User Workflows

> **Note:** There is no Student persona in ExamCraft. The platform’s scope ends at paper generation, export (PDF/DOCX), and institutional distribution.

This document outlines the detailed day-to-day workflows and lifecycle processes for the various personas interacting with the ExamCraft platform. It serves as a guide to understanding how features connect together to accomplish core tasks.

---

## 1. General User Workflows

### Workflow: Account Recovery
1. **Initiation:** User clicks "Forgot Password" on the login screen.
2. **Email Sent:** System sends a secure, time-bound password reset link to the user's registered email.
3. **Reset:** User clicks the link, enters a new password, and regains access to their workspace.

---

## 2. Institution Administrator (`institution_admin`)

The Institution Administrator is typically the first individual to access ExamCraft for their organization. Their workflows center around setup, configuration, and managing the workspace.

### Workflow: Institution Onboarding & Setup
1. **Registration:** Admin signs up via `/onboarding/institution`.
2. **Details:** Provides institution name, type (e.g., University, School, Coaching), and primary contact details.
3. **Workspace Initialization:** A new tenant workspace is created, a `free` subscription is initiated, and the dashboard becomes accessible.
4. **Branding:** Admin navigates to Settings -> Branding to upload the institution's logo, set brand colors, and configure header/footer text for paper exports.

### Workflow: User Management & Invitations
1. **Single Invite:** Admin navigates to the Team Management dashboard, inputs the email of the prospective member, and selects a role (`academic_head`, `faculty`, or `reviewer_approver`).
2. **Bulk Invite (Large Institutions):** Admin uploads a CSV (Columns: `email`, `role`) to send batch invitations simultaneously.
3. **Tracking & Notification:** The system sends an email invitation with a secure join link to the prospective user. Admin monitors the state of invitations (`pending`, `accepted`, `expired`, `revoked`).
4. **Member Supervision:** If a user departs or changes departments, Admin revokes their access or modifies their role via the User Management panel.

### Workflow: Subscription Upgrades
1. **Initiation:** Admin navigates to Settings -> Billing to view the current tier.
2. **Upgrade Selection:** Selects a higher tier (e.g., Growth or Enterprise) to increase seat limits or unlock advanced AI features.
3. **Payment & Provisioning:** Processes payment through the billing portal. The system instantly provisions the extended limits to the workspace.

---

## 3. Academic Head / HOD (`academic_head`)

The Academic Head is responsible for setting up the organizational structure of the institution's curriculum and maintaining high-level oversight over content generation.

### Workflow: Academic Structure Creation
1. **Create Departments:** Goes to Academic Structure and adds Departments (e.g., Computer Science).
2. **Create Courses & Batches:** Adds Courses linked to Departments (e.g., B.Tech CS) and active Batches (e.g., CS-2024-2028).
3. **Curriculum Mapping:** Adds Subjects and links them to the appropriate Courses, defining credit hours and subject codes.

### Workflow: Global Template Acquisition
1. **Browse Repository:** Visits the Global Template Library.
2. **Review:** Searches for standardized boards or university formats (e.g., CBSE Class 12, standard undergraduate technical format).
3. **Clone:** Clones targeted Global Templates into the institution's localized workspace as starting points for Paper Blueprints.

### Workflow: Oversight & Final Export
1. **Dashboard Monitoring:** Tracks paper generation progress across various subjects and batches.
2. **Download Final Papers:** Academic Head can locate `published` papers and download the final branded PDF/DOCX for physical printing or external distribution.

---

## 4. Faculty Member (`faculty`)

The Faculty Member performs the bulk of day-to-day content creation. Their primary focus is populating the question bank, creating specific Paper Blueprints, and generating the actual papers.

### Workflow: Question Bank Population
Faculty have three distinct ways to populate the bank:
- **Manual Entry:** Inputs individual questions specifying metadata (Marks, BLOOM taxonomy level, Tags, Subject mapping).
- **Bulk Import (CSV):** Maps existing legacy questions to ExamCraft's CSV format and uploads a batch of questions simultaneously.
- **AI-Assisted Generation:**
  1. Uploads a PDF syllabus or study material to ExamCraft.
  2. Uses Gemini AI to extract key syllabus topics. *(Fallback: If the AI API fails or cannot extract topics, the system falls back to prompting the user to manually enter topics or retry the file upload.)*
  3. Uses AI to automatically generate draft questions of specified difficulty and marks based on the extracted topics.
  4. Reviews, edits, and finalizes AI-generated questions into the standard question bank.

### Workflow: Designing Paper Blueprints
1. **Drafting a Blueprint:** Selects a Subject and creates a new Paper Blueprint.
2. **Section Definition:** Sets global attributes (total marks, duration) and defines specific sections (e.g., Section A: 10 MCQs worth 1 mark each; Section B: 5 Descriptive questions worth 10 marks each).
3. **Difficulty Mix:** Configures the difficulty distribution algorithm for random question pulling (e.g., 20% Easy, 50% Medium, 30% Hard).
4. **Submit for Approval:** Submits the blueprint. This dispatches an in-app notification and email to the Reviewer/Approver queue holding a `submitted` status.

### Workflow: Paper Generation & Export
1. **Trigger Generation:** Selects an approved Paper Blueprint and clicks "Generate Paper".
2. **Algorithm Execution:** The backend RPC randomly selects questions from the bank that meet the exact section, marks, and difficulty specifications of the blueprint. *(Fallback: If the question pool is exhausted or lacks matching criteria, the UI displays a warning specifying which section fell short, generated as a partial draft that requires manual intervention).*
3. **Review Draft Paper:** The generated document sits in a formal `draft` status. Faculty views the assembled Draft Paper, swapping out any individual questions if desired. 
4. **Re-generation:** While in `draft` status, Faculty can trigger "Regenerate," which discards the current selection and pulls a fresh set of questions based on the blueprint.
5. **Submit for Approval:** Pushes the final Draft Paper into the Review workflow (status becomes `submitted`), triggering a notification to reviewers.
6. **Final Export:** Once approved (status becomes `published`), the Faculty exports the final paper as an institution-branded PDF or DOCX file.

---

## 5. Reviewer / Approver (`reviewer_approver`)

The Reviewer ensures academic rigor and quality control. They exist as a quality gate between raw content creation and final publication.

### Workflow: Content Review Pipeline
1. **Notification/Queue Management:** Reviewer receives an in-app notification and email digest. They log into the dashboard and view items in the "Awaiting Review" queue.
2. **Evaluation:** Reads the submitted content (Question, Paper Blueprint, or Draft Paper). For papers, this includes checking overall balance, difficulty, and adherence to the syllabus.
3. **Decision & Feedback (State Transitions):**
   - **Approve:** Content transitions directly: `submitted → approved` (or `published` for papers). The author is notified.
   - **Reject (with Feedback):** Content transitions: `submitted → rejected → draft`. The content is bumped back to the author with attached reviewer comments (e.g., "Question 4 is out of syllabus, please replace"). The author receives an alert to revise and resubmit.

>*State Transition Summary for Approval Flows:*
> **Happy Path:** `draft` → `submitted` → `approved` → `published`
> **Rejection Loop:** `submitted` → `rejected` → `draft` → (author edits) → `submitted`

---

## 6. Platform Operator (`super_admin`)

The Platform Operator (Super Admin) is an internal ExamCraft employee or system administrator. They operate above the tenant hierarchy.

### Workflow: Global Management
- **Tenant Support:** Accesses configurations and audit logs across all tenant institutions to resolve escalated issues and run global compliance exports.
- **Library Maintenance:** Responsible for creating, vetting, and publishing standardized blueprints to the Global Template Library.

---

## 7. End-to-End Process Integration Lifecycle

To understand how these workflows intersect to create a final product, here is the lifecycle of a single Final Exam Paper:

**Phase A: Setup & Structure**
1. **(Admin)** Sets up the workspace and invites the **(Academic Head)** and **(Faculty)**.
2. **(Academic Head)** Creates the target Subject (e.g., "Data Structures").

**Phase B: Content Creation & Review**
3. **(Faculty)** Uploads legacy "Data Structures" questions and generates new ones via AI.
   - *Phase B.5 (Quality Gate):* Questions are submitted to the Reviewer's queue. The **(Reviewer)** evaluates and approves individual questions so they become eligible for paper generation.
4. **(Faculty)** Creates an "End of Semester Data Structures" Paper Blueprint and submits it.

**Phase C: Blueprint Approval**
5. **(Reviewer)** Receives a notification, reviews the blueprint, and Approves it.

**Phase D: Paper Generation & The Rejection Loop**
6. **(Faculty)** Clicks Generate on the approved blueprint, reviews the assembled Draft Paper, and Submits it.
7. **(Reviewer)** Evaluates the Draft Paper.
   - *Alternate Path (Rejection):* The Reviewer finds an issue, Rejects it with feedback. The paper goes back to `draft`. The Faculty swaps the problematic question and Submits it again.
8. **(Reviewer)** Approves the Draft Paper (transitions to `published` state).

**Phase E: Finalization**
9. **(Faculty or Academic Head)** Downloads the 100% finished (`published`), institution-branded PDF and sends it to the printer/distribution center.

---

## 8. Audit & Compliance Controls

ExamCraft positions data integrity and accountability as core features. Every substantive mutation in the system is logged automatically.

### Tracked Events
- **Logins & Auth:** Sign-ins, password resets.
- **Content Modifications:** Creation, editing, archiving of Questions, Paper Blueprints, and Papers.
- **Approvals Status:** All `submitted`, `approved`, and `rejected` transitions (along with the decision maker's ID).
- **User Management:** Inviting, role changing, and revoking user access.

### Log Entry Structure
Each audit trail row captures:
- `timestamp`: Precise time of action.
- `actor_id`: The ID of the user performing the action.
- `action`: The exact event (e.g., `PAPER_APPROVED`).
- `resource_id`: Reference to the mutated entity.
- `metadata`: A JSON payload detailing the specific changes (e.g., "Changed difficulty from Medium to Hard").

### Access Control
- **Institution Admins** have read-only access to their tenant’s Audit Logs dashboard, allowing them to pinpoint operational bottlenecks or track down unapproved syllabus changes.
- **Super Admins** can export logs for system-wide compliance requirements.
