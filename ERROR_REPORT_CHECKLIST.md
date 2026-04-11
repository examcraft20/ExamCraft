# ExamCraft Error Report & Fix Checklist

**Date:** April 11, 2026 (Initial)  
**Last Verified:** April 11, 2026 (Regressions Detected)  
**Project:** ExamCraft MVP  
**Current Health Score:** 4/10 ⚠️ (Regressions found after initial audit claimed 10/10)  
**Status:** ❌ BUILD FAILED - 1 compilation error, 4 test failures blocking deployment

---

## 🔴 NEW REGRESSIONS & FAILURES DETECTED (April 11, 2026)

**Build Status:** FAILED ❌  
**Tests Status:** 4 FAILURES ❌  
**Previous Claim:** "Build is production-ready"  
**Current Status:** Cannot build or run tests

### Regression #1 (Critical Build Failure)
- **File:** `apps/web/lib/api/mock.ts:368`
- **Issue:** `demoInstitutionId` is undefined at line 368
- **Error:** `Type error: Cannot find name 'demoInstitutionId'. Did you mean 'institutionId'?`
- **Context:** Variable defined at line 70 inside `createInitialDemoState()` function, used at line 368 outside function scope
- **Impact:** **BUILD FAILS** - Web app cannot compile
- **Severity:** 🔴 CRITICAL - Blocks any deployment
- **Status:** ❌ REQUIRES FIX

### Regression #2 (Test Failure - JSX Syntax)
- **File:** `apps/web/__tests__/components/badges.test.ts:8`
- **Issue:** JSX not recognized in test file
- **Error:** `Expected ">" but found "role"` - esbuild cannot parse JSX
- **Context:** Line 8: `render(<RoleBadge role="faculty" />);`
- **Impact:** **TEST FAILS TO PARSE** - Cannot run badge component tests
- **Root Cause:** Possibly vitest/esbuild configuration not handling JSX in test files
- **Status:** ❌ REQUIRES FIX

### Regression #3 (Test Failure - Assertion Mismatch)
- **File:** `apps/web/__tests__/dashboard.test.ts:47` (getRoleSummary test)
- **Issue:** Role summary description changed but test not updated
- **Error:** `expected 'Faculty authoring workspace' to be 'Question crafting studio'`
- **Context:** 
  - Test expects: `"Question crafting studio"` (old)
  - Code returns: `"Faculty authoring workspace"` (new - set at lib/dashboard.ts:239)
- **Root Cause:** Test not updated when description was changed in code
- **Impact:** **TEST FAILS** - Deployment verification fails
- **Status:** ❌ REQUIRES FIX

### Regression #4 (Test Failure - Null Handling)
- **File:** `apps/web/__tests__/utils/data-utilities.test.ts` (Object Validation)
- **Issue:** Object validation test passes null to Object.keys()
- **Error:** `Cannot convert undefined or null to object`
- **Test Line:** `isObjectEmpty(null)` where `isObjectEmpty()` calls `Object.keys(obj)`
- **Root Cause:** Test doesn't guard against null before using Object methods
- **Impact:** **TEST FAILS** - 1 test in data-utilities suite fails
- **Status:** ❌ REQUIRES FIX

### Regression #5 (Test Failure - Undefined Handling)
- **File:** `apps/web/__tests__/utils/error-utils.test.ts:27` (handles undefined errors)
- **Issue:** Test expects string "undefined" but got undefined value
- **Error:** `expected undefined to be 'undefined'`
- **Context:**
  - Test: `expect(extractErrorMessage(undefined)).toBe("undefined");`
  - Implementation: `JSON.stringify(undefined)` returns undefined (not a string), caught in error handler
- **Root Cause:** Function returns `"An unexpected error occurred"` for undefined, not `"undefined"`
- **Impact:** **TEST FAILS** - Error handling test fails
- **Status:** ❌ REQUIRES FIX

---

## Low Priority Issues (🟢 Backlog)

- [ ] **Incomplete Feature Flag API Integration** - `apps/web/components/admin/FeatureFlagsTable.tsx:69`
  - Issue: TODO comment - Feature flag changes not persisted to API
  - Impact: Feature flags readonly in UI, changes lost on refresh
  - Fix: Implement API call to persist feature flag changes
  - Status: ⏳ TODO - Nice to have, not blocking

- [ ] **Draft Save Functionality Missing** - `apps/web/components/dashboard/faculty/metadata-panel.tsx:162`
  - Issue: TODO comment - Save draft button not implemented
  - Impact: Users cannot save drafts, only submit/cancel available
  - Fix: Implement draft save functionality
  - Status: ⏳ TODO - Nice to have, not blocking

- [x] **Performance Optimization**
  - Issue: Repeated localStorage access in loops
  - Impact: Slow UI interactions
  - Fix: Cache localStorage values
  - Status: ✅ VERIFIED - No localStorage usage found (non-issue)

- [x] **Code Quality Cleanup**
  - Issue: Duplicated logic, unused imports, type assertions
  - Impact: Maintenance burden
  - Fix: Extract utilities, remove unused code, improve typing
  - Status: ✅ FIXED - INPUT_FIELD_CLASSES extracted, unused imports removed, type assertions fixed

- [x] **Missing Security Headers** - `apps/api/src/main.ts`
  - Issue: No explicit security headers configured
  - Impact: Vulnerable to common attacks
  - Fix: Add helmet middleware with proper headers
  - Status: ✅ VERIFIED - Security middleware already optimally configured

- [x] **Bundle Size Analysis**
  - Issue: No bundle analysis configured
  - Impact: Potential large production bundles
  - Fix: Add webpack-bundle-analyzer or similar
  - Status: ✅ VERIFIED - Sentry webpack plugin & turbo already optimize

---

## Verification Checklist

Current blocking issues:

- [ ] Build succeeds (`pnpm build`) - **FAILING** (1 critical error in mock.ts)
- [ ] All tests pass (`pnpm test`) - **FAILING** (4 test failures)

---

## Summary of Current Status

**Overall Health Score: 4/10** ⚠️  
**Build Status: FAILED** ❌  
**Tests Status: FAILED (4 failures)** ❌

**Blocking Issues: 5 regressions requiring fixes before deployment**
- 1 Critical build failure
- 4 Test failures

---

## Recommendations

**IMMEDIATE ACTIONS REQUIRED (Before Deployment)**

1. **Fix mock.ts undefined variable** (Blocks build)
   - Define `demoInstitutionId` at module level or use existing institution ID
   - Estimated: 5 minutes

2. **Fix JSX parsing in test files** (Blocks tests)
   - Configure vitest/esbuild to handle JSX in .test.ts/.test.tsx files
   - Estimated: 10 minutes

3. **Update dashboard role summary test** (Test assertion)
   - Update test to expect `"Faculty authoring workspace"` instead of `"Question crafting studio"`
   - Estimated: 2 minutes

4. **Fix null handling in data-utilities tests** (Test logic)
   - Add null/undefined check before calling Object.keys() or skip test for null
   - Estimated: 5 minutes

5. **Fix error-utils test expectation** (Test assertion)
   - Update expected value or fix extractErrorMessage to return "undefined" string for undefined values
   - Estimated: 3 minutes

**Total Estimated Fix Time: ~25 minutes**
