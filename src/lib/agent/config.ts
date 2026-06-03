import { readFileSync } from "fs";
import { join } from "path";

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getAgentConfig() {
  // Gemini for all screening (name + face)
  const googleApiKey = readEnv("GOOGLE_API_KEY");
  const googleModel = readEnv("GOOGLE_MODEL") ?? "gemini-3.1-pro-preview";

  // Config
  const useMockExplicit = readEnv("USE_MOCK_AGENT") === "true";
  const useLiveAgent = Boolean(googleApiKey) && !useMockExplicit;

  return {
    googleApiKey,
    googleModel,
    useLiveAgent,
    systemPrompt: getSystemPrompt(),
  };
}

export function getSystemPrompt(): string {
  const fromEnv = readEnv("GREECE_COMPLIANCE_SYSTEM_PROMPT");
  if (fromEnv) return fromEnv;

  try {
    const promptPath = join(process.cwd(), "prompts", "screening-agent-system.md");
    return readFileSync(promptPath, "utf-8");
  } catch {
    return "You are a compliance screening agent. Respond with JSON only matching the screening result schema.";
  }
}
