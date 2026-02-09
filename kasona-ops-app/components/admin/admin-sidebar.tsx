"use client";

import { ClipboardCheck, DollarSign, LayoutGrid, Megaphone, Settings, Users, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Sales", href: "/sales", icon: Megaphone },
  { label: "Operations", href: "/operations", icon: ClipboardCheck },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Team", href: "/team", icon: Users2 },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-sm font-bold text-black">
          K
        </div>
        <div>
          <div className="headline-serif text-lg">Kasona Ops</div>
          <div className="text-xs text-muted-foreground">CRM + Fulfillment</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <SidebarItem key={item.label} className={isActive ? "bg-white/5" : undefined}>
              <Link href={item.href as any} className="flex w-full items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarItem>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <div className="glass-panel rounded-2xl p-4">
          <div className="label-mono text-xs text-muted-foreground">Today</div>
          <div className="mt-2 text-sm font-semibold">12 active deals</div>
          <div className="text-xs text-muted-foreground">3 meetings scheduled</div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">SLA Alerts</span>
            <Badge variant="warning">2</Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
