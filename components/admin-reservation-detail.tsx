"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminGate, getAdminPassword } from "@/components/admin-gate";
import { createCustomerWhatsAppUrl } from "@/lib/whatsapp";
import {
  deliverySlots,
  statusValues,
  type Reservation,
} from "@/lib/validations";

export function AdminReservationDetail({ id }: { id: string }) {
  return (
    <AdminGate>
      <AdminReservationDetailContent id={id} />
    </AdminGate>
  );
}

function AdminReservationDetailContent({ id }: { id: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [status, setStatus] = useState("");
  const [slot, setSlot] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reservations/${id}`, {
      headers: { "x-admin-password": getAdminPassword() },
    })
      .then((response) => response.json() as Promise<{ reservation: Reservation }>)
      .then((payload) => {
        setReservation(payload.reservation);
        setStatus(payload.reservation.status);
        setSlot(payload.reservation.confirmedDeliverySlot ?? "");
        setAdminNote(payload.reservation.adminNote ?? "");
      });
  }, [id]);

  async function save() {
    setMessage(null);
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getAdminPassword(),
      },
      body: JSON.stringify({
        status,
        confirmedDeliverySlot: slot,
        adminNote,
      }),
    });

    if (!response.ok) {
      setMessage("Save failed.");
      return;
    }

    const payload = (await response.json()) as { reservation: Reservation };
    setReservation(payload.reservation);
    setMessage("Saved.");
  }

  return (
    <main className="min-h-screen bg-[#FFF7EC] p-5">
        <div className="mx-auto max-w-5xl">
          <Link href="/admin/reservations" className="text-sm font-semibold text-[#6B3F2A]">
            Back to reservations
          </Link>
          {!reservation ? (
            <p className="mt-8 text-[#7A6258]">Loading reservation...</p>
          ) : (
            <>
              <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h1 className="text-3xl font-semibold">{reservation.id}</h1>
                  <p className="mt-2 text-[#7A6258]">{reservation.productName}</p>
                </div>
                <a
                  href={createCustomerWhatsAppUrl(reservation)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
                >
                  <MessageCircle size={18} />
                  WhatsApp customer
                </a>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Info title="Basic info" rows={[
                  ["Created", new Date(reservation.createdAt).toLocaleString()],
                  ["Source", reservation.sourcePage],
                  ["Category", reservation.reservationCategory],
                  ["Status", reservation.status],
                ]} />
                <Info title="Customer info" rows={[
                  ["Name", reservation.customerName],
                  ["WhatsApp", reservation.whatsapp],
                  ["Recipient", reservation.recipientName || "-"],
                ]} />
                <Info title="Cake info" rows={[
                  ["Product", reservation.productName],
                  ["Base price", `S$${reservation.basePrice}`],
                  ["Message", reservation.cakeMessage || "-"],
                  ["Flavour", reservation.flavourPreference || "-"],
                  ["Color", reservation.preferredColor || "-"],
                  ["Notes", reservation.notes || "-"],
                ]} />
                <Info title="Delivery info" rows={[
                  ["Date", reservation.deliveryDate],
                  ["Area", reservation.deliveryArea],
                  ["Address", reservation.deliveryAddress || "-"],
                  ["Confirmed slot", reservation.confirmedDeliverySlot || "-"],
                ]} />
              </div>

              <section className="mt-6 rounded-[2rem] bg-[#FFFCF7] p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Operation info</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">Status</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="input">
                      {statusValues.map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">Delivery slot</span>
                    <select value={slot} onChange={(event) => setSlot(event.target.value)} className="input">
                      <option value="">Not confirmed</option>
                      {deliverySlots.map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">Admin note</span>
                  <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={5} className="input resize-none" />
                </label>
                <button onClick={save} className="mt-5 rounded-full bg-[#6B3F2A] px-6 py-3 font-semibold text-white">
                  Save changes
                </button>
                {message ? <span className="ml-4 text-sm text-[#7A6258]">{message}</span> : null}
              </section>
            </>
          )}
        </div>
    </main>
  );
}

function Info({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="rounded-[2rem] bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold text-[#6B3F2A]">{label}</dt>
            <dd className="mt-1 text-[#7A6258]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
