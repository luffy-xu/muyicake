import { expect, test } from "@playwright/test";

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
    },
  });

  expect(response.status()).toBe(201);
  const payload = (await response.json()) as {
    reservation: { id: string; productName: string; locale: string; utmSource: string; deliveryArea: string };
  };
  expect(payload.reservation.id).toMatch(/^MUYI-\d{8}-\d{4}$/);
  expect(payload.reservation.productName).toBe('Qixi Signature Cake 6"');
  expect(payload.reservation.locale).toBe("zh");
  expect(payload.reservation.utmSource).toBe("xiaohongshu");
  expect(payload.reservation.deliveryArea).toBe("521123");
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

test("Admin pages redirect unauthenticated users to login", async ({ request }) => {
  const response = await request.get("/admin/reservations", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers()["location"]).toContain("/admin/login");
});
