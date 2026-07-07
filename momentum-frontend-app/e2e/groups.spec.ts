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
            username: "groupstestuser",
            email: "groups@momentum.com",
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

test.describe("Groups Page & Create/Join Modal Flow", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateOnboardedSession(page);
  });

  test("Create Group flow from Groups page grid", async ({ page }) => {
    await page.goto("/groups");
    await expect(page.locator("h1")).toHaveText("Your Groups");

    // Click Create Group button
    const createBtn = page.locator('button:has-text("Create Group")').first();
    await createBtn.click();

    // Verify Create Dialog is open
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator("h2")).toHaveText("Study Circle Setup");

    // Fill Create Group Form
    await modal.locator("#modal-group-name").fill("CS 101 Intro to Programming");
    await modal.locator("#modal-group-subject").fill("Computer Science");
    await modal.locator("#modal-group-desc").fill("Introductory programming exercises in Python and JS");
    await modal.locator('button:has-text("Public")').click();

    // Submit the form
    await modal.locator('button[type="submit"]').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();

    // Verify the new group card appears in the grid
    const newCard = page.locator('h3:has-text("CS 101 Intro to Programming")');
    await expect(newCard).toBeVisible({ timeout: 5000 });
  });

  test("Join Tab OTP invite code focus shifts", async ({ page }) => {
    await page.goto("/groups");

    // Click Join with code button
    const joinBtn = page.locator('button:has-text("Join with code")');
    await joinBtn.click();

    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();

    // Verify Join Tab active
    const input1 = modal.locator('input[aria-label="Digit 1"]');
    const input2 = modal.locator('input[aria-label="Digit 2"]');
    const input3 = modal.locator('input[aria-label="Digit 3"]');

    // Focus first input and type character
    await input1.focus();
    await page.keyboard.type("Q");
    await expect(input2).toBeFocused();

    // Type in second input
    await page.keyboard.type("P");
    await expect(input3).toBeFocused();

    // Press Backspace on the third (currently empty) input
    await page.keyboard.press("Backspace");
    await expect(input2).toBeFocused();
    await expect(input2).toHaveValue("");
  });

  test("Group Detail tab state navigation & dynamic rendering", async ({ page }) => {
    await page.goto("/groups");

    // Click into "Quantum Physics II" group card
    const groupCard = page.locator('h3:has-text("Quantum Physics II")');
    await groupCard.click();

    // Verify Navigation to Group Detail page
    await expect(page).toHaveURL(/\/groups\/[a-zA-Z0-9-]+/);
    await expect(page.locator("h1")).toHaveText("Quantum Physics II");

    // --- Overview Tab ---
    await expect(page.locator("h2:has-text('Members List')")).toBeVisible();
    await expect(page.locator("h2:has-text('Active Goals')")).toBeVisible();

    // --- Activity Tab ---
    const activityTabBtn = page.locator('button:has-text("Activity")');
    await activityTabBtn.click();
    await expect(page.locator("h2:has-text('Recent Circle Logs')")).toBeVisible();

    // --- Leaderboard Tab ---
    const leaderboardTabBtn = page.locator('button:has-text("Leaderboard")');
    await leaderboardTabBtn.click();
    await expect(page.locator("h2:has-text('Weekly Study Rankings')")).toBeVisible();

    // --- Challenges Tab ---
    const challengesTabBtn = page.locator('button:has-text("Challenges")');
    await challengesTabBtn.click();
    // Join a challenge check
    const joinChallengeBtn = page.locator('button:has-text("Join Challenge")').first();
    if (await joinChallengeBtn.isVisible()) {
      await joinChallengeBtn.click();
      await expect(page.locator("text=Active").first()).toBeVisible();
    }

    // --- Settings Tab ---
    const settingsTabBtn = page.locator('button:has-text("Settings")');
    await settingsTabBtn.click();
    await expect(page.locator("h2:has-text('Group Administration')")).toBeVisible();

    // Verify Settings save
    const nameInput = page.locator("input").first();
    await nameInput.fill("Quantum Physics II (Advanced)");
    await page.locator('button:has-text("Save Modifications")').click();
    await expect(page.locator("text=Settings saved successfully!")).toBeVisible();
  });
});
