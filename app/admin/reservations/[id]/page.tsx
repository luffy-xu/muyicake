import { AdminReservationDetail } from "@/components/admin-reservation-detail";

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminReservationDetail id={id} />;
}
