import { expect, test } from "@playwright/test";

test("visitor reaches the no-leak account gate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Build my Dubai journey/ }).click();
  await page.getByRole("link", { name: "Guide me step by step" }).click();

  await page
    .getByLabel("1. Where are you in your Dubai journey?")
    .selectOption("exploring");
  await page
    .getByLabel("2. When are you hoping to move?")
    .fill("Within six months");
  await page
    .getByLabel("4. How do you expect to obtain UAE residency?")
    .selectOption("unknown");
  await page
    .getByLabel("5. Which country issued your passport?")
    .fill("France");
  await page.getByRole("button", { name: "Skip this" }).click();
  await page.getByRole("button", { name: "Create my journey draft" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Your Dubai journey is ready to be created.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Ordered milestones")).toBeVisible();
  await expect(
    page.getByText("Choose the residency route that fits your plans"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Create my free journey" }),
  ).toHaveAttribute("href", "/sign-up");
});

test("landing and onboarding work on mobile", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Your move is more than a checklist.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Build my Dubai journey/ }),
  ).toBeVisible();
});
