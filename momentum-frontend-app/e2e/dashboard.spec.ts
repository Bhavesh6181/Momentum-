import { test, expect } from "@playwright/test";

// Helper to authenticate session as an onboarded user to access dashboard
async function authenticateOnboardedSession(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "momentum-auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: "mock-user-id",
            username: "dashboardtestuser",
            email: "dashboard@momentum.com",
            college: "MIT",
          },
          accessToken: "mock-access-token-123",
          refreshToken: "mock-refresh-token-123",
          isAuthenticated: true,
          isLoggedIn: true,
        },
        version: 0,
      })
    );
    localStorage.setItem("momentum_refresh_token", "mock-refresh-token-123");
  });
}

test.describe("Dashboard Interaction Tests", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOnboardedSession(page);
  });

  test("Widget loading to loaded state transition", async ({ page }) => {
    // Navigate to dashboard - resolvers have staggered latency (500ms to 1500ms)
    await page.goto("/dashboard");

    // Verify skeleton loaders are visible initially
    const skeletons = page.locator(".animate-shimmer");
    await expect(skeletons.first()).toBeVisible();

    // Wait for all widgets to resolve (max delay is 1500ms)
    await page.waitForTimeout(2000);

    // Verify skeletons are gone and dashboard widgets have loaded
    await expect(skeletons).toHaveCount(0);
    await expect(page.locator("h1:has-text('Dashboard')")).toBeVisible();
    await expect(page.locator("h2:has-text('Deep Work Queue')")).toBeVisible();
  });

  test("Toggle goal completion in Deep Work Queue", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000); // Wait for loading to finish

    // Locate the first goal card
    const firstGoal = page.locator("text=Discrete Math Set #4").first();
    await expect(firstGoal).toBeVisible();

    // Verify initial state is "IN QUEUE"
    const statusText = page.locator("text=IN QUEUE").first();
    await expect(statusText).toBeVisible();

    // Click the goal to toggle completion
    await firstGoal.click();
    await page.waitForTimeout(400); // let mutation complete (200ms simulated latency)

    // Verify status has changed to "COMPLETED"
    const completedText = page.locator("text=COMPLETED").first();
    await expect(completedText).toBeVisible();

    // Click again to toggle back
    await firstGoal.click();
    await page.waitForTimeout(400);
    await expect(statusText).toBeVisible();
  });

  test("Start/Pause session in CurrentSessionCard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000); // Wait for load

    const timer = page.locator(".tabular-nums").first();
    await expect(timer).toBeVisible();

    // Get initial time
    const initialTime = await timer.innerText();

    // By default it starts as running, check if ticking works (1.5s wait)
    await page.waitForTimeout(1500);
    const timeAfterTick = await timer.innerText();
    expect(initialTime).not.toEqual(timeAfterTick);

    // Click PAUSE SESSION
    const pauseBtn = page.getByRole("button", { name: "PAUSE SESSION" });
    await pauseBtn.click();
    await page.waitForTimeout(300);

    // Verify timer does not change (1.5s wait)
    const pausedTime = await timer.innerText();
    await page.waitForTimeout(1500);
    const pausedTimeAfterTick = await timer.innerText();
    expect(pausedTime).toEqual(pausedTimeAfterTick);

    // Click RESUME SESSION
    const resumeBtn = page.getByRole("button", { name: "RESUME SESSION" });
    await resumeBtn.click();
    await page.waitForTimeout(1500);

    // Verify it ticks again
    const resumedTime = await timer.innerText();
    expect(pausedTime).not.toEqual(resumedTime);
  });

  test("Navigate to Fullscreen Focus Mode", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);

    const fullscreenBtn = page.getByRole("button", { name: "FULLSCREEN MODE" });
    await expect(fullscreenBtn).toBeVisible();

    // Click the fullscreen mode redirect
    await fullscreenBtn.click();

    // Verify URL changes to focus mode
    await page.waitForURL("**/focus/active");
    await expect(page).toHaveURL(/.*focus\/active/);
  });

  test("Activity feed manual refresh", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);

    const refreshBtn = page.getByRole("button", { name: "REFRESH", exact: true });
    await expect(refreshBtn).toBeVisible();

    // Click REFRESH
    await refreshBtn.click();

    // Verify it enters a refreshing state
    const refreshingBtn = page.getByText("REFRESHING...");
    await expect(refreshingBtn).toBeVisible();

    // Wait for the query resolver to finish (1500ms delay)
    await page.waitForTimeout(1800);

    // Verify it goes back to REFRESH state
    await expect(refreshBtn).toBeVisible();
  });
});
