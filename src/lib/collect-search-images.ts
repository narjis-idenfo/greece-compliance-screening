import type { MatchResult, MatchSearchImage, ScreeningResult } from "@/types/screening";

export interface CollectedSearchImage extends MatchSearchImage {
  id: string;
  matchId: string;
  matchName: string;
  category: "pep" | "adverse_media";
  facialMatchScore: number | null;
}

export function collectSearchImagesFromResult(result: ScreeningResult): CollectedSearchImage[] {
  const items: CollectedSearchImage[] = [];
  const seen = new Set<string>();

  const add = (
    match: MatchResult,
    category: "pep" | "adverse_media",
    img: MatchSearchImage
  ) => {
    if (seen.has(img.url)) return;
    seen.add(img.url);
    items.push({
      ...img,
      id: `${match.id}-${items.length}`,
      matchId: match.id,
      matchName: match.name,
      category,
      facialMatchScore: img.facialMatchScore ?? match.facialMatchScore ?? null,
    });
  };

  const processMatch = (match: MatchResult, category: "pep" | "adverse_media") => {
    if (match.imageUrl) {
      const primary = match.searchImages?.find((i) => i.url === match.imageUrl);
      add(match, category, {
        url: match.imageUrl,
        caption: primary?.caption ?? "Primary match image",
        sourceName: primary?.sourceName,
        sourcePageUrl: primary?.sourcePageUrl ?? match.sourceUrl,
        facialMatchScore: primary?.facialMatchScore ?? match.facialMatchScore ?? null,
      });
    }
    for (const img of match.searchImages ?? []) {
      if (img.url === match.imageUrl) continue;
      add(match, category, img);
    }
  };

  for (const m of result.pepMatches) processMatch(m, "pep");
  for (const m of result.adverseMediaMatches) processMatch(m, "adverse_media");

  return items;
}

export function countSearchImages(result: ScreeningResult): number {
  return collectSearchImagesFromResult(result).length;
}
