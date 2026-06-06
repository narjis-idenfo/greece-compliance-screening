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
} from "@/types/screening";

export interface AgentScreeningPayload {
  overallRiskScore: number;
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

function isRiskCategory(v: unknown): v is RiskCategory {
  return typeof v === "string" && RISK_CATEGORIES.includes(v as RiskCategory);
}

function isMatchType(v: unknown): v is MatchType {
  return typeof v === "string" && MATCH_TYPES.includes(v as MatchType);
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

  if (!isRiskCategory(p.riskCategory)) {
    throw new Error(`Invalid riskCategory: ${String(p.riskCategory)}`);
  }
  if (!isMatchType(p.matchType)) {
    throw new Error(`Invalid matchType: ${String(p.matchType)}`);
  }

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
    riskCategory: p.riskCategory,
    confidenceScore: Number(p.confidenceScore) || 0,
    matchType: p.matchType,
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
