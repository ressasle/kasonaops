import { Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { QuickActionButton } from "@/components/admin/quick-action-button";
import { RealtimeSync } from "@/components/admin/realtime-sync";
import { Input } from "@/components/ui/input";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(30_20%_8%)_0%,_hsl(264_20%_2%)_60%)]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-6">
        <AdminSidebar />
        <main className="flex-1 space-y-8">
          <RealtimeSync />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers, assets, tasks..."
                className="pl-10 bg-black/20 border-border/50"
              />
            </div>
            <QuickActionButton />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
