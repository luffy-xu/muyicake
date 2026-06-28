"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, BookImage, CalendarCheck, Settings } from "lucide-react";

const topItems = [
  { href: "/admin/reservations", label: "数据看板", icon: BarChart3 },
  { href: "/admin/catalog", label: "蛋糕目录", icon: BookImage },
  { href: "/admin/reservations", label: "预订管理", icon: CalendarCheck },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

const sideGroups = [
  {
    title: "蛋糕目录",
    items: [
      { href: "/admin/catalog/collections", label: "系列管理" },
      { href: "/admin/catalog/styles", label: "蛋糕款式" },
      { href: "/admin/catalog/images", label: "图片管理" },
    ],
  },
  {
    title: "预订管理",
    items: [
      { href: "/admin/reservations", label: "全部预订" },
      { href: "/admin/reservations?type=qixi", label: "七夕预订" },
      { href: "/admin/reservations?type=custom", label: "定制预订" },
    ],
  },
  {
    title: "系统设置",
    items: [
      { href: "/admin/settings", label: "站点设置" },
      { href: "/admin/users", label: "用户画像" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const currentHref = currentQuery ? `${pathname}?${currentQuery}` : pathname;

  function isTopActive(href: string, label: string) {
    if (label === "蛋糕目录") {
      return pathname.startsWith("/admin/catalog");
    }
    if (label === "预订管理" || label === "数据看板") {
      return pathname.startsWith("/admin/reservations");
    }
    if (label === "系统设置") {
      return pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/users");
    }
    return pathname === href;
  }

  function isSideActive(href: string) {
    if (href.includes("?")) {
      return currentHref === href;
    }
    if (href === "/admin/reservations") {
      return pathname === href && !currentQuery;
    }
    if (href === "/admin/catalog/styles") {
      return pathname === href || pathname.startsWith("/admin/catalog/styles/");
    }
    return pathname === href;
  }

  return (
    <main className="min-h-screen bg-[#F6F1EA] text-[#2B1E1A]">
      <header className="sticky top-0 z-30 border-b border-[#E8D9CA] bg-[#FFFCF7]">
        <div className="flex min-h-16 items-center justify-between px-5">
          <Link href="/admin/reservations" className="font-semibold text-[#6B3F2A]">
            沐伊后台
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {topItems.map((item) => {
              const Icon = item.icon;
              const active = isTopActive(item.href, item.label);
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-[#6B3F2A] text-white shadow-sm" : "text-[#6B3F2A] hover:bg-[#FFF1E8]"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
              退出
            </button>
          </form>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#E8D9CA] bg-[#FFFCF7] p-4 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start md:overflow-y-auto md:border-b-0 md:border-r">
          <div className="grid gap-4 sm:grid-cols-3 md:block md:space-y-6">
            {sideGroups.map((group) => (
              <section key={group.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A06A55]">
                  {group.title}
                </h2>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = isSideActive(item.href);
                    return (
                      <Link
                        key={`${group.title}-${item.label}`}
                        href={item.href}
                        className={`block rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                          active ? "bg-[#FFF1E8] text-[#2B1E1A] shadow-sm ring-1 ring-[#E4B9A8]" : "text-[#6B3F2A] hover:bg-[#FFF1E8]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>
        <section className="min-w-0 p-4 md:p-6">{children}</section>
      </div>
    </main>
  );
}
