import { NextResponse } from "next/server";

import { createTeamMember, getTeamMembers } from "@/lib/data/team";
import type { TeamMemberInsert } from "@/lib/data/team";

export async function GET() {
  const data = await getTeamMembers(true);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as TeamMemberInsert;

  if (!payload.member_id?.trim()) {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }
  if (!payload.first_name?.trim() || !payload.last_name?.trim()) {
    return NextResponse.json({ error: "first_name and last_name are required" }, { status: 400 });
  }
  if (!payload.display_name?.trim()) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 });
  }
  if (!payload.email?.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const data = await createTeamMember(payload);
  if (!data) {
    return NextResponse.json({ error: "Unable to create team member" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
