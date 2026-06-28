import { expect, test } from "@playwright/test";
import * as nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

test.afterAll(async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    await sql`
      delete from cake_collections
      where slug like 'e2e-qixi-%'
         or slug like 'drawer-qixi-%'
    `;
    await sql`
      delete from reservations
      where customer_name in ('Qixi Customer', 'Birthday Customer')
         or customer_name like 'Drawer Customer %'
    `;
    await sql`
      delete from customers
      where name in ('Qixi Customer', 'Birthday Customer')
         or name like 'Drawer Customer %'
    `;
  } finally {
    await sql.end();
  }
});

test("Qixi reservation flow", async ({ request }) => {
  const page = await request.get("/qixi");
  expect(await page.text()).toContain("七夕蛋糕预订");

  const response = await request.post("/api/reservations", {
    data: {
      locale: "zh",
      sourcePage: "qixi",
      reservationCategory: "qixi",
      productCode: "qixi_6_inch",
      productName: 'Qixi Signature Cake 6"',
      basePrice: 117,
      currency: "SGD",
      whatsapp: "+65 9123 4567",
      customerName: "Qixi Customer",
      deliveryDate: "2026-08-19",
      deliveryAddress: "Blk 123 Tampines St 11 #08-88, Singapore 521123",
      utmSource: "xiaohongshu",
      utmCampaign: "qixi_preheat",
      landingPath: "/qixi?utm_source=xiaohongshu&utm_campaign=qixi_preheat",
      selectedCollectionId: "col_qixi_memory",
      selectedStyleId: "style_qixi_memory_blush",
      selectedStyleName: "粉色回忆七夕蛋糕",
      selectedSizeOptionId: "size_qixi_memory_6",
      selectedSizeLabel: '6"',
      selectedPrice: 117,
    },
  });

  expect(response.status()).toBe(201);
  const payload = (await response.json()) as {
    reservation: { id: string; productName: string; locale: string; utmSource: string; deliveryArea: string; selectedStyleName: string; selectedSizeLabel: string; selectedPrice: number };
  };
  expect(payload.reservation.id).toMatch(/^MUYI-\d{8}-\d{4}$/);
  expect(payload.reservation.productName).toBe('Qixi Signature Cake 6"');
  expect(payload.reservation.locale).toBe("zh");
  expect(payload.reservation.utmSource).toBe("xiaohongshu");
  expect(payload.reservation.deliveryArea).toBe("521123");
  expect(payload.reservation.selectedStyleName).toBe("粉色回忆七夕蛋糕");
  expect(payload.reservation.selectedSizeLabel).toBe('6"');
  expect(payload.reservation.selectedPrice).toBe(117);
});

test("English custom birthday reservation flow", async ({ request }) => {
  const page = await request.get("/en/custom");
  expect(await page.text()).toContain("Daily birthday and custom cakes");

  const response = await request.post("/api/reservations", {
    data: {
      locale: "en",
      sourcePage: "custom",
      reservationCategory: "birthday",
      productCode: "birthday_6_inch",
      productName: 'Signature Birthday Cake 6"',
      basePrice: 117,
      currency: "SGD",
      whatsapp: "+65 9234 5678",
      customerName: "Birthday Customer",
      deliveryDate: "2026-08-20",
      deliveryAddress: "391 Orchard Road #10-01, Singapore 238872",
      cakeMessage: "Happy birthday, Mama",
      utmSource: "instagram",
      utmCampaign: "qixi_preheat",
      referrer: "https://www.instagram.com/",
      landingPath: "/en/custom?utm_source=instagram&utm_campaign=qixi_preheat",
    },
  });

  expect(response.status()).toBe(201);
  const payload = (await response.json()) as {
    reservation: { id: string; cakeMessage: string; locale: string; utmCampaign: string };
  };
  expect(payload.reservation.id).toMatch(/^MUYI-\d{8}-\d{4}$/);
  expect(payload.reservation.cakeMessage).toBe("Happy birthday, Mama");
  expect(payload.reservation.locale).toBe("en");
  expect(payload.reservation.utmCampaign).toBe("qixi_preheat");
});

