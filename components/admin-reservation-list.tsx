"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminGate, getAdminPassword } from "@/components/admin-gate";
import type { Reservation } from "@/lib/validations";

export function AdminReservationList() {
  return (
    <AdminGate>
      <AdminReservationListContent />
    </AdminGate>
  );
}

function AdminReservationListContent() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reservations", {
      headers: { "x-admin-password": getAdminPassword() },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unauthorized or unavailable");
        }
        return response.json() as Promise<{ reservations: Reservation[] }>;
      })
      .then((payload) => setReservations(payload.reservations))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF7EC] p-5">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold">Reservations</h1>
          <p className="mt-2 text-[#7A6258]">Manage WhatsApp follow-up and delivery confirmation.</p>
          {error ? <p className="mt-5 text-red-600">{error}</p> : null}
          <div className="mt-6 overflow-x-auto rounded-3xl bg-[#FFFCF7] shadow-sm">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
                <tr>
                  {[
                    "Reservation ID",
                    "Created At",
                    "Customer Name",
                    "WhatsApp",
                    "Category",
                    "Product",
                    "Base Price",
                    "Delivery Date",
                    "Delivery Area",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-t border-[#FFE8DC]">
                    <td className="px-4 py-3 font-semibold">{reservation.id}</td>
                    <td className="px-4 py-3">{new Date(reservation.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{reservation.customerName}</td>
                    <td className="px-4 py-3">{reservation.whatsapp}</td>
                    <td className="px-4 py-3">{reservation.reservationCategory}</td>
                    <td className="px-4 py-3">{reservation.productName}</td>
                    <td className="px-4 py-3">S${reservation.basePrice}</td>
                    <td className="px-4 py-3">{reservation.deliveryDate}</td>
                    <td className="px-4 py-3">{reservation.deliveryArea}</td>
                    <td className="px-4 py-3">{reservation.status}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reservations/${reservation.id}`}
                        className="rounded-full bg-[#6B3F2A] px-4 py-2 font-semibold text-white"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!reservations.length && !error ? (
              <p className="p-6 text-[#7A6258]">No reservations yet.</p>
            ) : null}
          </div>
        </div>
    </main>
  );
}
