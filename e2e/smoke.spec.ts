import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: "Amani Nails & Spa" },
  { path: "/about", title: "About" },
  { path: "/services", title: "Services" },
  { path: "/pricing", title: "Pricing" },
  { path: "/gallery", title: "Gallery" },
  { path: "/contact", title: "Contact" },
  { path: "/booking", title: "Book" },
  { path: "/services/manicure", title: "Manicure" },
  { path: "/services/swedish-massage", title: "Swedish" },
  { path: "/services/spa-packages", title: "Spa Packages" },
];

test.describe("Smoke tests", () => {
  for (const { path, title } of PAGES) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(title, "i"));
    });
  }
});

test.describe("Navigation", () => {
  test("can navigate between pages via header links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Services" }).first().click();
    await expect(page).toHaveURL("/services");
    await expect(page.locator("h1")).toContainText("Services");
  });

  test("booking CTA on home page works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /book/i }).first().click();
    await expect(page).toHaveURL(/\/booking/);
  });
});

test.describe("Content", () => {
  test("service detail page shows price and duration", async ({ page }) => {
    await page.goto("/services/manicure");
    await expect(page.locator("h1")).toContainText("Manicure");
    await expect(page.locator(".text-3xl")).toBeVisible();
    await expect(page.locator(".text-3xl + p")).toBeVisible();
  });

  test("blog post renders", async ({ page }) => {
    await page.goto("/blog/nail-care-tips-nairobi-humidity");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
  });

  test("404 page shows", async ({ page }) => {
    const res = await page.goto("/nonexistent-page");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("Not Found");
  });
});
