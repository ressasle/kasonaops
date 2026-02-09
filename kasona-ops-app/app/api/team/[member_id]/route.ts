import { NextResponse } from "next/server";

import { deactivateTeamMember, getTeamMember, updateTeamMember } from "@/lib/data/team";
import type { TeamMemberUpdate } from "@/lib/data/team";

type Params = {
  member_id: string;
};

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const resolved = await params;
  const data = await getTeamMember(resolved.member_id);

  if (!data) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const resolved = await params;
  const payload = (await request.json()) as TeamMemberUpdate;

  const data = await updateTeamMember(resolved.member_id, payload);
  if (!data) {
    return NextResponse.json({ error: "Unable to update team member" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<Params> }) {
  const resolved = await params;
  const success = await deactivateTeamMember(resolved.member_id);

  if (!success) {
    return NextResponse.json({ error: "Unable to deactivate team member" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
