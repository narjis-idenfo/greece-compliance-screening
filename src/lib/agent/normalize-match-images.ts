import type { MatchResult, MatchSearchImage, MatchType, RiskCategory } from "@/types/screening";

const VALID_MATCH_TYPES: MatchType[] = ["exact", "possible", "false_positive_likely"];
const VALID_RISK_CATEGORIES: RiskCategory[] = ["Low", "Medium", "High", "Critical"];

function safeMatchType(v: unknown): MatchType {
  if (typeof v === "string" && VALID_MATCH_TYPES.includes(v as MatchType)) return v as MatchType;
  const s = String(v).toLowerCase();
  if (s.includes("exact") || s.includes("confirmed")) return "exact";
  if (s.includes("false") || s.includes("unlikely") || s.includes("no_match")) return "false_positive_likely";
  return "possible";
}

function safeRiskCategory(v: unknown): RiskCategory {
  if (typeof v === "string" && VALID_RISK_CATEGORIES.includes(v as RiskCategory)) return v as RiskCategory;
  const s = String(v).toLowerCase();
  if (s.includes("critical")) return "Critical";
  if (s.includes("high")) return "High";
  if (s.includes("medium") || s.includes("moderate")) return "Medium";
  return "Low";
}

function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeSearchImage(raw: unknown): MatchSearchImage | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isValidImageUrl(o.url)) return null;
  return {
    url: o.url.trim(),
    caption: typeof o.caption === "string" ? o.caption : undefined,
    sourceName: typeof o.sourceName === "string" ? o.sourceName : undefined,
    sourcePageUrl: isValidImageUrl(o.sourcePageUrl) ? o.sourcePageUrl.trim() : undefined,
  };
}

/** Strip invalid image URLs so the UI does not render broken links */
export function normalizeMatchImages(match: MatchResult): MatchResult {
  const imageUrl = isValidImageUrl(match.imageUrl) ? match.imageUrl.trim() : undefined;
  const searchImages = (match.searchImages ?? [])
    .map(normalizeSearchImage)
    .filter((img): img is MatchSearchImage => img !== null);

  const deduped = searchImages.filter(
    (img, i, arr) => arr.findIndex((x) => x.url === img.url) === i
  );

  return {
    ...match,
    matchType: safeMatchType(match.matchType),
    riskLevel: safeRiskCategory(match.riskLevel),
    imageUrl: imageUrl ?? deduped[0]?.url,
    searchImages: deduped.length > 0 ? deduped : undefined,
  };
}

export function normalizeAllMatchImages(matches: MatchResult[]): MatchResult[] {
  return matches.map(normalizeMatchImages);
}
