import { NextResponse } from "next/server";
import { greeceComplianceAgentService } from "@/services/greeceComplianceAgentService";
import type { AnalystDecisionInput } from "@/types/screening";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Omit<AnalystDecisionInput, "screeningId">;
    const result = await greeceComplianceAgentService.saveAnalystDecision({
      screeningId: id,
      decision: body.decision,
      notes: body.notes,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save decision";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
