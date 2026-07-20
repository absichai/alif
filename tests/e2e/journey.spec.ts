import { expect, test } from "@playwright/test";

const profile = {
  destinationCode: "AE-DXB",
  stage: "exploring",
  moveTimeframe: "Within six months",
  household: {
    relationshipStatus: "single",
    childrenCount: 0,
    movingTogether: "not_applicable",
  },
  residencyPath: "unknown",
  passportCountry: "France",
  incomeRange: null,
  preferences: {},
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async (value) => {
    await fetch("/api/journeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
  }, profile);
});

test("current chapter advances after completion", async ({ page }) => {
  await page.goto("/journey");
  await expect(page.getByText("Your next chapter").first()).toBeVisible();
  await page.getByRole("link", { name: /Begin chapter/ }).click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page.goto("/journey");
  await expect(page.getByText("Make the move financially real")).toBeVisible();
});
