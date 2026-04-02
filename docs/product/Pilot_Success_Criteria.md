# ExamCraft Pilot Success Criteria

## Purpose

This document defines how `ExamCraft` will measure MVP readiness and pilot success for the first live institution rollout.

It exists to answer three questions clearly:

- when is the MVP ready to launch?
- what must work reliably for the pilot institution?
- how will we know the pilot is successful enough to continue productization?

## Pilot Definition

The initial pilot is a controlled rollout to one educational institution using the MVP for real academic assessment operations.

The pilot should validate:

- product usefulness
- workflow correctness
- tenant and permission safety
- operational reliability
- commercial readiness signals

## Pilot Institution Profile

The first pilot should ideally be:

- one college department or one coaching center branch
- 5 to 25 active staff users
- one institution tenant
- moderate question-bank size
- recurring internal tests or assessment cycles

This profile is intentionally narrow so the team can validate the core SaaS workflow without overextending scope.

## MVP Launch Readiness Criteria

The MVP is considered ready for pilot launch only when all of the following are true.

### Product Scope Readiness

- tenant onboarding is working end to end
- role-based access is enforced for all MVP flows
- academic structure setup is usable
- question bank CRUD and import are usable
- institution template creation works
- Global Template Library browse, preview, and clone works
- paper generation works for pilot-supported patterns
- approval workflow works end to end
- PDF export works reliably
- audit logging exists for critical actions

### Engineering Readiness

- all MVP database migrations are versioned and repeatable
- backend auth and tenant scoping are enforced server-side
- critical API routes are covered by integration tests
- pilot-critical UI flows are covered by end-to-end tests
- lint, typecheck, and test pipelines pass in CI
- staging environment is available and stable
- production environment secrets and storage are configured

### Operational Readiness

- support owner for the pilot is assigned
- issue reporting workflow is defined
- backup and recovery basics are confirmed
- monitoring exists for auth, API health, and export failures
- a known-issues list is documented before launch

## Must-Work Pilot Workflows

The pilot is not allowed to start unless these workflows work consistently in staging.

1. Institution admin signs in and configures the tenant.
2. Institution admin invites faculty and reviewer users.
3. Academic structure is created for at least one department and subject.
4. Faculty creates or imports questions.
5. Faculty selects a template or clones one from the Global Template Library.
6. Faculty generates a paper draft.
7. Reviewer or academic head reviews and approves or rejects the paper.
8. Institution admin publishes and exports the final paper.
9. Audit records exist for invitation, import, generation, approval, and publishing actions.

## Pilot Success Metrics

The pilot should be considered successful only if it meets measurable product and operational thresholds.

### Adoption Metrics

- at least 5 active institution users complete meaningful work in the system
- at least 2 distinct roles actively use the platform during the pilot
- at least 1 department or equivalent academic unit is configured fully

### Workflow Completion Metrics

- at least 1 full end-to-end exam cycle is completed in production
- at least 3 papers are generated successfully
- at least 2 papers complete the full review and publishing workflow
- at least 1 export per completed paper is generated without manual database intervention

### Reliability Metrics

- no cross-tenant data exposure incidents
- no critical permission bypass incidents
- no P0 production outages during the pilot window
- export success rate is at least 95 percent for pilot-supported formats
- core auth and paper workflow success rate is at least 95 percent

### Quality Metrics

- fewer than 5 unresolved high-severity defects remain open at the end of pilot week 2
- no blocker defects prevent the institution from completing the defined must-work workflows
- pilot users rate workflow usability as acceptable or better in post-pilot review

### Business Validation Metrics

- the pilot institution confirms the product is useful for continued use
- the institution identifies at least one real deployment or paid adoption path after the pilot
- the team captures a prioritized list of validated improvements for post-pilot development

## Failure Conditions

The pilot should be considered at risk or unsuccessful if any of the following happen:

- repeated auth or permission failures block real usage
- paper generation produces unreliable outputs for pilot-supported formats
- approval or publishing cannot be trusted operationally
- exports require repeated manual engineering intervention
- users abandon the system before completing one full assessment cycle
- severe defects indicate the MVP scope is still too broad or not stable enough

## Pilot Window Recommendation

Recommended pilot duration:

- 2 weeks for controlled validation
- extend to 4 weeks if the institution uses recurring weekly test workflows

## Post-Pilot Exit Criteria

At the end of the pilot, the team should make one of these decisions:

1. Proceed to broader rollout with a focused defect and refinement backlog.
2. Continue with one more controlled pilot after stabilizing key issues.
3. Pause rollout and reduce scope if core workflow reliability is still not acceptable.

## Final Recommendation

`ExamCraft` should treat pilot success as a combination of:

- working product flows
- secure tenant behavior
- reliable exports and approvals
- real institutional usage
- early commercial validation

This keeps the pilot anchored to both product quality and business usefulness.
