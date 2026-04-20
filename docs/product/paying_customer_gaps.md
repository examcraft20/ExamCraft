# Paying Customer Gaps

> **Updated:** April 18, 2026  
> **Context:** Assessment of remaining gaps between current production state and commercial readiness.  
> **Severity:** 🔴 Blocker | 🟡 Important | 🟢 Strategic

---

## Current State

ExamCraft has completed Phase 1–3 delivery. The following core capabilities are **fully implemented**:

- ✅ Multi-tenant architecture with RLS
- ✅ 5-role RBAC with 24 permissions
- ✅ Question bank (manual + bulk import + AI-generated)
- ✅ Template builder with section-wise configuration
- ✅ Paper generation with random question selection
- ✅ Multi-stage approval workflow (Questions, Templates, Papers)
- ✅ PDF and DOCX export with institution branding
- ✅ AI syllabus extraction (Gemini integration — live, not mocked)
- ✅ Platform admin dashboard for super admins
- ✅ Comprehensive audit logging (interceptors + DB triggers)
- ✅ Rate limiting (three-tier throttling)
- ✅ Invitation-based onboarding with seat limit enforcement

---

## 🔴 Critical Blockers

### 1. Payment Gateway Integration
No billing system is connected. The subscription schema (`free`, `growth`, `enterprise`) exists in the database but there is no payment processing, upgrade flow, or invoice generation.
- **Impact:** Cannot charge customers or enforce plan upgrades.
- **Fix:** Integrate Stripe or Razorpay with webhook handling.
- **Effort:** 2–3 weeks.

### 2. Student Portal
No student-facing interface exists. Institutions cannot deliver exam papers to students or manage exam schedules.
- **Impact:** Limited to faculty/admin use — excludes the largest user segment.
- **Fix:** New role, exam assignment model, timed delivery, and student dashboard.
- **Effort:** 4–6 weeks.

---

## 🟡 Important Gaps

### 3. Deep Analytics Frontend
Analytics backend exists (summary stats, usage trends, report exports) but the frontend dashboards for coverage analysis, difficulty distribution, and faculty load tracking are basic.
- **Impact:** Admins lack operational visibility into question bank health.
- **Fix:** Build interactive chart components for analytics endpoints.
- **Effort:** 2–3 weeks.

### 4. Global Template Seeding
The global template library supports listing and cloning, but no standardized templates (CBSE, IB, State Board) are pre-populated.
- **Impact:** New institutions start with an empty template library.
- **Fix:** Seed with 10–15 common exam formats.
- **Effort:** 1 week.

---

## 🟢 Strategic Roadmap

### 6. Multi-Language UI
Support for regional languages (Hindi, Tamil, etc.) for tier-2/3 institutions.
- **Priority:** Post-launch.

### 7. SSO (SAML/OIDC)
Enterprise customers may require single sign-on integration.
- **Priority:** Enterprise tier feature.

### 8. Advanced AI
Question quality scoring, answer key generation, plagiarism detection via embeddings.
- **Priority:** Differentiator for competitive positioning.

---

## Priority Order

| Priority | Item | Effort |
|---|---|---|
| 1 | Payment Gateway (Stripe/Razorpay) | 2–3 weeks |
| 2 | Student Portal | 4–6 weeks |
| 3 | Deep Analytics Frontend | 2–3 weeks |
| 4 | Email Notifications | 1 week |
| 5 | Global Template Seeding | 1 week |

> **Recommendation:** Payment integration and student portal are the two blockers for a commercial launch. All other items can be delivered incrementally post-launch.
