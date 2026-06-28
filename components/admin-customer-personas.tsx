"use client";

import Link from "next/link";
import { MessageCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CustomerPersona } from "@/lib/customers";

export function AdminCustomerPersonas() {
  const [customers, setCustomers] = useState<CustomerPersona[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("无法读取用户数据库");
        }
        return response.json() as Promise<{ customers: CustomerPersona[] }>;
      })
      .then((payload) => setCustomers(payload.customers))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(
    () => ({
      users: customers.length,
      reservations: customers.reduce(
        (total, customer) => total + customer.reservationCount,
        0,
      ),
      completed: customers.reduce(
        (total, customer) => total + customer.completedReservationCount,
        0,
      ),
    }),
    [customers],
  );

  return (
    <div>
      <div className="max-w-7xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">用户画像</p>
            <h1 className="mt-1 text-3xl font-semibold">用户数据库</h1>
            <p className="mt-2 text-[#7A6258]">
              使用 WhatsApp 号码识别用户，并汇总历史预订表现。
            </p>
          </div>
          <Link
            href="/admin/reservations"
            className="rounded-full border border-[#E4B9A8] px-4 py-2 text-sm font-semibold text-[#6B3F2A]"
          >
            返回预订
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="用户数" value={totals.users.toString()} />
          <Metric label="历史预订" value={totals.reservations.toString()} />
          <Metric label="已完成" value={totals.completed.toString()} />
        </div>

        {error ? <p className="mt-5 text-red-600">{error}</p> : null}
        {loading ? (
          <p className="mt-8 flex items-center gap-2 text-[#7A6258]">
            <RefreshCw size={16} className="animate-spin" />
            正在读取用户数据库...
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr>
                {[
                  "用户",
                  "WhatsApp",
                  "预订次数",
                  "完成",
                  "取消",
                  "累计基础报价",
                  "偏好区域",
                  "偏好类型",
                  "最近状态",
                  "最近预订",
                  "操作",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.whatsappKey} className="border-t border-[#FFE8DC]">
                  <td className="px-4 py-3 font-semibold">{customer.name}</td>
                  <td className="px-4 py-3">{customer.whatsappDisplay}</td>
                  <td className="px-4 py-3">{customer.reservationCount}</td>
                  <td className="px-4 py-3">{customer.completedReservationCount}</td>
                  <td className="px-4 py-3">{customer.cancelledReservationCount}</td>
                  <td className="px-4 py-3">S${customer.totalQuotedBasePrice}</td>
                  <td className="px-4 py-3">{customer.preferredDeliveryArea ?? "-"}</td>
                  <td className="px-4 py-3">{customer.preferredProductCategory ?? "-"}</td>
                  <td className="px-4 py-3">{customer.lastStatus ?? "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(customer.lastSeenAt).toLocaleString("zh-SG")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${customer.whatsappKey}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`通过 WhatsApp 联系 ${customer.name}`}
                      className="inline-flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white"
                    >
                      <MessageCircle size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!customers.length && !loading && !error ? (
            <p className="p-6 text-[#7A6258]">还没有用户记录。</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#7A6258]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#2B1E1A]">{value}</p>
    </section>
  );
}
