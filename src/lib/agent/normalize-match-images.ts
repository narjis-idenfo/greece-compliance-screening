import type { MatchResult, MatchSearchImage } from "@/types/screening";

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
    imageUrl: imageUrl ?? deduped[0]?.url,
    searchImages: deduped.length > 0 ? deduped : undefined,
  };
}

export function normalizeAllMatchImages(matches: MatchResult[]): MatchResult[] {
  return matches.map(normalizeMatchImages);
}
