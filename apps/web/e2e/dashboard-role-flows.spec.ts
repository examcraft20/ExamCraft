import { expect, Page, test } from "@playwright/test";

function installTestSession(page: Page, email: string) {
  return page.addInitScript(({ accessToken, sessionEmail }) => {
    window.__EXAMCRAFT_TEST_SESSION__ = {
      accessToken,
      email: sessionEmail
    };
  }, {
    accessToken: "playwright-access-token",
    sessionEmail: email
  });
}

test("dashboard selector routes into the chosen institution workspace", async ({ page }) => {
  await installTestSession(page, "institution.admin@examcraft.test");

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());

    switch (url.pathname) {
      case "/api/auth/me":
        await route.fulfill({
          json: {
            user: {
              id: "user-admin",
              email: "institution.admin@examcraft.test",
              roleCodes: [],
              isSuperAdmin: false
            }
          }
        });
        return;
      case "/api/tenant/memberships":
        await route.fulfill({
          json: [
            {
              institutionUserId: "membership-1",
              institutionId: "inst-1",
              institutionName: "ExamCraft Test Institute",
              institutionSlug: "examcraft-test",
              institutionType: "college",
              displayName: "Institution Admin",
              roleCodes: ["institution_admin"]
            }
          ]
        });
        return;
      case "/api/tenant/context":
        await route.fulfill({
          json: {
            tenantContext: {
              institutionId: "inst-1",
              institutionUserId: "membership-1",
              roleCodes: ["institution_admin"],
              permissionCodes: ["users.manage", "users.invite"]
            }
          }
        });
        return;
      default:
        await route.fulfill({ json: {} });
    }
  });

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "ExamCraft Test Institute" })).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/institution_admin\?institutionId=inst-1$/);
  await expect(page.getByText("Institution operations hub")).toBeVisible();
});

