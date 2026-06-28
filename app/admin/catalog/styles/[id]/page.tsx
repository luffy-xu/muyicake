import { notFound, redirect } from "next/navigation";
import { AdminStyleDetailPage } from "@/components/admin-catalog";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminStyleDetail } from "@/lib/catalog";

export default async function AdminCatalogStyleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const detail = await getAdminStyleDetail(id);
  if (!detail) {
    notFound();
  }

  return (
    <AdminShell>
      <AdminStyleDetailPage
        style={detail.style}
        collections={detail.collections}
        images={detail.images}
        sections={detail.sections}
        sizes={detail.sizes}
      />
    </AdminShell>
  );
}
