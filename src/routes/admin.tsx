import { createFileRoute } from "@tanstack/react-router";
import { AdminAuthGuard } from "@/admin/components/AdminAuthGuard";
import { AdminLayout } from "@/admin/components/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal & Control Center — admin.bg.tools" },
      { name: "description", content: "bg.tools Enterprise Control Panel for traffic, users, tools and revenue." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminLayout />
    </AdminAuthGuard>
  );
}