test("academic head can approve a question from the review queue", async ({ page }) => {
  await installTestSession(page, "academic.head@examcraft.test");

  let questionStatus = "draft";
  let questionReviewComment: string | null = null;

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === "/api/auth/me") {
      await route.fulfill({
        json: {
          user: {
            id: "user-academic",
            email: "academic.head@examcraft.test",
            roleCodes: [],
            isSuperAdmin: false
          }
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/memberships") {
      await route.fulfill({
        json: [
          {
            institutionUserId: "membership-academic",
            institutionId: "inst-1",
            institutionName: "ExamCraft Test Institute",
            institutionSlug: "examcraft-test",
            institutionType: "college",
            displayName: "Academic Head",
            roleCodes: ["academic_head"]
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/tenant/context") {
      await route.fulfill({
        json: {
          tenantContext: {
            institutionId: "inst-1",
            institutionUserId: "membership-academic",
            roleCodes: ["academic_head"],
            permissionCodes: ["papers.review", "papers.approve", "papers.reject"]
          }
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/dashboard-summary") {
      await route.fulfill({
        json: {
          totals: {
            users: 12,
            invitations: 3,
            questions: 1,
            templates: 1
          },
          recentInvitations: [
            {
              id: "invite-1",
              email: "faculty@examcraft.test",
              roleCode: "faculty",
              status: "pending",
              createdAt: "2026-04-03T10:00:00.000Z"
            }
          ],
          recentQuestions: [],
          recentTemplates: []
        }
      });
      return;
    }

    if (url.pathname === "/api/content/questions" && method === "GET") {
      await route.fulfill({
        json: [
          {
            id: "question-1",
            title: "Solve the quadratic equation x^2 - 5x + 6 = 0",
            subject: "Mathematics",
            bloomLevel: "Apply",
            difficulty: "medium",
            tags: ["algebra"],
            status: questionStatus,
            reviewComment: questionReviewComment,
            reviewHistory: [],
            createdAt: "2026-04-03T10:00:00.000Z"
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/content/templates" && method === "GET") {
      await route.fulfill({
        json: [
          {
            id: "template-1",
            name: "Midterm Algebra",
            examType: "Midterm",
            durationMinutes: 90,
            totalMarks: 100,
            sections: [],
            status: "draft",
            createdAt: "2026-04-03T10:00:00.000Z"
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/content/questions/question-1/review" && method === "PATCH") {
      const body = route.request().postDataJSON() as { action: string; comment?: string };
      questionStatus = body.action === "approve" ? "ready" : "draft";
      questionReviewComment = body.comment ?? null;

      await route.fulfill({
        json: {
          id: "question-1",
          title: "Solve the quadratic equation x^2 - 5x + 6 = 0",
          subject: "Mathematics",
          bloomLevel: "Apply",
          difficulty: "medium",
          tags: ["algebra"],
          status: questionStatus,
          reviewComment: questionReviewComment,
          reviewHistory: [],
          createdAt: "2026-04-03T10:00:00.000Z"
        }
      });
      return;
    }

    await route.fulfill({ json: {} });
  });

  await page.goto("/dashboard/academic_head?institutionId=inst-1");
  await page.getByLabel("Review note").fill("Approved for release");
  await page.getByRole("button", { name: "Approve" }).first().click();

  await expect(page.getByText('Question "Solve the quadratic equation x^2 - 5x + 6 = 0" updated to ready.')).toBeVisible();
  await expect(page.getByText("Latest note: Approved for release")).toBeVisible();
  await expect(page.getByText("ready", { exact: true })).toBeVisible();
});

test("reviewer can record a comment in the review queue", async ({ page }) => {
  await installTestSession(page, "reviewer@examcraft.test");

  let reviewerComment: string | null = null;

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === "/api/auth/me") {
      await route.fulfill({
        json: {
          user: {
            id: "user-reviewer",
            email: "reviewer@examcraft.test",
            roleCodes: [],
            isSuperAdmin: false
          }
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/memberships") {
      await route.fulfill({
        json: [
          {
            institutionUserId: "membership-reviewer",
            institutionId: "inst-1",
            institutionName: "ExamCraft Test Institute",
            institutionSlug: "examcraft-test",
            institutionType: "college",
            displayName: "Reviewer",
            roleCodes: ["reviewer_approver"]
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/tenant/context") {
      await route.fulfill({
        json: {
          tenantContext: {
            institutionId: "inst-1",
            institutionUserId: "membership-reviewer",
            roleCodes: ["reviewer_approver"],
            permissionCodes: ["papers.review", "papers.approve", "papers.reject"]
          }
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/dashboard-summary") {
      await route.fulfill({
        json: {
          totals: {
            users: 12,
            invitations: 3,
            questions: 1,
            templates: 1
          },
          recentInvitations: [],
          recentQuestions: [],
          recentTemplates: []
        }
      });
      return;
    }

    if (url.pathname === "/api/content/questions" && method === "GET") {
      await route.fulfill({
        json: [
          {
            id: "question-2",
            title: "Explain stack vs queue",
            subject: "Data Structures",
            bloomLevel: "Understand",
            difficulty: "easy",
            tags: ["dsa"],
            status: "draft",
            reviewComment: reviewerComment,
            reviewHistory: [],
            createdAt: "2026-04-03T10:00:00.000Z"
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/content/templates" && method === "GET") {
      await route.fulfill({ json: [] });
      return;
    }

    if (url.pathname === "/api/content/questions/question-2/review" && method === "PATCH") {
      const body = route.request().postDataJSON() as { comment?: string };
      reviewerComment = body.comment ?? null;

      await route.fulfill({
        json: {
          id: "question-2",
          title: "Explain stack vs queue",
          subject: "Data Structures",
          bloomLevel: "Understand",
          difficulty: "easy",
          tags: ["dsa"],
          status: "draft",
          reviewComment: reviewerComment,
          reviewHistory: [],
          createdAt: "2026-04-03T10:00:00.000Z"
        }
      });
      return;
    }

    await route.fulfill({ json: {} });
  });

  await page.goto("/dashboard/reviewer_approver?institutionId=inst-1");
  await page.getByLabel("Reviewer comment").fill("Needs clearer rubric");
  await page.getByRole("button", { name: "Save comment" }).click();

  await expect(page.getByText('Question "Explain stack vs queue" reviewed as draft.')).toBeVisible();
  await expect(page.getByText("Latest note: Needs clearer rubric")).toBeVisible();
});

test("super admin can filter tenants and update institution status", async ({ page }) => {
  await installTestSession(page, "super.admin@examcraft.test");

  let institutionStatus = "trial";

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === "/api/auth/me") {
      await route.fulfill({
        json: {
          user: {
            id: "user-super",
            email: "super.admin@examcraft.test",
            roleCodes: ["super_admin"],
            isSuperAdmin: true
          }
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/platform-summary") {
      await route.fulfill({
        json: {
          totals: {
            institutions: 2,
            activeUsers: 18,
            pendingInvitations: 4,
            questions: 12,
            templates: 5
          },
          recentInstitutions: []
        }
      });
      return;
    }

    if (url.pathname === "/api/tenant/platform-institutions" && method === "GET") {
      await route.fulfill({
        json: [
          {
            id: "inst-1",
            name: "ExamCraft Test Institute",
            slug: "examcraft-test",
            institutionType: "college",
            status: institutionStatus,
            createdAt: "2026-04-03T10:00:00.000Z",
            usage: {
              activeUsers: 14,
              pendingInvitations: 2,
              questions: 8,
              templates: 3
            }
          },
          {
            id: "inst-2",
            name: "Beta Coaching",
            slug: "beta-coaching",
            institutionType: "coaching",
            status: "active",
            createdAt: "2026-04-02T10:00:00.000Z",
            usage: {
              activeUsers: 4,
              pendingInvitations: 2,
              questions: 4,
              templates: 2
            }
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/tenant/platform-audit-feed") {
      await route.fulfill({
        json: [
          {
            id: "audit-1",
            institutionId: "inst-1",
            institutionName: "ExamCraft Test Institute",
            eventType: "institution.created",
            title: "Institution created: ExamCraft Test Institute",
            status: institutionStatus,
            createdAt: "2026-04-03T10:00:00.000Z"
          }
        ]
      });
      return;
    }

    if (url.pathname === "/api/tenant/platform-institutions/inst-1/status" && method === "PATCH") {
      const body = route.request().postDataJSON() as { status: string };
      institutionStatus = body.status;

      await route.fulfill({
        json: {
          id: "inst-1",
          name: "ExamCraft Test Institute",
          slug: "examcraft-test",
          institutionType: "college",
          status: institutionStatus,
          createdAt: "2026-04-03T10:00:00.000Z",
          usage: {
            activeUsers: 14,
            pendingInvitations: 2,
            questions: 8,
            templates: 3
          }
        }
      });
      return;
    }

    await route.fulfill({ json: {} });
  });

  await page.goto("/dashboard/super_admin");
  await page.getByLabel("Search institutions").fill("examcraft");
  await expect(page.locator("strong", { hasText: "ExamCraft Test Institute" }).first()).toBeVisible();
  await page.getByLabel("Lifecycle status").selectOption("suspended");
  await page.getByLabel("Platform note").fill("Billing follow-up pending");
  await page.getByRole("button", { name: "Save tenant status" }).click();

  await expect(page.getByText('Institution "ExamCraft Test Institute" updated to suspended.')).toBeVisible();
  await expect(page.locator(".dashboard-role-pill", { hasText: "suspended" }).first()).toBeVisible();
});
