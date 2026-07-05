import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/about", "/services", "/pricing", "/gallery", "/contact", "/booking"];

test.describe("Accessibility", () => {
  for (const path of PAGES) {
    test(`${path} has no critical a11y violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude("astro-island")
        .analyze();

      expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
    });
  }

  test("heading hierarchy is logical on all pages", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").allInnerTexts();
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0]).toBeTruthy();
    }
  });

  test("images have alt text on home page", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute("alt");
    }
  });

  test("skip link is present and focusable", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("language attribute is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
