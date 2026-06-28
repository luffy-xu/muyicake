"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  MessageCircle,
  PanelRightOpen,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createCustomerWhatsAppUrl } from "@/lib/whatsapp";
import {
  deliverySlots,
  statusValues,
  type Reservation,
} from "@/lib/validations";

type ReservationStatus = Reservation["status"];
type SortKey =
  | "createdAt"
  | "deliveryDate"
  | "customerName"
  | "basePrice"
  | "status";
type SortDirection = "asc" | "desc";

const sortableHeaders: Array<{ key: SortKey; label: string }> = [
  { key: "createdAt", label: "提交时间" },
  { key: "customerName", label: "用户" },
  { key: "basePrice", label: "基础报价" },
  { key: "deliveryDate", label: "配送日期" },
  { key: "status", label: "状态" },
];

export function AdminReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeReservation, setActiveReservation] =
    useState<Reservation | null>(null);

  useEffect(() => {
    fetch("/api/reservations")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("未授权或服务暂不可用");
        }
        return response.json() as Promise<{ reservations: Reservation[] }>;
      })
      .then((payload) => setReservations(payload.reservations))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      const aValue = sortableValue(a, sortKey);
      const bValue = sortableValue(b, sortKey);

      if (aValue > bValue) {
        return modifier;
      }
      if (aValue < bValue) {
        return -modifier;
      }
      return 0;
    });
  }, [reservations, sortDirection, sortKey]);

  function updateSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "customerName" || key === "status" ? "asc" : "desc");
  }

  function replaceReservation(updated: Reservation) {
    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === updated.id ? updated : reservation,
      ),
    );
    setActiveReservation(updated);
  }

  return (
    <div>
      <div className="max-w-7xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">后台管理</p>
            <h1 className="mt-1 text-3xl font-semibold">预订列表</h1>
            <p className="mt-2 text-[#7A6258]">
              管理 WhatsApp 跟进、配送确认与订单状态。
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/users"
              className="rounded-full border border-[#E4B9A8] px-4 py-2 text-sm font-semibold text-[#6B3F2A]"
            >
              用户画像
            </Link>
          </div>
        </div>

        {error ? <p className="mt-5 text-red-600">{error}</p> : null}
        {loading ? (
          <p className="mt-8 flex items-center gap-2 text-[#7A6258]">
            <RefreshCw size={16} className="animate-spin" />
            正在读取预订...
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr>
                <th className="px-4 py-3 font-semibold">预订编号</th>
                {sortableHeaders.map((heading) => (
                  <th key={heading.key} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => updateSort(heading.key)}
                      className="inline-flex items-center gap-1 font-semibold"
                    >
                      {heading.label}
                      {sortKey === heading.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : null}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">WhatsApp</th>
                <th className="px-4 py-3 font-semibold">类型</th>
                <th className="px-4 py-3 font-semibold">蛋糕</th>
                <th className="px-4 py-3 font-semibold">来源</th>
                <th className="px-4 py-3 font-semibold">配送区域</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-[#FFE8DC]">
                  <td className="px-4 py-3 font-semibold">{reservation.id}</td>
                  <td className="px-4 py-3">
                    {new Date(reservation.createdAt).toLocaleString("zh-SG")}
                  </td>
                  <td className="px-4 py-3">{reservation.customerName}</td>
                  <td className="px-4 py-3">S${reservation.basePrice}</td>
                  <td className="px-4 py-3">{reservation.deliveryDate}</td>
                  <td className="px-4 py-3">{reservation.status}</td>
                  <td className="px-4 py-3">{reservation.whatsapp}</td>
                  <td className="px-4 py-3">{reservation.reservationCategory}</td>
                  <td className="px-4 py-3">
                    <span className="block">{reservation.productName}</span>
                    {reservation.selectedStyleName ? (
                      <span className="mt-1 block text-xs text-[#7A6258]">
                        {reservation.selectedStyleName}
                        {reservation.selectedSizeLabel ? ` · ${reservation.selectedSizeLabel}` : ""}
                        {reservation.selectedPrice ? ` · S$${reservation.selectedPrice}` : ""}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.utmSource || reservation.referrer || "-"}
                  </td>
                  <td className="px-4 py-3">{reservation.deliveryArea}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={createCustomerWhatsAppUrl(reservation)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`通过 WhatsApp 联系 ${reservation.customerName}`}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white"
                      >
                        <MessageCircle size={18} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveReservation(reservation)}
                        aria-label={`操作预订 ${reservation.id}`}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-[#6B3F2A] text-white"
                      >
                        <PanelRightOpen size={18} />
                      </button>
                      <Link
                        href={`/admin/reservations/${reservation.id}`}
                        aria-label={`查看预订 ${reservation.id} 详情`}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-[#E4B9A8] text-[#6B3F2A]"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reservations.length && !loading && !error ? (
            <p className="p-6 text-[#7A6258]">还没有预订。</p>
          ) : null}
        </div>
      </div>

      <ReservationOperationDrawer
        reservation={activeReservation}
        onClose={() => setActiveReservation(null)}
        onSaved={replaceReservation}
      />
    </div>
  );
}

function sortableValue(reservation: Reservation, key: SortKey) {
  if (key === "createdAt") {
    return new Date(reservation.createdAt).getTime();
  }
  if (key === "basePrice") {
    return reservation.basePrice;
  }
  return reservation[key] ?? "";
}

function ReservationOperationDrawer({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onSaved: (reservation: Reservation) => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 ${reservation ? "" : "pointer-events-none"}`}
      aria-hidden={!reservation}
    >
      <button
        type="button"
        aria-label="关闭操作抽屉"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          reservation ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-[#FFFCF7] p-5 shadow-xl transition-transform ${
          reservation ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {reservation ? (
          <ReservationOperationForm
            key={`${reservation.id}-${reservation.updatedAt}`}
            reservation={reservation}
            onClose={onClose}
            onSaved={onSaved}
          />
        ) : null}
      </aside>
    </div>
  );
}

function ReservationOperationForm({
  reservation,
  onClose,
  onSaved,
}: {
  reservation: Reservation;
  onClose: () => void;
  onSaved: (reservation: Reservation) => void;
}) {
  const [status, setStatus] = useState(reservation.status);
  const [slot, setSlot] = useState(reservation.confirmedDeliverySlot ?? "");
  const [adminNote, setAdminNote] = useState(reservation.adminNote ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        confirmedDeliverySlot: slot,
        adminNote,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setMessage("保存失败，请稍后重试。");
      return;
    }

    const payload = (await response.json()) as { reservation: Reservation };
    onSaved(payload.reservation);
    setMessage("已保存。");
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#6B3F2A]">预订操作</p>
          <h2 className="mt-1 text-2xl font-semibold">{reservation.id}</h2>
          <p className="mt-2 text-sm text-[#7A6258]">
            {reservation.customerName} · {reservation.productName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[#E4B9A8] px-3 py-2 text-sm font-semibold text-[#6B3F2A]"
        >
          关闭
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        <a
          href={createCustomerWhatsAppUrl(reservation)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white"
        >
          <MessageCircle size={18} />
          WhatsApp 联系
        </a>
        <Link
          href={`/admin/reservations/${reservation.id}`}
          className="inline-flex items-center justify-center rounded-full border border-[#E4B9A8] px-4 py-3 font-semibold text-[#6B3F2A]"
        >
          详情
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">
            状态
          </span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReservationStatus)
            }
            className="input"
          >
            {statusValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">
            配送时段
          </span>
          <select
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
            className="input"
          >
            <option value="">未确认</option>
            {deliverySlots.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">
            内部备注
          </span>
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={6}
            className="input resize-none"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-6 w-full rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "保存中..." : "保存操作"}
      </button>
      {message ? <p className="mt-3 text-sm text-[#7A6258]">{message}</p> : null}
    </>
  );
}
