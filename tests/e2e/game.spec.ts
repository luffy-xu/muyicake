import { expect, test } from "@playwright/test";

test("wildlife board game starts and plays a turn at /game/<room>", async ({ page }) => {
  await page.goto("/game/e2e-room");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("player-count").selectOption("3");
  await page.getByRole("button", { name: "开始游戏" }).click();
  await expect(page.getByTestId("game-board")).toBeVisible();
  await expect(page.getByTestId("turn")).toContainText("玩家 1");

  await page.getByTestId("roll").click();
  await expect(page.getByTestId("game-log")).toContainText("玩家 1 掷出");

  await page.reload();
  await expect(page.getByTestId("game-log")).toContainText("玩家 1 掷出");
});
