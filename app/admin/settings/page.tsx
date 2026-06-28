import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <div className="max-w-3xl rounded-2xl bg-[#FFFCF7] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#6B3F2A]">系统设置</p>
        <h1 className="mt-1 text-3xl font-semibold">站点设置</h1>
        <p className="mt-3 leading-7 text-[#7A6258]">
          蛋糕目录、预订管理与后台配置入口已整理在左侧菜单中。
        </p>
      </div>
    </AdminShell>
  );
}
