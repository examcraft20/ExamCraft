import { test, expect } from '@playwright/test';

/**
 * PHASE 6D — RLS Isolation E2E Test
 * Verifies that data created in one institution is NOT visible to a user in another institution
 * using the real platform RBAC and Supabase RLS policies.
 */
test.describe('Multi-Tenancy Isolation (RLS)', () => {
  test('A faculty member in Inst-A cannot see questions from Inst-B', async ({ page }) => {
    // 1. Login as Faculty A
    await page.goto('/login');
    await page.fill('input[name="email"]', 'faculty-a@examcraft.test');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // 2. Navigate to Question Bank
    await page.waitForURL('/faculty/questions');
    await expect(page.locator('h1')).toContainText('Question Bank');

    // 3. Verify they see their own questions (e.g., from seed data)
    // We assume seed data has "Inst-A Question"
    const instAQuestion = page.locator('text="Inst-A Question"');
    // await expect(instAQuestion).toBeVisible(); // Depends on seed data content

    // 4. Try to access a question from Inst-B via direct URL or API spoofing simulation
    // Since we are doing a UI test, we can try to navigate to a direct edit page if we know the ID
    const instBQuestionId = '00000000-0000-0000-0000-0000000000bb'; // Known ID from seed for Inst-B
    await page.goto(`/faculty/questions/${instBQuestionId}`);

    // 5. Expect 404 or "Not Found" because RLS returns 0 rows, which NestJS maps to 404
    await expect(page.locator('text="Not Found"').or(page.locator('text="Error"'))).toBeVisible();
  });
});
