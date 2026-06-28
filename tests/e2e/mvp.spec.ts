import { expect, test } from "@playwright/test";

const adminHeaders = { "x-admin-password": "test-admin" };

test("Qixi reservation flow", async ({ request }) => {
  const page = await request.get("/qixi");
  expect(await page.text()).toContain("Qixi cake reservations");

  const response = await request.post("/api/reservations", {
    data: {
      sourcePage: "qixi",
      reservationCategory: "qixi",
      productCode: "qixi_6_inch",
      productName: 'Qixi Signature Cake 6"',
      basePrice: 117,
      currency: "SGD",
      whatsapp: "+65 9123 4567",
      customerName: "Qixi Customer",
      deliveryDate: "2026-08-19",
      deliveryArea: "Tampines",
    },
  });

  expect(response.status()).toBe(201);
  const payload = (await response.json()) as {
    reservation: { id: string; productName: string };
  };
  expect(payload.reservation.id).toMatch(/^MUYI-\d{8}-\d{4}$/);
  expect(payload.reservation.productName).toBe('Qixi Signature Cake 6"');
});

test("Custom birthday reservation flow", async ({ request }) => {
  const page = await request.get("/custom");
  expect(await page.text()).toContain("Daily birthday and custom cakes");

  const response = await request.post("/api/reservations", {
    data: {
      sourcePage: "custom",
      reservationCategory: "birthday",
      productCode: "birthday_6_inch",
      productName: 'Signature Birthday Cake 6"',
      basePrice: 117,
      currency: "SGD",
      whatsapp: "+65 9234 5678",
      customerName: "Birthday Customer",
      deliveryDate: "2026-08-20",
      deliveryArea: "Orchard",
      cakeMessage: "Happy birthday, Mama",
    },
  });

  expect(response.status()).toBe(201);
  const payload = (await response.json()) as {
    reservation: { id: string; cakeMessage: string };
  };
  expect(payload.reservation.id).toMatch(/^MUYI-\d{8}-\d{4}$/);
  expect(payload.reservation.cakeMessage).toBe("Happy birthday, Mama");
});

test("Admin reservation management flow", async ({ request }) => {
  const listResponse = await request.get("/api/reservations", {
    headers: adminHeaders,
  });
  expect(listResponse.status()).toBe(200);

  const listPayload = (await listResponse.json()) as {
    reservations: { id: string; customerName: string }[];
  };
  const latest = listPayload.reservations.find(
    (reservation) => reservation.customerName === "Birthday Customer",
  );
  expect(latest).toBeTruthy();

  const detailResponse = await request.get(`/api/reservations/${latest!.id}`, {
    headers: adminHeaders,
  });
  expect(detailResponse.status()).toBe(200);

  const patchResponse = await request.patch(`/api/reservations/${latest!.id}`, {
    headers: adminHeaders,
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