test("Admin reservation management flow", async ({ request }) => {
  const unauthorized = await request.get("/api/reservations");
  expect(unauthorized.status()).toBe(401);

  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  expect(loginResponse.status()).toBe(303);
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  expect(adminCookie).toContain("muyi_admin_session=");

  const listResponse = await request.get("/api/reservations", {
    headers: { Cookie: adminCookie! },
  });
  expect(listResponse.status()).toBe(200);

  const listPayload = (await listResponse.json()) as {
    reservations: { id: string; customerName: string; locale: string }[];
  };
  const latest = listPayload.reservations.find(
    (reservation) => reservation.customerName === "Birthday Customer",
  );
  expect(latest).toBeTruthy();
  expect(latest!.locale).toBe("en");

  const detailResponse = await request.get(`/api/reservations/${latest!.id}`, {
    headers: { Cookie: adminCookie! },
  });
  expect(detailResponse.status()).toBe(200);

  const patchResponse = await request.patch(`/api/reservations/${latest!.id}`, {
    headers: { Cookie: adminCookie! },
    data: {
      status: "contacted",
      confirmedDeliverySlot: "1:00 PM - 4:00 PM",
      adminNote: "Followed up on WhatsApp.",
    },
  });
  expect(patchResponse.status()).toBe(200);

  const updated = (await patchResponse.json()) as {
    reservation: {
      status: string;
      confirmedDeliverySlot: string;
      adminNote: string;
    };
  };
  expect(updated.reservation.status).toBe("contacted");
  expect(updated.reservation.confirmedDeliverySlot).toBe("1:00 PM - 4:00 PM");
  expect(updated.reservation.adminNote).toBe("Followed up on WhatsApp.");
});

test("Admin catalog create and public catalog API flow", async ({ request }) => {
  test.skip(!process.env.DATABASE_URL, "Catalog admin create flow requires DATABASE_URL.");

  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  expect(adminCookie).toContain("muyi_admin_session=");

  const suffix = Date.now();
  const collectionResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createCollection",
      slug: `e2e-qixi-${suffix}`,
      titleZh: "E2E 七夕系列",
      titleEn: "E2E Qixi Collection",
      type: "qixi",
      isActive: true,
      sortOrder: 99,
    },
  });
  expect(collectionResponse.status()).toBe(200);
  const collectionPayload = (await collectionResponse.json()) as { result: { id: string; slug: string } };

  const styleResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createStyle",
      collectionId: collectionPayload.result.id,
      slug: `e2e-style-${suffix}`,
      nameZh: "E2E 粉色蛋糕",
      nameEn: "E2E Blush Cake",
      subtitleZh: "抽屉测试款",
      subtitleEn: "Drawer test style",
      mainImageUrl: "https://placehold.co/900x700/f7b6c8/6b3f2a?text=E2E",
      badgeZh: "测试",
      badgeEn: "Test",
      isActive: true,
      sortOrder: 99,
    },
  });
  expect(styleResponse.status()).toBe(200);
  const stylePayload = (await styleResponse.json()) as { result: { id: string } };

  const sizeResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createSize",
      styleId: stylePayload.result.id,
      sizeLabel: '4"',
      servingsZh: "约 2-4 人",
      servingsEn: "Serves 2-4",
      price: 77,
      currency: "SGD",
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
  });
  expect(sizeResponse.status()).toBe(200);

  const publicStyles = await request.get(
    `/api/catalog/styles?locale=en&collectionSlug=${collectionPayload.result.slug}`,
  );
  expect(publicStyles.status()).toBe(200);
  const publicPayload = (await publicStyles.json()) as { styles: Array<{ id: string; name: string; startingPrice: number }> };
  expect(publicPayload.styles[0]).toMatchObject({
    name: "E2E Blush Cake",
    startingPrice: 77,
  });

  const detail = await request.get(`/api/catalog/styles/${stylePayload.result.id}?locale=zh`);
  expect(detail.status()).toBe(200);
  const detailPayload = (await detail.json()) as { style: { name: string; sizeOptions: Array<{ price: number }> } };
  expect(detailPayload.style.name).toBe("E2E 粉色蛋糕");
  expect(detailPayload.style.sizeOptions[0].price).toBe(77);

  const deleteResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "deleteCollection",
      id: collectionPayload.result.id,
    },
  });
  expect(deleteResponse.status()).toBe(200);

  const deletedCollection = await request.get(
    `/api/catalog/collections/${collectionPayload.result.slug}?locale=zh`,
  );
  expect(deletedCollection.status()).toBe(404);
});

