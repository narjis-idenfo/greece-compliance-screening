import { NextResponse } from "next/server";
import { greeceComplianceAgentService } from "@/services/greeceComplianceAgentService";
import type { ScreeningInput } from "@/types/screening";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScreeningInput;
    const { screeningId, result } = await greeceComplianceAgentService.submitScreening(body);
    return NextResponse.json({ screeningId, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Screening failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
