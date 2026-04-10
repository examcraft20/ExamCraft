# ExamCraft — Gaps Before First Paying Customer

> An honest assessment of what a real, paying institution would notice within the first 30 days.  
> Severities: 🔴 Blocker · 🟡 Important · 🟢 Nice-to-Have

---

## Critical Gaps (Paying institutions will hit these immediately)

### 🔴 1. No Analytics UI — Data Exists, Nothing to See (✅ FIXED)

**What's built:** The `GET /analytics/summary` endpoint returns tenant-scoped counts (questions, papers, pending approvals, published).

**What's missing:** There is no frontend page that displays this data. Academic Heads and Admins will see placeholder summary cards, not real numbers. An institution paying for software expects operational visibility from Day 1.

**Impact:** High — erodes trust immediately in a demo or paid trial.  
**Effort:** Medium — the API is ready; a dashboard page wiring up the endpoint is ~1–2 days of frontend work.  
**Fix:** Build an `AnalyticsDashboard` page for the Academic Head and Admin roles that calls `/analytics/summary` and renders the counts with trend indicators.

---

### 🔴 2. Bulk Question Import Has No Frontend UI (✅ FIXED)

**What's built:** `POST /content/questions/bulk` exists and accepts a JSON array of questions.

**What's missing:** There is no file upload UI. The faculty question list page has no "Import from Excel/CSV" button. Faculty cannot do bulk imports without API curl access.

**Impact:** High — bulk import is explicitly listed in MVP scope and is one of the most common faculty pain points. Without it, question bank setup is tedious.  
**Effort:** Medium — CSV parsing, column mapping UI, and a preview-before-import step is ~2–3 days.  
**Fix:** Build a `BulkImportModal` component that accepts CSV/Excel, parses it client-side using `papaparse` or `xlsx`, previews rows, and POSTs to the bulk endpoint.

---

### 🔴 3. AI Syllabus Generation is Fake (✅ FIXED)

**What's built:** `POST /content/ai/generate-questions` exists and calls `analyzeSyllabusAndGenerate` in `ContentService`.

**What's not real:** The implementation uses a fixed-time `setTimeout(3000ms)` delay with keyword-extraction string splitting. It is a static mock, not a real AI call. There is no OpenAI, Gemini, or any LLM integration.

**Impact:** High — if demoed or sold as "AI-powered", this is misleading. If a paying customer tries it, the output quality will be obvious.  
**Effort:** Low-Medium — dropping in an `openai` or `@google-cloud/vertexai` call to replace the hardcoded logic is ~1 day.  
**Fix:** Integrate the Gemini API (free tier) or OpenAI API. Pass the syllabus text as a system prompt and parse the structured JSON response into the existing `questions[]` format.

---

### 🟡 4. No DOCX Export — PDF Only (✅ FIXED)

**What's built:** `GET /content/papers/:id/pdf` returns a PDFKit-generated PDF.

**What's missing:** Many Indian colleges require `.docx` format for internal submission to examination cells. There is no `/docx` endpoint and no `docx` library wired up.

**Impact:** Medium-High — this will be requested by the first institution that uses the platform for formal exams.  
**Effort:** Medium — `docx` npm package generates Word documents from structured JSON. ~1–2 days.

---

### 🟡 5. No Email Notifications for Workflow Events (✅ FIXED)

**What's built:** Status transitions are stored in the database.

**What's missing:** No emails are sent when:
- A faculty member is invited to an institution
- A paper is submitted for review (reviewer gets no notification)
- A paper is approved or rejected (faculty gets no notification)

**Impact:** Medium — in a multi-user workflow without notifications, things get forgotten. Reviewers won't know papers are waiting.  
**Effort:** Medium — requires a transactional email provider (Resend, Sendgrid, or Supabase Edge Functions). ~2–3 days.

---

## Important-But-Not-Blocking Gaps

### 🟡 6. No Audit Log UI (✅ FIXED)

The `audit_logs` table exists in the schema. There is no page that reads and displays it. Admins cannot see "who did what and when." For institutions with compliance requirements (universities, government-affiliated colleges), this is mandatory.

**Fix:** A read-only `Audit Log` page in the admin dashboard, listing `actor, action, resource, timestamp`.  
**Effort:** Low (1 day — data is presumably being written; just needs a viewing UI).

---

### 🟡 7. Password Reset Flow Not Verified End-to-End (✅ FIXED)

Supabase provides password reset out-of-the-box, but the custom redirect URL (`SUPABASE_AUTH_REDIRECT_URL`) must be configured correctly for the production domain. If misconfigured, reset links take users to a Supabase generic page, breaking the branded experience.

**Fix:** Set `SUPABASE_AUTH_REDIRECT_URL=https://your-app.vercel.app/auth/reset-password` in Supabase dashboard and build a `/auth/reset-password` page that handles the Supabase token.  
**Effort:** Low (< 1 day).

---

### 🟡 8. No Question Edit or Delete (✅ FIXED)

The question bank supports Create and status-transition (draft → ready via review), but there is no `PATCH /content/questions/:id` to edit a question's text, and no soft-delete/archive endpoint callable from the UI.

**Fix:** Add `PATCH` and soft-delete (status = 'archived') endpoints in the ContentService/Controller and wire up Edit/Archive buttons in the question list UI.  
**Effort:** Low-Medium (1–2 days).

---

### 🟡 9. No Rate Limiting or Abuse Protection on the API (✅ FIXED)

All API routes are open to brute-force attempts. There is no `@nestjs/throttler` or IP-level rate limiting configured in `main.ts`.

**Fix:** `npm install @nestjs/throttler` and add `ThrottlerModule.forRoot([{ ttl: 60, limit: 30 }])` to `AppModule`. Apply `@UseGuards(ThrottlerGuard)` globally.  
**Effort:** Low (half a day).

---

## Strategic Gaps (Pre-Revenue, Not Pilot Blockers)

### 🟢 10. No Subscription / Plan Management

There is a `plan` field in `institutions.settings` (JSON), but there is no enforcement of plan limits (e.g. max questions, max users, max papers). Paying tiers can't be differentiated.

**When this matters:** Before charging the first institution.  
**Fix:** A `plan_limits` table + middleware that checks usage before allowing creates. Consider Stripe or Razorpay for billing.

---

### 🟢 11. No SLA / Uptime Commitment Documentation

Railway on the Hobby plan has no uptime SLA. If an institution's exam is tomorrow and the API is down, there is no remediation path.

**Fix:** Upgrade to Railway Pro (paid) or document "best-effort" SLA for pilot. Set up Uptime Robot or Better Uptime for monitoring.

---

### 🟢 12. English-Only UI

All labels, error messages, and button text are in English. Many tuition centers (especially in tier-2/3 Indian cities) have faculty more comfortable in Hindi or regional languages.

**Fix:** Not needed for pilot, but should be tracked for Phase 2.

---

## Honest Summary

| Category | Count | Urgency |
|----------|-------|---------|
| Blockers for a paying demo | 3 | Fix before commercial launch |
| Important but manageable | 3 | Fix within first paid month's sprint |
| Nice-to-have | 3 | Roadmap items |

**The single highest-leverage item to fix before a paying customer signs**: Build the **Analytics Dashboard UI** and the **Bulk Import frontend**. These are the two things every admin will open on Day 1 — and both have their backends already built and waiting.