test("Public Qixi drawer selection saves selected style", async ({ page, request }) => {
  test.skip(!process.env.DATABASE_URL, "Public drawer catalog flow requires DATABASE_URL.");

  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  expect(adminCookie).toContain("muyi_admin_session=");

  const suffix = Date.now();
  const styleNameZh = `E2E 抽屉七夕蛋糕 ${suffix}`;
  const customerName = `Drawer Customer ${suffix}`;
  const collectionResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createCollection",
      slug: `drawer-qixi-${suffix}`,
      titleZh: "E2E 抽屉七夕系列",
      titleEn: "E2E Drawer Qixi Collection",
      type: "qixi",
      isActive: true,
      sortOrder: 1,
    },
  });
  expect(collectionResponse.status()).toBe(200);
  const collectionPayload = (await collectionResponse.json()) as { result: { id: string } };

  const styleResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createStyle",
      collectionId: collectionPayload.result.id,
      slug: `drawer-style-${suffix}`,
      nameZh: styleNameZh,
      nameEn: `E2E Drawer Qixi Cake ${suffix}`,
      subtitleZh: "前台抽屉测试",
      subtitleEn: "Public drawer test",
      descriptionZh: "用于验证前台抽屉选择和预订保存。",
      descriptionEn: "Used to verify drawer selection and reservation persistence.",
      mainImageUrl: "https://placehold.co/900x700/f7b6c8/6b3f2a?text=Drawer",
      badgeZh: "测试",
      badgeEn: "Test",
      isActive: true,
      sortOrder: 1,
    },
  });
  expect(styleResponse.status()).toBe(200);
  const stylePayload = (await styleResponse.json()) as { result: { id: string } };

  const sizeResponse = await request.post("/api/admin/catalog", {
    headers: { Cookie: adminCookie! },
    data: {
      action: "createSize",
      styleId: stylePayload.result.id,
      sizeLabel: '4"',
      servingsZh: "约 2-4 人",
      servingsEn: "Serves 2-4",
      price: 77,
      currency: "SGD",
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
  });
  expect(sizeResponse.status()).toBe(200);

  await page.goto("/qixi");
  await page.waitForResponse((response) =>
    response.url().includes("/api/catalog/collections") && response.status() === 200,
  );
  await page.getByRole("button", { name: /七夕 4 寸小蛋糕/ }).click();
  await expect(page.getByRole("heading", { name: "选择蛋糕款式与尺寸" })).toBeVisible();
  await page.getByRole("button", { name: new RegExp(styleNameZh) }).click();
  await expect(page.getByRole("heading", { name: styleNameZh })).toBeVisible();
  await page.getByRole("button", { name: /选择这款蛋糕/ }).click();
  await expect(page.getByText(styleNameZh)).toBeVisible();
  await expect(page.getByText('4"')).toBeVisible();
  await expect(page.locator("#reservation-form").getByText(/价格:\s*S\$77/)).toBeVisible();

  await page.getByPlaceholder("9123 4567").fill("9123 4567");
  await page.getByPlaceholder("姓名").fill(customerName);
  await page.getByLabel("配送日期").fill("2026-08-22");
  await page
    .getByPlaceholder("例如：Blk 123 Tampines St 11 #08-88, Singapore 521123")
    .fill("Blk 123 Tampines St 11 #08-88, Singapore 521123");
  await page.getByRole("button", { name: "提交预订" }).click();
  const successDialog = page.getByRole("dialog");
  await expect(successDialog.getByText("已收到预订")).toBeVisible();
  await expect(successDialog.getByText(styleNameZh)).toBeVisible();

  const listResponse = await request.get("/api/reservations", {
    headers: { Cookie: adminCookie! },
  });
  const listPayload = (await listResponse.json()) as {
    reservations: Array<{
      customerName: string;
      selectedStyleName?: string;
      selectedSizeLabel?: string;
      selectedPrice?: number;
    }>;
  };
  const created = listPayload.reservations.find((reservation) => reservation.customerName === customerName);
  expect(created).toMatchObject({
    selectedStyleName: styleNameZh,
    selectedSizeLabel: '4"',
    selectedPrice: 77,
  });
});

