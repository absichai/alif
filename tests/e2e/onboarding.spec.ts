import { expect, test } from "@playwright/test";

test("visitor reaches the no-leak account gate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Build my Dubai journey/ }).click();
  await page.getByRole("link", { name: "Guide me step by step" }).click();

  await page.getByRole("button", { name: /Exploring the idea/ }).click();
  await page.getByRole("button", { name: "In 3–6 months" }).click();
  await page.getByRole("button", { name: "Just me" }).click();
  await page.getByRole("button", { name: "None", exact: true }).click();

  // Single households skip the move-together question entirely.
  await expect(
    page.getByRole("heading", {
      name: "How do you expect to get UAE residency?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /I'm not sure yet/ }).click();

  await page.getByLabel("Which country issued your passport?").fill("France");
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByRole("button", { name: "Not decided yet" }).click();
  await page.getByRole("button", { name: "Not decided yet" }).click();
  await page.getByRole("button", { name: "Prefer not to say" }).click();

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

test("guided onboarding collects household and life preferences", async ({
  page,
}) => {
  await page.goto("/start/guided");

  await page.getByRole("button", { name: /Preparing to move/ }).click();
  await page.getByRole("button", { name: "Within 3 months" }).click();
  await page.getByRole("button", { name: "Me and my spouse" }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();

  // The move-together question appears only for married households.
  await expect(
    page.getByRole("heading", {
      name: "Will everyone move at the same time?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "We move together" }).click();

  await page.getByRole("button", { name: /Through my job/ }).click();
  await page.getByLabel("Which country issued your passport?").fill("Morocco");
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page.getByRole("button", { name: "20,000–34,999" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Your Dubai journey is ready to be created.",
    }),
  ).toBeVisible();
});

test("stepper supports going back without losing the flow", async ({ page }) => {
  await page.goto("/start/guided");

  await page.getByRole("button", { name: /Exploring the idea/ }).click();
  await expect(
    page.getByRole("heading", { name: "When are you hoping to move?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(
    page.getByRole("heading", { name: "Where are you in your Dubai journey?" }),
  ).toBeVisible();
});

test("landing explains how ALIF works and states the trust boundary", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See how it works" }).click();
  await expect(
    page.getByRole("heading", { name: "Three steps to one clear journey" }),
  ).toBeVisible();
  await expect(
    page.getByText(/ALIF is guidance, not legal/),
  ).toBeVisible();
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
