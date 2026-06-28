import { redirect } from "next/navigation";
import { AdminCollectionsPage } from "@/components/admin-catalog";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import { listAdminCollections } from "@/lib/catalog";

export default async function AdminCatalogCollectionsPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const collections = await listAdminCollections();
  return (
    <AdminShell>
      <AdminCollectionsPage collections={collections} />
    </AdminShell>
  );
}
