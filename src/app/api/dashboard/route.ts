import { NextResponse } from "next/server";
import { greeceComplianceAgentService } from "@/services/greeceComplianceAgentService";

export async function GET() {
  const stats = await greeceComplianceAgentService.getDashboardStats();
  return NextResponse.json(stats);
}
