import { expect, test } from "@playwright/test"

test("marketing home renders", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("text=Observability for shipping teams")).toBeVisible()
})
