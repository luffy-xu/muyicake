import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminReservationDetail } from "@/components/admin-reservation-detail";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  return (
    <AdminShell>
      <AdminReservationDetail id={id} />
    </AdminShell>
  );
}
