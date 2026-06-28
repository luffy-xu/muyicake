import { redirect } from "next/navigation";
import { AdminImagesPage } from "@/components/admin-catalog";
import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import { listAdminImageManagerData } from "@/lib/catalog";

export default async function AdminCatalogImagesPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const styles = await listAdminImageManagerData();
  return (
    <AdminShell>
      <AdminImagesPage styles={styles} />
    </AdminShell>
  );
}
