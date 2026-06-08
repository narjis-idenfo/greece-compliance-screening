import { normalizeMatchImages } from "@/lib/agent/normalize-match-images";
import { normalizeIdentityForInput, normalizeMatchFacialScores } from "@/lib/agent/normalize-identity-analysis";
import {
  extractImagesFromPage,
  verifyImageUrl,
} from "@/lib/images/extract-images-from-page";
import { analyzeSourceImage } from "@/lib/images/analyze-source-image";
import type { MatchResult, MatchSearchImage, ScreeningInput, ScreeningResult } from "@/types/screening";

const MAX_MATCHES_TO_ENRICH = 6;
const MAX_IMAGES_PER_MATCH = 3;

async function pickValidImages(
  pageUrl: string,
  existing: MatchSearchImage[]
): Promise<MatchSearchImage[]> {
  const candidates: MatchSearchImage[] = [...existing];
  const extracted = await extractImagesFromPage(pageUrl);

  for (const { url, source } of extracted) {
    if (candidates.some((c) => c.url === url)) continue;
    candidates.push({
      url,
      caption: `Extracted from page (${source})`,
      sourcePageUrl: pageUrl,
    });
  }

  const validated: MatchSearchImage[] = [];
  for (const img of candidates.slice(0, 10)) {
    const ok = await verifyImageUrl(img.url);
    if (ok) {
      validated.push({ ...img, caption: img.caption ?? "Verified image from source" });
    }
    if (validated.length >= 8) break;
  }

  return validated;
}

async function enrichMatch(
  match: MatchResult,
  input: ScreeningInput,
  hasSubjectPhoto: boolean
): Promise<MatchResult> {
  const tMatch = Date.now();
  console.log(`[enrichMatch] START "${match.name}" sourceUrl=${match.sourceUrl ?? "none"}`);

  let candidates = match.searchImages ?? [];
  let imageUrl = match.imageUrl;

  if (match.sourceUrl) {
    const tPage = Date.now();
    const fromPage = await pickValidImages(match.sourceUrl, candidates);
    console.log(`[enrichMatch] Page scrape for "${match.name}" → ${fromPage.length} images in ${Date.now() - tPage}ms`);
    if (fromPage.length > 0) candidates = fromPage;
  } else if (imageUrl) {
    const ok = await verifyImageUrl(imageUrl);
    if (!ok) {
      imageUrl = undefined;
      candidates = [];
    } else {
      candidates = [{ url: imageUrl, caption: "Primary match image", sourcePageUrl: match.sourceUrl }];
    }
  }

  const kept: MatchSearchImage[] = [];
  let facialMatchScore: number | null = null;

  for (const img of candidates) {
    if (kept.length >= MAX_IMAGES_PER_MATCH) break;

    const analysis = await analyzeSourceImage(
      img.url,
      match.name,
      hasSubjectPhoto ? input.faceImageBase64 : undefined
    );

    if (!analysis?.include || !analysis.hasVisibleFace) {
      console.log(`[enrichMatch] excluded (no face): ${img.url}`);
      continue;
    }

    const imgScore = hasSubjectPhoto ? analysis.similarityScore : null;

    if (imgScore !== null && (facialMatchScore === null || imgScore > facialMatchScore)) {
      facialMatchScore = imgScore;
    }

    kept.push({
      ...img,
      facialMatchScore: imgScore,
      caption: analysis.notes || img.caption,
    });
  }

  imageUrl = kept[0]?.url;
  const searchImages = kept.length > 0 ? kept : undefined;

  console.log(`[enrichMatch] DONE "${match.name}" — kept=${kept.length} images, facialScore=${facialMatchScore ?? "n/a"}, elapsed=${Date.now() - tMatch}ms`);

  return normalizeMatchImages({
    ...match,
    imageUrl,
    searchImages,
    facialMatchScore: hasSubjectPhoto ? facialMatchScore : null,
  });
}

/**
 * Fetch images from sources, drop non-face images, run facial comparison when upload provided.
 */
export async function enrichScreeningWithImagesAndFaces(
  result: ScreeningResult
): Promise<ScreeningResult> {
  const input = result.input;
  const hasSubjectPhoto = Boolean(input.faceImageBase64?.trim());

  const enrichList = async (matches: MatchResult[]) => {
    const slice = matches.slice(0, MAX_MATCHES_TO_ENRICH);
    const enriched = await Promise.all(
      slice.map((m) => enrichMatch(m, input, hasSubjectPhoto))
    );
    return [...enriched, ...matches.slice(MAX_MATCHES_TO_ENRICH)];
  };

  let pepMatches = await enrichList(result.pepMatches);
  let adverseMediaMatches = await enrichList(result.adverseMediaMatches);

  pepMatches = normalizeMatchFacialScores(input, pepMatches);
  adverseMediaMatches = normalizeMatchFacialScores(input, adverseMediaMatches);

  const facialScores = [...pepMatches, ...adverseMediaMatches]
    .map((m) => m.facialMatchScore)
    .filter((s): s is number => typeof s === "number");

  let identityAnalysis = result.identityAnalysis;
  if (hasSubjectPhoto && facialScores.length > 0) {
    identityAnalysis = normalizeIdentityForInput(input, {
      ...identityAnalysis,
      faceMatchScore: Math.max(...facialScores),
    });
  } else {
    identityAnalysis = normalizeIdentityForInput(input, identityAnalysis);
  }

  const imageCount =
    pepMatches.filter((m) => m.searchImages?.length).length +
    adverseMediaMatches.filter((m) => m.searchImages?.length).length;

  console.log(
    "[enrichScreening] matches with face images:",
    imageCount,
    hasSubjectPhoto ? `(max facial score ${Math.max(...facialScores, 0)}%)` : ""
  );

  return {
    ...result,
    pepMatches,
    adverseMediaMatches,
    pepMatchCount: pepMatches.length,
    adverseMediaMatchCount: adverseMediaMatches.length,
    identityAnalysis,
  };
}
