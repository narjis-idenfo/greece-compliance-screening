import { NextResponse } from "next/server";
import { greeceComplianceAgentService } from "@/services/greeceComplianceAgentService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await greeceComplianceAgentService.getScreeningResult(id);

  if (!result) {
    return NextResponse.json({ error: "Screening not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
