# Paying Customer Gaps

Assessment of essential features required before commercial launch. Severities: 🔴 Blocker | 🟡 Important.

## 🔴 Critical Blockers
- **Analytics UI**: Backend exists, but frontend dashboard is missing. Admins need operational visibility from Day 1.
- **Bulk Import Frontend**: Faculty require a UI for Excel/CSV uploads instead of raw API access.
- **Real AI Integration**: Transition syllabus generation from mocks to live Gemini or OpenAI APIs.

## 🟡 Important Gaps
- **DOCX Export**: Required for formal university submissions (PDF only currently).
- **Email Notifications**: Alerts for invitations, submissions, and approval status changes.
- **Audit Log UI**: Allow admins to view "who did what and when" via a dedicated log page.
- **Question CRUD**: Implement Edit and Archive (soft-delete) functionality in the UI.
- **API Throttling**: Add rate limiting to prevent brute-force attacks on auth and public routes.

## 🟢 Strategic Roadmap
- **Plan Enforcement**: Stripe/Razorpay integration and usage limiting per tier.
- **Multi-language UI**: Support for regional languages (Hindi, etc.) for tier-2/3 institutions.

**Priority**: Fix Analytics and Bulk Import first—these are the top Day 1 requirements for all institutions.
