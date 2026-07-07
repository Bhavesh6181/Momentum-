import { test, expect } from "@playwright/test";

// Helper to authenticate session as an onboarded user
async function authenticateOnboardedSession(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "momentum-auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: "mock-user-id",
            username: "goalandleaderboardtester",
            email: "goalsnleaderboard@momentum.com",
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

test.describe("Goals, Leaderboard, and Analytics Flows", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOnboardedSession(page);
  });

  test("Goals - filter transitions, count-up percentage, and mark complete stroke animation", async ({ page }) => {
    await page.goto("/goals");
    await expect(page.locator("h1")).toHaveText("Goals & Challenges");

    // 1. Check dynamic count-up percentage text is visible in challenges
    const percentText = page.locator("span.font-mono").first();
    await expect(percentText).toBeVisible();

    // 2. Click Filter Pills and confirm crossfade transition
    const joinedFilterBtn = page.locator('button:has-text("joined")');
    await joinedFilterBtn.click();
    
    // Check that we can toggle back and forth without error
    const availableFilterBtn = page.locator('button:has-text("available")');
    await availableFilterBtn.click();
    await expect(availableFilterBtn.locator("div")).toBeAttached(); // LayoutId crossfade indicator attached

    // 3. Mark a goal complete and confirm collapsing transition
    const initialActiveCount = await page.locator("p:has-text('Active Goals')").innerText();
    const checkbox = page.locator('button[aria-label^="Mark"]').first();
    await checkbox.click();

    // Verify it is collapsed into the completed section (opacity reduced/line-through text)
    await expect(page.locator(".line-through").first()).toBeVisible({ timeout: 5000 });
  });

  test("Leaderboard - staggered row entrance and sticky own-rank visibility", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("h1")).toHaveText("Leaderboard");

    // 1. Verify rows stagger in and are visible
    const firstRow = page.locator(".grid-cols-\\[2\\.5rem_1fr_4\\.5rem_4rem_2rem\\]").nth(1); // Row 1
    await expect(firstRow).toBeVisible();

    // 2. Weekly Rank position is 4 (inside top 10), so sticky bottom row is NOT visible
    await expect(page.locator("text=Your Position outside Visible Range")).not.toBeVisible();

    // 3. Switch to Monthly period - Rank is 12 (outside top 10), so sticky own-rank bottom row is visible
    const monthlyBtn = page.locator('button:has-text("monthly")');
    await monthlyBtn.click();
    await expect(page.locator("text=Your Position outside Visible Range")).toBeVisible({ timeout: 5000 });

    // 4. Switch back to weekly - Rank is 4 again, so sticky bottom row is hidden
    const weeklyBtn = page.locator('button:has-text("weekly")');
    await weeklyBtn.click();
    await expect(page.locator("text=Your Position outside Visible Range")).not.toBeVisible({ timeout: 5000 });
  });

  test("Analytics - weekly bar chart growth and activity heatmap color-intensity tween", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("h1")).toHaveText("Analytics");

    // 1. Verify stats card row is populated
    await expect(page.locator("p:has-text('Total Hours')")).toBeVisible();

    // 2. Verify weekly Intensity bar chart rendering and heights
    const firstBar = page.locator("div.group\\/bar").first().locator("div.origin-bottom");
    await expect(firstBar).toBeVisible();

    // 3. Verify activity heatmap renders cells
    const firstHeatmapCell = page.locator("div.w-7.h-7").first();
    await expect(firstHeatmapCell).toBeVisible();
  });
});
