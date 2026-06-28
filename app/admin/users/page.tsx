import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminCustomerPersonas } from "@/components/admin-customer-personas";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <AdminCustomerPersonas />
    </AdminShell>
  );
}
