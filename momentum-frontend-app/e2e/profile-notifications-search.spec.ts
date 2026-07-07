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
            username: "profilesearchtester",
            email: "profilesearch@momentum.com",
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

test.describe("Profile, Notifications Dropdown, and Command Palette Search", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOnboardedSession(page);
  });

  test("Profile page - count-up stats and edit-in-place bio", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h1")).toHaveText("John Doe");

    // 1. Verify stats exist and count up
    await expect(page.locator("text=Focus Hours")).toBeVisible();
    await expect(page.locator("text=Daily Streak")).toBeVisible();
    await expect(page.locator("text=Global Rank")).toBeVisible();

    // 2. Edit Bio
    const editBtn = page.locator('button:has-text("Edit Bio")');
    await editBtn.click();

    const textarea = page.locator("textarea");
    await expect(textarea).toBeFocused();
    await textarea.fill("Self-taught engineer and math wizard.");

    // Click check mark to save
    const saveBtn = page.locator('button[title="Save changes"]');
    await saveBtn.click();

    // Verify bio updated
    await expect(page.locator("text=Self-taught engineer and math wizard.")).toBeVisible();
  });

  test("Notifications Dropdown - unread dot and mark all read", async ({ page }) => {
    await page.goto("/dashboard");

    // Check bell icon has unread indicator
    const bellBtn = page.locator('button[aria-label="Notifications"]');
    await expect(bellBtn).toBeVisible();
    const unreadDot = bellBtn.locator(".bg-secondary-fixed-dim");
    await expect(unreadDot).toBeVisible();

    // Toggle dropdown
    await bellBtn.click();
    const dropdown = page.locator("role=dialog").locator("h4:has-text('Notifications')"); // Wait for header to be visible in dropdown
    await expect(page.locator("text=Mark all read")).toBeVisible();

    // Mark all read
    await page.locator("text=Mark all read").click();

    // Unread indicators should clear
    await expect(unreadDot).not.toBeVisible();
  });

  test("Command Palette Search - shortcut, fuzzy highlight, arrow keys and Enter navigate", async ({ page }) => {
    await page.goto("/dashboard");

    // 1. Trigger Ctrl+K
    await page.click("body");
    await page.waitForTimeout(500);
    await page.keyboard.press("Control+k");
    const palette = page.locator('role=dialog');
    await expect(palette).toBeVisible();

    // 2. Type search query
    const input = palette.locator('input[aria-label="Search query"]');
    await input.fill("Priya");

    // 3. Verify filtered results and fuzzy highlight (mark tag)
    const matchedItem = palette.locator("text=Priya Sharma");
    await expect(matchedItem).toBeVisible();
    const markTag = matchedItem.locator("mark");
    await expect(markTag).toHaveText("Priya");

    // 4. Keyboard Navigation: Press ArrowDown then Enter
    await input.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // 5. Verify navigation to selected item's route (Profile page)
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("h1")).toHaveText("John Doe");
  });
});
