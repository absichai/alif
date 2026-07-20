import { expect, test } from "@playwright/test";

test("assistant proposal requires confirmation", async ({ page }) => {
  await page.goto("/journey");
  await page.getByRole("button", { name: "Ask ALIF" }).click();
  await page
    .getByLabel("Your question")
    .fill("I now have employment sponsorship.");
  await page.getByRole("button", { name: "Ask about my journey" }).click();
  await expect(
    page.getByText(/will not change your journey until you confirm/i),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep my journey" }).click();
});
