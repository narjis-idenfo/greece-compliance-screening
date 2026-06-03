import { analyzeSourceImage } from "@/lib/images/analyze-source-image";

export interface FaceComparisonResult {
  similarityScore: number;
  samePersonLikely: boolean;
  notes: string;
}

/**
 * Compare subject to source image. Returns null if no face or image unavailable.
 */
export async function compareFacesWithVision(
  subjectFaceBase64: string,
  candidateImageUrl: string,
  matchName: string
): Promise<FaceComparisonResult | null> {
  const analysis = await analyzeSourceImage(candidateImageUrl, matchName, subjectFaceBase64);
  if (!analysis?.include || !analysis.hasVisibleFace) return null;
  if (analysis.similarityScore === null) return null;

  return {
    similarityScore: analysis.similarityScore,
    samePersonLikely: analysis.samePersonLikely,
    notes: analysis.notes,
  };
}

export { analyzeSourceImage };
