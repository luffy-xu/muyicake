import { redirect } from "next/navigation";
import { AdminReservationList } from "@/components/admin-reservation-list";
import { hasAdminSession } from "@/lib/admin-auth";

export default async function AdminReservationsPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return <AdminReservationList />;
}
