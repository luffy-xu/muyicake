"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CustomerPersona } from "@/lib/customers";
import { createCustomerWhatsAppUrl, normalizeWhatsApp } from "@/lib/whatsapp";
import type { Reservation } from "@/lib/validations";

export function AdminReservationDetail({ id }: { id: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [customer, setCustomer] = useState<CustomerPersona | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("无法读取预订详情");
        }
        return response.json() as Promise<{ reservation: Reservation }>;
      })
      .then(async (payload) => {
        setReservation(payload.reservation);
        const customerResponse = await fetch(
          `/api/admin/customers/${encodeURIComponent(
            normalizeWhatsApp(payload.reservation.whatsapp),
          )}`,
        );
        if (customerResponse.ok) {
          const customerPayload =
            (await customerResponse.json()) as { customer: CustomerPersona };
          setCustomer(customerPayload.customer);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  const analysisRows = useMemo(() => {
    if (!reservation) {
      return [];
    }

    return [
      ["入口页面", reservation.landingPath || reservation.sourcePage],
      ["UTM source", reservation.utmSource || "-"],
      ["UTM medium", reservation.utmMedium || "-"],
      ["UTM campaign", reservation.utmCampaign || "-"],
      ["Referrer", reservation.referrer || "-"],
      ["会员兴趣", reservation.isInterestedInMembership ? "有兴趣" : "未勾选"],
    ] satisfies [string, string][];
  }, [reservation]);

  return (
    <div>
      <div className="max-w-6xl">
        <Link href="/admin/reservations" className="text-sm font-semibold text-[#6B3F2A]">
          返回预订列表
        </Link>
        {error ? <p className="mt-8 text-red-600">{error}</p> : null}
        {!reservation && !error ? (
          <p className="mt-8 text-[#7A6258]">正在读取预订详情...</p>
        ) : null}
        {reservation ? (
          <>
            <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-[#6B3F2A]">预订详情</p>
                <h1 className="mt-1 text-3xl font-semibold">{reservation.id}</h1>
                <p className="mt-2 text-[#7A6258]">{reservation.productName}</p>
              </div>
              <a
                href={createCustomerWhatsAppUrl(reservation)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
              >
                <MessageCircle size={18} />
                WhatsApp 联系用户
              </a>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <Info
                title="订单"
                rows={[
                  ["提交时间", new Date(reservation.createdAt).toLocaleString("zh-SG")],
                  ["状态", reservation.status],
                  ["类型", reservation.reservationCategory],
                  ["蛋糕", reservation.productName],
                  ["基础报价", `S$${reservation.basePrice}`],
                  ["已选款式", reservation.selectedStyleName || "-"],
                  ["已选尺寸", reservation.selectedSizeLabel || "-"],
                  ["已选价格", reservation.selectedPrice ? `S$${reservation.selectedPrice}` : "-"],
                  ["配送日期", reservation.deliveryDate],
                  ["配送区域", reservation.deliveryArea],
                  ["配送地址", reservation.deliveryAddress || "-"],
                  ["已确认时段", reservation.confirmedDeliverySlot || "-"],
                  ["内部备注", reservation.adminNote || "-"],
                ]}
              />
              <Info
                title="用户信息追踪"
                rows={[
                  ["用户", reservation.customerName],
                  ["WhatsApp", reservation.whatsapp],
                  ["收件人", reservation.recipientName || "-"],
                  ["历史预订", customer ? `${customer.reservationCount} 次` : "-"],
                  [
                    "已完成",
                    customer ? `${customer.completedReservationCount} 次` : "-",
                  ],
                  [
                    "累计基础报价",
                    customer ? `S$${customer.totalQuotedBasePrice}` : "-",
                  ],
                  ["偏好区域", customer?.preferredDeliveryArea ?? "-"],
                  ["偏好类型", customer?.preferredProductCategory ?? "-"],
                  [
                    "首次出现",
                    customer
                      ? new Date(customer.firstSeenAt).toLocaleString("zh-SG")
                      : "-",
                  ],
                ]}
              />
              <Info title="分析明细" rows={analysisRows} />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <Info
                title="定制需求"
                rows={[
                  ["蛋糕文字", reservation.cakeMessage || "-"],
                  ["年龄", reservation.age || "-"],
                  ["口味偏好", reservation.flavourPreference || "-"],
                  ["颜色偏好", reservation.preferredColor || "-"],
                  ["风格偏好", reservation.stylePreference || "-"],
                  ["预算范围", reservation.budgetRange || "-"],
                  ["照片服务", reservation.photoService || "-"],
                  ["参考图", reservation.referenceImageUrl || "-"],
                  ["过敏提醒", reservation.allergyNote || "-"],
                  ["备注", reservation.notes || "-"],
                ]}
              />
              <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
                <h2 className="text-xl font-semibold">历史预订</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {customer?.reservations.length ? (
                    customer.reservations.map((item) => (
                      <Link
                        key={item.id}
                        href={`/admin/reservations/${item.id}`}
                        className="block rounded-xl border border-[#FFE8DC] p-3"
                      >
                        <span className="block font-semibold text-[#2B1E1A]">
                          {item.id} · {item.productName}
                        </span>
                        <span className="mt-1 block text-[#7A6258]">
                          {item.deliveryDate} · {item.status} · S${item.basePrice}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-[#7A6258]">暂无可关联的历史预订。</p>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Info({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold text-[#6B3F2A]">{label}</dt>
            <dd className="mt-1 break-words text-[#7A6258]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
