import { expect, test } from "@playwright/test";

test("wildlife board game plays, syncs to the server and resets", async ({ page, request }) => {
  const room = `e2e-room-${Date.now()}`;
  await page.goto(`/game/${room}`);
  await page.getByTestId("player-count").selectOption("3");
  await page.getByRole("button", { name: "开始游戏" }).click();
  await expect(page.getByTestId("game-board")).toBeVisible();
  await expect(page.getByTestId("turn")).toContainText("玩家 1");

  await page.getByTestId("roll").click();
  await expect(page.getByTestId("dice-rolling")).toBeVisible();
  await expect(page.getByTestId("game-log")).toContainText("玩家 1 掷出");
  await expect(page.getByTestId("sync-status")).toContainText("已保存到云端");

  await expect
    .poll(async () => (await (await request.get(`/api/game/${room}`)).json()).room?.state.log.length ?? 0)
    .toBeGreaterThan(0);

  // Progress comes back from the server on a fresh device (empty localStorage).
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("game-log")).toContainText("玩家 1 掷出");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("reset-room").click();
  await expect(page.getByTestId("player-count")).toBeVisible();
  await expect.poll(async () => (await (await request.get(`/api/game/${room}`)).json()).room).toBeNull();
});
