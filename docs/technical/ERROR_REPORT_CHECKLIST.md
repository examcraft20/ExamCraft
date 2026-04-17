# ExamCraft Error & Fix Checklist

**Status:** ❌ BUILD FAILED | **Health Score:** 4/10 ⚠️

## Critical Regressions (April 11)
1. **Build Error**: `demoInstitutionId` is undefined in `apps/web/lib/api/mock.ts:368`.
2. **JSX Failure**: Badge tests fail to parse JSX in `__tests__/components/badges.test.ts`.
3. **Assertion Mismatch**: `dashboard.test.ts` expects old role summary text.
4. **Null Handling**: `data-utilities.test.ts` crashes when passing `null` to `Object.keys()`.
5. **Undefined Logic**: `error-utils.test.ts` fails on `extractErrorMessage(undefined)`.

## Priority Backlog
- **Feature Flags**: Persist UI changes to the API (currently read-only).
- **Faculty Workspace**: Implement the "Save Draft" functionality for questions.
- **Accessibility**: Complete ARIA labeling for all dashboard forms.
- **Dependencies**: Update `TypeScript` to 6.0 and `Vitest` to 4.x.

## Summary
The build and test suite are currently blocking deployment. Total estimated fix time for critical regressions: **~25 minutes**.
