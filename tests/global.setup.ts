import path from "node:path";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing token", async () => {
  await clerkSetup();
});

setup("authenticate the dedicated test user", async ({ page }) => {
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;
  if (!emailAddress) throw new Error("E2E_CLERK_USER_EMAIL is required");
  await page.goto("/");
  await clerk.signIn({ page, emailAddress });
  await page.context().storageState({
    path: path.join(process.cwd(), "playwright/.clerk/user.json"),
  });
});
