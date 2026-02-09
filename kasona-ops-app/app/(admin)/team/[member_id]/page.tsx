import { notFound } from "next/navigation";

import { TeamMemberProfile } from "@/components/admin/team/team-member-profile";
import { getTeamMember } from "@/lib/data/team";

type TeamMemberPageProps = {
  params: Promise<{
    member_id: string;
  }>;
};

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const resolved = await params;
  const member = await getTeamMember(resolved.member_id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <TeamMemberProfile member={member} />
    </div>
  );
}