test("Admin pages redirect unauthenticated users to login", async ({ request }) => {
  const response = await request.get("/admin/reservations", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers()["location"]).toContain("/admin/login");
});

test("Admin catalog navigation is Chinese after login", async ({ page, request }) => {
  test.skip(!process.env.DATABASE_URL, "Admin catalog UI requires DATABASE_URL.");

  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  expect(adminCookie).toContain("muyi_admin_session=");
  const [, cookieValue] = adminCookie!.split("=");
  await page.context().addCookies([
    {
      name: "muyi_admin_session",
      value: cookieValue,
      url: "http://127.0.0.1:4173",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/admin/catalog");
  await expect(page.getByText("沐伊后台")).toBeVisible();
  await expect(page.getByRole("heading", { name: "蛋糕目录", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "预订管理", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "系统设置", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "系列管理" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "蛋糕目录 CMS" })).toBeVisible();
});

test("Admin reservation type filters work", async ({ page, request }) => {
  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  const [, cookieValue] = adminCookie!.split("=");
  await page.context().addCookies([
    {
      name: "muyi_admin_session",
      value: cookieValue,
      url: "http://127.0.0.1:4173",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/admin/reservations?type=qixi");
  await expect(page.getByRole("heading", { name: "七夕预订" })).toBeVisible();
  await expect(page.locator("tbody tr").filter({ hasText: "qixi" }).first()).toBeVisible();

  await page.goto("/admin/reservations?type=custom");
  await expect(page.getByRole("heading", { name: "定制预订" })).toBeVisible();
  await expect(page.locator("tbody tr").filter({ hasText: "birthday" }).first()).toBeVisible();
  await expect(page.locator("tbody tr").filter({ hasText: "qixi" })).toHaveCount(0);
});

test("Admin style edit uses drawer and images page is reachable", async ({ page, request }) => {
  test.skip(!process.env.DATABASE_URL, "Admin catalog UI requires DATABASE_URL.");

  const loginResponse = await request.post("/api/admin/login", {
    form: { password: "test-admin" },
    maxRedirects: 0,
  });
  const adminCookie = loginResponse.headers()["set-cookie"]?.split(";")[0];
  const [, cookieValue] = adminCookie!.split("=");
  await page.context().addCookies([
    {
      name: "muyi_admin_session",
      value: cookieValue,
      url: "http://127.0.0.1:4173",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/admin/catalog/styles");
  await page.getByRole("button", { name: "新建款式" }).click();
  await expect(page.getByRole("heading", { name: "新建蛋糕款式" })).toBeVisible();
  await expect(page.getByLabel("主图 URL")).toHaveCount(0);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByRole("heading", { name: "新建蛋糕款式" })).toHaveCount(0);

  await page.goto("/admin/catalog/collections");
  await page.getByRole("button", { name: "新建系列" }).click();
  await expect(page.getByRole("heading", { name: "新建蛋糕系列" })).toBeVisible();
  await expect(page.getByLabel("封面图片 URL")).toHaveCount(0);
  await page.getByRole("button", { name: "关闭", exact: true }).click();

  await page.goto("/admin/catalog/images");
  await expect(page.getByRole("heading", { name: "图片管理" })).toBeVisible();
  await expect(page.getByText("上传主图").first()).toBeVisible();
  await expect(page.getByText("上传图库").first()).toBeVisible();
});
