import { test, expect } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

// Helper to authenticate session before accessing protected onboarding route
async function authenticateSession(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "momentum-auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: "mock-user-id",
            username: "visualtestuser",
            email: "visual@momentum.com",
            // college is undefined, which forces redirect to Onboarding
          },
          accessToken: "mock-access-token-123",
          refreshToken: "mock-refresh-token-123",
          isAuthenticated: true,
          isLoggedIn: true,
        },
        version: 0,
      })
    );
    // Write the dedicated refresh token key so AuthProvider mock bypass works
    localStorage.setItem("momentum_refresh_token", "mock-refresh-token-123");
  });
}

// Helper to authenticate session as an onboarded user to access dashboard & focus
async function authenticateOnboardedSession(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "momentum-auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: "mock-user-id",
            username: "visualtestuser",
            email: "visual@momentum.com",
            college: "Stanford University",
          },
          accessToken: "mock-access-token-123",
          refreshToken: "mock-refresh-token-123",
          isAuthenticated: true,
          isLoggedIn: true,
        },
        version: 0,
      })
    );
    // Write the dedicated refresh token key so AuthProvider mock bypass works
    localStorage.setItem("momentum_refresh_token", "mock-refresh-token-123");
  });
}

for (const vp of viewports) {
  test.describe(`Visual Regression - ${vp.name}`, () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(120000); // 2 minutes timeout for visual flow tests
      await page.setViewportSize({ width: vp.width, height: vp.height });
      // Mock all backend API calls so the fake E2E tokens don't trigger a real 401 → logout cycle
      await page.route("**/api/v1/**", async (route) => {
        const url = route.request().url();
        if (url.includes("/sessions/active")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ status: "SUCCESS", data: null }),
          });
        } else if (url.includes("/auth/refresh")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status: "SUCCESS",
              data: { accessToken: "mock-access-token-123", refreshToken: "mock-refresh-token-123" },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ status: "SUCCESS", data: null }),
          });
        }
      });
    });

    test("Landing Page visual snapshot", async ({ page }) => {
      await page.goto("/");
      await page.waitForSelector('[data-page="landing"]');
      // Wait for ticker & animations to load
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`landing-${vp.name}.png`, {
        fullPage: true,
        mask: [page.locator(".animate-ticker"), page.locator(".animate-marquee")], // mask dynamic ticker/marquee
      });
    });

    test("Login Page visual snapshot", async ({ page }) => {
      await page.goto("/login");
      await page.waitForSelector("#email");
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`login-${vp.name}.png`, {
        fullPage: true,
      });
    });

    test("Register Page visual snapshot", async ({ page }) => {
      await page.goto("/register");
      await page.waitForSelector("#fullName");
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`register-${vp.name}.png`, {
        fullPage: true,
      });
    });

    test("Onboarding Flow visual snapshots step-by-step", async ({ page }) => {
      // 1. Authenticate user session
      await authenticateSession(page);

      // 2. Visit Onboarding
      await page.goto("/onboarding");
      await page.waitForSelector("#step-heading");
      await page.waitForTimeout(800); // wait for slide-in animation

      // --- STEP 1: College ---
      await expect(page).toHaveScreenshot(`onboarding-step1-college-${vp.name}.png`);

      // Interact: Select IIT Bombay from suggestion pills
      const iitPill = page.getByRole("button", { name: "IIT Bombay", exact: true });
      await iitPill.click();
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`onboarding-step1-college-selected-${vp.name}.png`);

      // Click continue (matches aria-label="Continue to next step")
      await page.getByRole("button", { name: "Continue to next step", exact: true }).click();
      await page.waitForTimeout(800); // wait for slide animation

      // --- STEP 2: Branch & Year ---
      await expect(page).toHaveScreenshot(`onboarding-step2-branch-year-${vp.name}.png`);

      // Interact: Select Computer Science branch and 2026 grad year
      await page.getByRole("button", { name: "Computer Science", exact: true }).click();
      await page.getByRole("button", { name: "2026", exact: true }).click();
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`onboarding-step2-selected-${vp.name}.png`);

      // Click next step (matches aria-label="Continue to career goals")
      await page.getByRole("button", { name: "Continue to career goals", exact: true }).click();
      await page.waitForTimeout(800); // wait for transition

      // --- STEP 3: Career Goals ---
      await expect(page).toHaveScreenshot(`onboarding-step3-career-${vp.name}.png`);

      // Interact: Fill in target institution & package
      await page.getByLabel("Target institution or company").fill("SpaceX");
      await page.getByLabel("Target annual salary in USD").fill("150000");
      await page.waitForTimeout(200);
      await expect(page).toHaveScreenshot(`onboarding-step3-filled-${vp.name}.png`);

      // Click continue (matches aria-label="Continue to social links")
      await page.getByRole("button", { name: "Continue to social links", exact: true }).click();
      await page.waitForTimeout(800); // transition

      // --- STEP 4: Social Links ---
      await expect(page).toHaveScreenshot(`onboarding-step4-social-${vp.name}.png`);

      // Click continue (matches aria-label="Continue to profile picture")
      await page.getByRole("button", { name: "Continue to profile picture", exact: true }).click();
      await page.waitForTimeout(800); // transition

      // --- STEP 5: Profile Picture ---
      await expect(page).toHaveScreenshot(`onboarding-step5-avatar-${vp.name}.png`);

      // Click Finish Profile (matches aria-label="Finish profile and go to dashboard")
      await page.getByRole("button", { name: "Finish profile and go to dashboard", exact: true }).click();
      await page.waitForTimeout(800); // transition to completion screen

      // --- COMPLETION SCREEN ---
      await expect(page).toHaveScreenshot(`onboarding-completion-${vp.name}.png`);
    });

    test("Dashboard Page visual snapshot", async ({ page }) => {
      await authenticateOnboardedSession(page);
      await page.goto("/dashboard");
      
      // Wait for all queries to resolve (max simulated delay is 1500ms + margin)
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot(`dashboard-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        // Mask ticking timer, progress bar, and animated chart to prevent visual diff noise
        mask: [
          page.locator(".tabular-nums"),
          page.locator(".absolute.bottom-0.left-0.h-1"),
          page.locator(".h-1.bg-primary-container"),
          page.locator(".weekly-chart-widget"),
          page.locator(".animate-pulse"),
        ],
      });
    });

    test("Focus Mode Page visual snapshot", async ({ page }) => {
      await authenticateOnboardedSession(page);
      await page.goto("/focus/active");
      await page.waitForSelector("h1.tabular-nums", { timeout: 10000 });
      await page.waitForTimeout(800); // wait for initial render

      await expect(page).toHaveScreenshot(`focus-mode-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        // Mask active ticking clock, progress circle, and breathing background glow
        mask: [
          page.locator("h1.tabular-nums"),
          page.locator("#progress-ring"),
          page.locator(".animate-timer-breath"),
        ],
      });
    });

    test("Focus Mode functionality - countdown, pause, toggle mode, and redirect", async ({ page }) => {
      await authenticateOnboardedSession(page);
      await page.goto("/focus/active");
      await page.waitForSelector("h1.tabular-nums", { timeout: 10000 });

      // 1. Verify timer actually counts down (real-time check)
      const initialTimeText = await page.locator("h1.tabular-nums").innerText();
      await page.waitForTimeout(1500);
      const afterTickTimeText = await page.locator("h1.tabular-nums").innerText();
      expect(initialTimeText).not.toEqual(afterTickTimeText);

      // 2. Verify pause stops countdown
      // Click play/pause button (first button in the control row)
      const playPauseBtn = page.locator("main button").first();
      await playPauseBtn.click();
      await page.waitForTimeout(500); // let state settle
      
      const pausedTimeText = await page.locator("h1.tabular-nums").innerText();
      await page.waitForTimeout(1500);
      const afterPauseTimeText = await page.locator("h1.tabular-nums").innerText();
      expect(pausedTimeText).toEqual(afterPauseTimeText);

      // 3. Verify toggle Studying / Break
      // Click the Status Pill
      await page.locator("main div.cursor-pointer").click();
      await page.waitForTimeout(500);
      const currentModeText = await page.locator("main div.cursor-pointer span.text-on-surface-variant").innerText();
      // Since it is switched to break, studying label should now be on-surface-variant (inactive)
      expect(currentModeText).toContain("STUDYING");

      // 4. Verify Ending Session navigates back to Dashboard
      await page.getByRole("button", { name: "End Session", exact: true }).click();
      await page.waitForURL("**/dashboard");
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });
}
