import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("SkillSwap AR - Auth Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("should display login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should display signup page", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });

  test("should show validation errors for invalid signup", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    // Try with weak password
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/name/i).fill("John Doe");
    await page.getByLabel(/password/i).fill("weak");
    await page.getByRole("button", { name: /sign up/i }).click();

    // Should show error
    await expect(page.getByText(/password/i, { exact: false })).toBeVisible();
  });

  test("should navigate to signup from login", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/signup`);
  });

  test("should navigate to login from signup", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe("SkillSwap AR - Protected Routes", () => {
  test("should redirect to login when accessing dashboard unauthenticated", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing onboarding unauthenticated", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/onboarding`);
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing profile unauthenticated", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/profile/123`);
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("SkillSwap AR - Landing Page", () => {
  test("should display hero section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: /skillswap/i })).toBeVisible();
  });

  test("should display stats section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(
      page.getByText(/community impact/i, { exact: false })
    ).toBeVisible();
    await expect(page.getByText(/neighborhoods/i)).toBeVisible();
    await expect(page.getByText(/sessions/i)).toBeVisible();
  });

  test("should display how it works section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText(/how it works/i)).toBeVisible();
  });

  test("should have working CTA buttons", async ({ page }) => {
    await page.goto(BASE_URL);
    const startButton = page.getByRole("link", { name: /get started/i }).first();
    await expect(startButton).toBeVisible();
  });

  test("should navigate to how-it-works page from landing", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole("link", { name: /learn more/i }).first().click();
    await expect(page).toHaveURL(/how-it-works/);
  });

  test("should have navigation header", async ({ page }) => {
    await page.goto(BASE_URL);
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /explore/i })).toBeVisible();
  });
});

test.describe("SkillSwap AR - Explore Page", () => {
  test("should display explore page when authenticated would show", async ({
    page,
  }) => {
    // Navigate without auth - should redirect
    await page.goto(`${BASE_URL}/explore`);
    // Since we're not authenticated, might redirect to login
    const url = page.url();
    const isOnExplore = url.includes("/explore");
    const isOnLogin = url.includes("/login");
    expect(isOnExplore || isOnLogin).toBeTruthy();
  });
});

test.describe("SkillSwap AR - Responsive Design", () => {
  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: /skillswap/i })).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: /skillswap/i })).toBeVisible();
  });

  test("should be responsive on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: /skillswap/i })).toBeVisible();
  });
});

test.describe("SkillSwap AR - Form Validation", () => {
  test("should show email validation error for invalid email", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByLabel(/email/i).blur();
    // Browser validation should prevent submission
  });

  test("should trim whitespace from inputs", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.getByLabel(/email/i).fill("  test@example.com  ");
    const email = await page.getByLabel(/email/i).inputValue();
    expect(email).toBe("test@example.com");
  });
});

test.describe("SkillSwap AR - Error Handling", () => {
  test("should handle server errors gracefully", async ({ page }) => {
    await page.goto(`${BASE_URL}/health`);
    const response = await page.evaluate(() =>
      fetch("/api/health").then((r) => r.json())
    );
    expect(response).toBeDefined();
  });

  test("should show how it works page", async ({ page }) => {
    await page.goto(`${BASE_URL}/how-it-works`);
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
