import { NextResponse } from "next/server";
import { getAgentConfig } from "@/lib/agent/config";

export async function GET() {
  const config = getAgentConfig();

  return NextResponse.json({
    mode: config.useLiveAgent ? "live" : "mock",
    provider: "Gemini",
    model: config.googleModel,
    capabilities: ["Name Screening", "Face/Vision Screening"],
    message: config.useLiveAgent
      ? `Gemini ${config.googleModel} — Name screening + Face/Vision screening enabled`
      : "Using mock data — set GOOGLE_API_KEY in .env.local to enable screening",
  });
}
