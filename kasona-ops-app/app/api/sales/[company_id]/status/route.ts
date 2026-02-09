import { NextResponse } from "next/server";

import { updateSalesLeadStatus } from "@/lib/data/sales";

type Params = {
  company_id: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  const companyId = Number(resolvedParams.company_id);
  if (!Number.isFinite(companyId)) {
    return NextResponse.json({ error: "Invalid company_id" }, { status: 400 });
  }

  const body = (await request.json()) as { status?: string };
  if (!body.status?.trim()) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const updated = await updateSalesLeadStatus(companyId, body.status.trim());
  if (!updated) {
    return NextResponse.json({ error: "Unable to update status" }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}
