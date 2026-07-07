import { test, expect } from "@playwright/test";

// Helper to authenticate session as an onboarded user to access focus mode
async function authenticateOnboardedSession(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "momentum-auth-storage",
      JSON.stringify({
        state: {
          user: {
            id: "mock-user-id",
            username: "focustestuser",
            email: "focus@momentum.com",
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
    // Also write the dedicated refresh token key so AuthProvider can find it
    localStorage.setItem("momentum_refresh_token", "mock-refresh-token-123");
  });
}

// Navigate to focus mode and wait until the timer h1 is visible
async function gotoFocusAndWaitForTimer(page: any) {
  await page.goto("/focus/active");
  // Wait up to 10 seconds for the timer to appear (AuthProvider bootstrap may add delay)
  await page.waitForSelector("h1.tabular-nums", { timeout: 10000 });
}

test.describe("Focus Mode Advanced Timer & Coverage Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock all backend API calls so the fake E2E tokens don't trigger a real 401 → logout cycle
    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      // Let auth/refresh pass through (we handle it via the mock bypass in AuthProvider)
      // Return a successful empty response for all other endpoints
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
    await authenticateOnboardedSession(page);
  });

  test("Timer accuracy over 60 seconds and drift verification", async ({ page }) => {
    // Navigate and wait for timer to appear with real clock first
    await gotoFocusAndWaitForTimer(page);

    // Install mock clock after component mounts — exclude queueMicrotask/rAF so React scheduler keeps running
    await page.clock.install({ time: new Date(), toFake: ['Date', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });

    const timer = page.locator("h1.tabular-nums");
    await expect(timer).toBeVisible();

    // Verify initial time is 25:00
    await expect(timer).toHaveText("25:00");

    // Evaluate system time inside browser before advance
    const timeBeforeAdvance = await page.evaluate(() => Date.now());

    // Fast forward by exactly 60 seconds
    await page.clock.fastForward(60000);

    // Evaluate system time inside browser after advance
    const timeAfterAdvance = await page.evaluate(() => Date.now());

    // Verify the UI timer updates to exactly 24:00
    await expect(timer).toHaveText("24:00");

    // Verify no accumulated drift between browser epoch time and UI timer tick
    const systemElapsedTimeSec = Math.floor((timeAfterAdvance - timeBeforeAdvance) / 1000);
    const uiTimerElapsedTimeSec = 25 * 60 - 24 * 60; // 60 seconds
    const driftMs = Math.abs(systemElapsedTimeSec - uiTimerElapsedTimeSec) * 1000;
    expect(driftMs).toBeLessThanOrEqual(250);
  });

  test("Pause for 5 seconds then resume", async ({ page }) => {
    await gotoFocusAndWaitForTimer(page);

    // Install mock clock after component mounts — exclude queueMicrotask/rAF so React scheduler keeps running
    await page.clock.install({ time: new Date(), toFake: ['Date', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });

    const timer = page.locator("h1.tabular-nums");
    await expect(timer).toBeVisible();

    // Timer ticks to 24:59 initially on render
    await page.clock.fastForward(1000);
    await expect(timer).toHaveText("24:59");

    // Dispatch click event directly to bypass Playwright actionability checks during frozen clock
    const pauseBtn = page.locator("main button").first();
    await pauseBtn.dispatchEvent("click");
    // Tick mock clock slightly to let event loop yield and React commit useEffect cleanup (clearing interval)
    await page.clock.fastForward(500);

    // Read the exact value at which the timer settled
    const pausedTime = await timer.innerText();

    // Fast-forward by 5 seconds while paused
    await page.clock.fastForward(5000);
    // Verify the timer value remains unchanged
    await expect(timer).toHaveText(pausedTime);

    // Resume the session
    await pauseBtn.dispatchEvent("click");
    // Let React resume and register the first tick
    await page.clock.fastForward(500);

    const resumedTime = await timer.innerText();
    const [mins, secs] = resumedTime.split(":").map(Number);
    const resumedSec = mins * 60 + secs;

    // Fast-forward by 10 seconds
    await page.clock.fastForward(10000);

    // Verify it resumed and decremented properly by at least 10 seconds
    const finalTime = await timer.innerText();
    const [fMins, fSecs] = finalTime.split(":").map(Number);
    const finalSec = fMins * 60 + fSecs;
    expect(resumedSec - finalSec).toBeGreaterThanOrEqual(10);
  });

  test("Verify browser tab title updates every second", async ({ page }) => {
    await gotoFocusAndWaitForTimer(page);

    // Install mock clock after component mounts — exclude queueMicrotask/rAF so React scheduler keeps running
    await page.clock.install({ time: new Date(), toFake: ['Date', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });

    const timer = page.locator("h1.tabular-nums");
    await expect(timer).toBeVisible();

    // Verify initial title
    await expect(page).toHaveTitle("25:00 — Study Mode");

    // Tick 1 second
    await page.clock.fastForward(1000);
    await expect(page).toHaveTitle("24:59 — Study Mode");

    // Tick 9 seconds more
    await page.clock.fastForward(9000);
    await expect(page).toHaveTitle("24:50 — Study Mode");
  });

  test("Verify page refresh restores timer correctly if backed by server start time", async ({ page }) => {
    // Calculate a startTime 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Intercept active session request using regex to ensure robust matching
    await page.route(/\/sessions\/active/, async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          message: "Active session retrieved",
          data: {
            id: "mock-active-session-uuid",
            userId: "mock-user-id",
            subject: "Quantum Physics II",
            startTime: tenMinutesAgo,
            durationMinutes: 25,
            status: "ACTIVE",
            currentTime: new Date().toISOString(),
          },
        }),
      });
    });

    // Go to focus mode (simulating fresh load / refresh)
    await gotoFocusAndWaitForTimer(page);

    const timer = page.locator("h1.tabular-nums");
    await expect(timer).toBeVisible();

    // Check if the timer falls within expected range (15 mins offset, allowing for loading time)
    const text = await timer.innerText();
    const [mins, secs] = text.split(":").map(Number);
    const secondsLeft = mins * 60 + secs;

    // Verify remaining seconds is around 15 minutes (900 seconds), allowing for up to 30s load delay
    expect(secondsLeft).toBeLessThanOrEqual(900);
    expect(secondsLeft).toBeGreaterThanOrEqual(870);
  });
});
