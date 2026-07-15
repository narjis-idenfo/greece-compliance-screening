import { normalizeAllMatchImages } from "@/lib/agent/normalize-match-images";
import {
  normalizeIdentityForInput,
  normalizeMatchFacialScores,
} from "@/lib/agent/normalize-identity-analysis";
import { parseJsonRobust } from "@/lib/agent/parse-json-robust";
import type {
  MatchResult,
  RiskCategory,
  ScreeningInput,
  ScreeningResult,
  MatchType,
  ProfileCompleteness,
  AgentReasoning,
  IdentityAnalysis,
  ScreenedInput,
  RCAAnalysis,
  ComplianceAnalystReasoning,
  RiskScoreBreakdown,
  RiskScoreBreakdownEntry,
} from "@/types/screening";

export interface AgentScreeningPayload {
  overallRiskScore: number;
  riskScoreBreakdown: RiskScoreBreakdown;
  riskCategory: RiskCategory;
  confidenceScore: number;
  matchType: MatchType;
  screenedInput?: ScreenedInput;
  pepMatches: MatchResult[];
  adverseMediaMatches: MatchResult[];
  rcaAnalysis?: RCAAnalysis;
  complianceAnalystReasoning?: ComplianceAnalystReasoning;
  identityAnalysis: IdentityAnalysis;
  agentReasoning: AgentReasoning;
}

const RISK_CATEGORIES: RiskCategory[] = ["Low", "Medium", "High", "Critical"];
const MATCH_TYPES: MatchType[] = ["exact", "possible", "false_positive_likely"];

function normalizeRiskCategory(v: unknown): RiskCategory {
  if (typeof v === "string" && RISK_CATEGORIES.includes(v as RiskCategory)) {
    return v as RiskCategory;
  }
  // Map common Gemini variants
  const s = String(v).toLowerCase();
  if (s.includes("critical")) return "Critical";
  if (s.includes("high")) return "High";
  if (s.includes("medium") || s.includes("moderate")) return "Medium";
  return "Low";
}

function normalizeRiskScoreBreakdownEntry(v: unknown): RiskScoreBreakdownEntry {
  if (!v || typeof v !== "object") {
    return { score: 0, rationale: "" };
  }
  const e = v as Record<string, unknown>;
  return {
    score: Number(e.score) || 0,
    rationale: typeof e.rationale === "string" ? e.rationale : "",
  };
}

function normalizeRiskScoreBreakdown(v: unknown): RiskScoreBreakdown {
  const b = (v && typeof v === "object" ? (v as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;
  return {
    sanctions: normalizeRiskScoreBreakdownEntry(b.sanctions),
    pep: normalizeRiskScoreBreakdownEntry(b.pep),
    adverseMedia: normalizeRiskScoreBreakdownEntry(b.adverseMedia),
    identityVerification: normalizeRiskScoreBreakdownEntry(b.identityVerification),
  };
}

function normalizeMatchType(v: unknown): MatchType {
  if (typeof v === "string" && MATCH_TYPES.includes(v as MatchType)) {
    return v as MatchType;
  }
  // Map common Gemini variants like "fuzzy", "partial", "phonetic", "approximate"
  const s = String(v).toLowerCase();
  if (s.includes("exact") || s.includes("confirmed")) return "exact";
  if (s.includes("false") || s.includes("unlikely") || s.includes("no_match")) return "false_positive_likely";
  return "possible";
}

export function parseAgentScreeningPayload(
  text: string,
  input?: ScreeningInput
): AgentScreeningPayload {
  let parsed: unknown;
  try {
    parsed = parseJsonRobust(text);
  } catch (e) {
    throw new Error(
      `Agent did not return valid JSON. ${e instanceof Error ? e.message : "Parse failed"}`
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Agent response must be a JSON object");
  }

  const p = parsed as Record<string, unknown>;

  const riskCategory = normalizeRiskCategory(p.riskCategory);
  const matchType = normalizeMatchType(p.matchType);

  let pepMatches = normalizeAllMatchImages(
    Array.isArray(p.pepMatches) ? (p.pepMatches as MatchResult[]) : []
  );
  let adverseMediaMatches = normalizeAllMatchImages(
    Array.isArray(p.adverseMediaMatches) ? (p.adverseMediaMatches as MatchResult[]) : []
  );

  if (!p.identityAnalysis || typeof p.identityAnalysis !== "object") {
    throw new Error("Missing identityAnalysis in agent response");
  }
  if (!p.agentReasoning || typeof p.agentReasoning !== "object") {
    throw new Error("Missing agentReasoning in agent response");
  }

  let identityAnalysis = p.identityAnalysis as IdentityAnalysis;

  if (input) {
    pepMatches = normalizeMatchFacialScores(input, pepMatches);
    adverseMediaMatches = normalizeMatchFacialScores(input, adverseMediaMatches);
    identityAnalysis = normalizeIdentityForInput(input, identityAnalysis);
  }

  return {
    overallRiskScore: Number(p.overallRiskScore) || 0,
    riskScoreBreakdown: normalizeRiskScoreBreakdown(p.riskScoreBreakdown),
    riskCategory,
    confidenceScore: Number(p.confidenceScore) || 0,
    matchType,
    screenedInput: p.screenedInput as ScreenedInput | undefined,
    pepMatches,
    adverseMediaMatches,
    rcaAnalysis: p.rcaAnalysis as RCAAnalysis | undefined,
    complianceAnalystReasoning: p.complianceAnalystReasoning as ComplianceAnalystReasoning | undefined,
    identityAnalysis,
    agentReasoning: p.agentReasoning as AgentReasoning,
  };
}

export function buildScreeningResult(
  id: string,
  input: ScreeningInput,
  profileCompleteness: ProfileCompleteness,
  payload: AgentScreeningPayload
): ScreeningResult {
  return {
    id,
    screenedAt: new Date().toISOString(),
    screeningMode: input.screeningMode ?? "form",
    input,
    screenedInput: payload.screenedInput,
    profileCompleteness,
    overallRiskScore: payload.overallRiskScore,
    riskScoreBreakdown: payload.riskScoreBreakdown,
    riskCategory: payload.riskCategory,
    confidenceScore: payload.confidenceScore,
    matchType: payload.matchType,
    pepMatches: payload.pepMatches,
    adverseMediaMatches: payload.adverseMediaMatches,
    rcaAnalysis: payload.rcaAnalysis,
    complianceAnalystReasoning: payload.complianceAnalystReasoning,
    pepMatchCount: payload.pepMatches.length,
    adverseMediaMatchCount: payload.adverseMediaMatches.length,
    identityAnalysis: payload.identityAnalysis,
    agentReasoning: payload.agentReasoning,
    analystDecision: null,
    analystNotes: "",
  };
}
