import { describe, expect, it } from "vitest";
import { createReservationId } from "@/lib/reservation-id";

describe("createReservationId", () => {
  it("uses the required MUYI-YYYYMMDD-XXXX format", () => {
    expect(createReservationId(new Date("2026-06-28T00:00:00Z"), 0.42)).toBe(
      "MUYI-20260628-4200",
    );
  });
});
