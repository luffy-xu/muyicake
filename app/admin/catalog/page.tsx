import { redirect } from "next/navigation";
import { AdminCatalogDashboard } from "@/components/admin-catalog";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import { listAdminCollections, listAdminStyles } from "@/lib/catalog";

export default async function AdminCatalogPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const [collections, styles] = await Promise.all([listAdminCollections(), listAdminStyles()]);
  return (
    <AdminShell>
      <AdminCatalogDashboard collectionCount={collections.length} styleCount={styles.length} />
    </AdminShell>
  );
}
