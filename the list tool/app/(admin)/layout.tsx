import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(30_20%_8%)_0%,_hsl(264_20%_2%)_60%)]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-6">
        <AdminSidebar />
        <main className="flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
