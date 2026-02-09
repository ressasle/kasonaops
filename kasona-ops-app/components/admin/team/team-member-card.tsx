import Link from "next/link";
import { Mail, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TeamMember } from "@/lib/data/team";

type TeamMemberCardProps = {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
};

export function TeamMemberCard({ member, onEdit }: TeamMemberCardProps) {
  const initials = `${member.first_name?.[0] ?? ""}${member.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatar_url} alt={member.display_name} className="h-12 w-12 rounded-full border border-border/60 object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
              {initials || "TM"}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold">{member.display_name}</div>
            <div className="text-xs text-muted-foreground">{member.email}</div>
          </div>
        </div>
        <Badge variant={member.is_active ? "success" : "default"}>{member.is_active ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span>Role</span>
          <span className="text-white">{member.role}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span>Department</span>
          <span className="text-white">{member.department ?? "Unassigned"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="outline" className="cursor-pointer">
          <a href={`mailto:${member.email}`}>
            <Mail className="mr-1 h-4 w-4" />
            Email
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="cursor-pointer">
          <Link href={`/team/${member.member_id}`}>
            <UserCircle2 className="mr-1 h-4 w-4" />
            View Profile
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(member)} className="cursor-pointer">
          Edit
        </Button>
      </div>
    </Card>
  );
}
