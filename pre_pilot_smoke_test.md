# ExamCraft Pre-Pilot Smoke Test Checklist

> **Environment**: Railway (API) + Vercel (Frontend) + Supabase Mumbai (`ap-south-1`)  
> **Run this checklist** before every demo and before each pilot institution onboards.  
> Mark each step ✅ Pass / ❌ Fail / ⚠️ Partial

---

## Flow 1 — Institution Signup → Onboarding → Invite Faculty

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 1.1 | Navigate to `/` (landing page) | Landing page loads without JS errors, no 404s on assets | |
| 1.2 | Click **Get Started / Sign Up** | Redirects to `/auth/signup` | |
| 1.3 | Register with a fresh email (e.g. `newadmin@testcollege.in`) | Account created, redirected to institution onboarding page | |
| 1.4 | Fill in Institution Name, Type, City, confirm legal name | All fields accept input without errors | |
| 1.5 | Submit onboarding form | Institution record created, redirected to `/dashboard` with Admin role | |
| 1.6 | Navigate to **Team Management → Invite Member** | Invite form renders | |
| 1.7 | Send invite to `faculty@testcollege.in` with role `faculty` | Invitation created; record visible in invitations list | |
| 1.8 | Open invite link in an incognito window | Invite preview page loads correctly with institution name and role | |
| 1.9 | Accept invite with new password | Faculty user created; redirected to Faculty Dashboard | |
| 1.10 | Log back in as Admin → Team → check members list | Both Admin and Faculty appear as active members | |

---

## Flow 2 — Faculty Adds Questions (Manual + Bulk Excel)

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 2.1 | Log in as Faculty | Faculty Dashboard loads correctly | |
| 2.2 | Navigate to **Question Bank → Add Question** | Question form renders with all fields | |
| 2.3 | Fill in: Title, Subject, Bloom Level = `Apply`, Difficulty = `Medium`, Tags | All fields accept values | |
| 2.4 | Submit the question | Question appears in question list with status `draft` | |
| 2.5 | Prepare an Excel/CSV file with 5+ question rows matching the expected schema | File is ready locally | |
| 2.6 | Click **Bulk Import** → upload the file | Questions imported: success message, count shown | |
| 2.7 | Verify imported questions appear in the Question Bank list | All 5+ questions visible with correct metadata | |
| 2.8 | Verify `institution_id` on all imported questions via Supabase table view | Every row contains correct `institution_id` for this tenant | |

> **Bulk import schema** (CSV headers): `title, subject, bloom_level, difficulty, tags, unit_number`

---

## Flow 3 — Academic Head Creates Paper from Cloned Global Template

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 3.1 | Log in as Academic Head | Head Dashboard loads | |
| 3.2 | Navigate to **Templates → Global Library** | Global templates listing renders | |
| 3.3 | Filter by Board = `CBSE` or Exam Type = `Midterm` | Filter narrows results correctly | |
| 3.4 | Click **Clone** on any global template | Clone action triggers; success toast shown | |
| 3.5 | Navigate to **My Templates** | Cloned template appears as `[Cloned] <original name>` with status `draft` | |
| 3.6 | Verify cloned template `institution_id` in Supabase | Matches current institution; `global_template` row is **untouched** | |
| 3.7 | Edit the cloned template (rename, adjust section marks) | Edits save without errors | |
| 3.8 | Publish the cloned template | Status changes to `published` | |
| 3.9 | Navigate to **Papers → Generate Paper** | Published template appears in blueprint selector | |
| 3.10 | Select template, enter paper title, click **Generate** | Paper created; redirected to Papers list with status `draft` | |

---

## Flow 4 — Approval Workflow: Draft → Submitted → Approved → Published

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 4.1 | As Faculty, open a paper in `draft` state | Paper detail view loads | |
| 4.2 | Click **Submit for Review** | `PATCH /content/papers/:id/actions` called; status changes to `submitted` | |
| 4.3 | Log in as Reviewer | Reviewer dashboard shows the submitted paper in pending queue | |
| 4.4 | Open the paper → click **Start Review** | Status transitions to `in_review` | |
| 4.5 | Add review comment → click **Approve** | Status changes to `approved`; `approved_at` timestamp set in DB | |
| 4.6 | Verify in Supabase: `institution_papers.status = 'approved'` | Row updated correctly | |
| 4.7 | As Academic Head → click **Publish** | Status changes to `published` | |
| 4.8 | Attempt to re-submit or re-open a `published` paper as a Faculty | Action rejected (403) — state machine enforces final lock | |

---

## Flow 5 — PDF Export with Institution Branding

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 5.1 | As Faculty/Head, open a paper in `approved` state | Paper detail view shows **Export PDF** button | |
| 5.2 | Click **Export PDF** | `GET /content/papers/:id/pdf` fires; browser download dialog opens | |
| 5.3 | Open downloaded PDF | File opens without corruption | |
| 5.4 | Verify institution name appears at top (Institution Header) | Correct institution name in H1 of PDF | |
| 5.5 | Verify paper title, duration, and total marks are shown | Metadata block rendered correctly | |
| 5.6 | Verify questions are numbered section-by-section | e.g. 1.1, 1.2 … 2.1, 2.2 — correct numbering | |
| 5.7 | Verify MCQ options render with a/b/c/d labels if question type is MCQ | Options listed under question text | |
| 5.8 | Verify footer reads ExamCraft branding text | Present at bottom of last page | |
| 5.9 | Try exporting a paper in `draft` state | Should either be blocked or clearly indicated as watermarked draft | |

---

## Flow 6 — Super Admin Sees All Tenants but Cannot Access Tenant Data

| # | Step | Expected Result | Status |
|---|------|-----------------|--------|
| 6.1 | Log in as `superadmin@examcraft-test.com` | Super Admin dashboard loads | |
| 6.2 | View Institutions list | All provisioned institutions listed with status, plan, user count | |
| 6.3 | View platform-level user count | Aggregate counts visible | |
| 6.4 | Attempt to call `GET /content/questions` **without** an `X-Institution-Id` header | 400 Bad Request — tenant context required | |
| 6.5 | Attempt to call `GET /content/questions` with **another tenant's** `institution_id` while authenticated as a member of a different institution | 403 Forbidden — RLS or guard rejects the request | |
| 6.6 | Verify in Supabase: Super Admin has **no rows** in `institution_users` for any live institution | DB constraint confirmed | |
| 6.7 | Check `audit_logs` table | Platform-level actions are being recorded | |

---

## Post-Checklist Sign-Off

| Item | Notes |
|------|-------|
| **Tester name** | |
| **Date tested** | |
| **Environment URL (API)** | `https://your-api.railway.app` |
| **Environment URL (Web)** | `https://your-app.vercel.app` |
| **Supabase region confirmed** | `ap-south-1` (Mumbai) ✓ |
| **Critical failures** | |
| **Go / No-Go for pilot** | |
