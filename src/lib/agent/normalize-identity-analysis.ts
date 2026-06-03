import type { IdentityAnalysis, MatchResult, ScreeningInput } from "@/types/screening";

export function normalizeIdentityForInput(
  input: ScreeningInput,
  analysis: IdentityAnalysis
): IdentityAnalysis {
  if (!input.faceImageBase64?.trim()) {
    return {
      ...analysis,
      faceMatchScore: null,
    };
  }
  return analysis;
}

export function normalizeMatchFacialScores(
  input: ScreeningInput,
  matches: MatchResult[]
): MatchResult[] {
  const hasPhoto = Boolean(input.faceImageBase64?.trim());
  return matches.map((m) => ({
    ...m,
    facialMatchScore: hasPhoto
      ? typeof m.facialMatchScore === "number"
        ? Math.min(100, Math.max(0, m.facialMatchScore))
        : null
      : null,
  }));
}
