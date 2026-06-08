import { getGoogleClient } from "@/lib/agent/ai-client";
import { getAgentConfig } from "@/lib/agent/config";
import { parseJsonRobust } from "@/lib/agent/parse-json-robust";
import { fetchImageAsDataUrl } from "@/lib/images/fetch-image-as-data-url";

export interface SourceImageAnalysis {
  /** Include this image in screening results */
  include: boolean;
  hasVisibleFace: boolean;
  similarityScore: number | null;
  samePersonLikely: boolean;
  notes: string;
}

const NO_FACE_PATTERNS =
  /no (visible |discernible |human )?face|no person|not a person|logo|building only|landscape only|no facial|without a face|no face/i;

function notesContradictScore(score: number, notes: string): boolean {
  const n = notes.toLowerCase();
  if (score >= 70 && /different people|not the same|distinct persons|clearly different|unlikely to be/i.test(n)) {
    return true;
  }
  if (score <= 25 && /same person|likely the same|very likely same|strong match|appears to be the same/i.test(n)) {
    return true;
  }
  return false;
}

function alignedNotes(score: number): string {
  if (score >= 80) return "Strong visual similarity to the screening subject.";
  if (score >= 55) return "Moderate resemblance; corroborate with other identifiers.";
  if (score >= 20) return "Limited resemblance; likely a different individual.";
  return "Low or no facial similarity to the screening subject.";
}

function normalizeAnalysis(
  raw: Record<string, unknown>,
  hasSubjectPhoto: boolean
): SourceImageAnalysis {
  const hasVisibleFace = Boolean(raw.hasVisibleFace);
  let similarityScore: number | null = null;

  if (hasSubjectPhoto && hasVisibleFace && raw.similarityScore != null) {
    const n = Number(raw.similarityScore);
    if (!Number.isNaN(n)) similarityScore = Math.min(100, Math.max(0, Math.round(n)));
  }

  let samePersonLikely = Boolean(raw.samePersonLikely);
  let notes = typeof raw.notes === "string" ? raw.notes.trim() : "";

  if (!hasVisibleFace) {
    return {
      include: false,
      hasVisibleFace: false,
      similarityScore: null,
      samePersonLikely: false,
      notes: notes || "Excluded: no visible human face in source image.",
    };
  }

  if (hasSubjectPhoto && similarityScore !== null) {
    if (similarityScore >= 70) samePersonLikely = true;
    if (similarityScore <= 30) samePersonLikely = false;

    if (notesContradictScore(similarityScore, notes) || NO_FACE_PATTERNS.test(notes)) {
      notes = alignedNotes(similarityScore);
    }
  } else if (!hasSubjectPhoto) {
    notes = notes || "Human face detected in source image.";
  }

  return {
    include: true,
    hasVisibleFace: true,
    similarityScore,
    samePersonLikely,
    notes,
  };
}

/**
 * Analyze a source image using Gemini: detect face, optionally compare to subject upload.
 * Returns null if image could not be downloaded.
 */
export async function analyzeSourceImage(
  candidateImageUrl: string,
  matchName: string,
  subjectFaceBase64?: string
): Promise<SourceImageAnalysis | null> {
  const fetched = await fetchImageAsDataUrl(candidateImageUrl);
  if (!fetched) return null;

  const config = getAgentConfig();
  const googleAI = getGoogleClient();
  const model = config.googleModel;
  const hasSubjectPhoto = Boolean(subjectFaceBase64?.trim());

  const genModel = googleAI.getGenerativeModel({ model });

  const messageParts: unknown[] = [];

  if (hasSubjectPhoto && subjectFaceBase64) {
    messageParts.push({
      text: `Compliance facial review for "${matchName}".

Image 1 = screening subject (reference upload).
Image 2 = photo from an external source.

Return JSON only:
{
  "hasVisibleFace": boolean (true only if image 2 shows a clearly visible human face),
  "similarityScore": number 0-100 or null (null if hasVisibleFace is false),
  "samePersonLikely": boolean,
  "notes": string (max 80 chars, MUST match similarityScore)
}

Scoring: 80-100 strong match, 55-79 uncertain, 20-54 probably different, 0-19 clearly different.`,
    });
    messageParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: subjectFaceBase64,
      },
    });
  } else {
    messageParts.push({
      text: `Review image from source about "${matchName}".

Return JSON only:
{
  "hasVisibleFace": boolean,
  "similarityScore": null,
  "samePersonLikely": false,
  "notes": string (max 60 chars)
}`,
    });
  }

  messageParts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: fetched.dataUrl.split(",")[1] || fetched.dataUrl,
    },
  });

  try {
    console.log(`[analyzeSourceImage] Calling Gemini Vision for "${matchName}" — url=${candidateImageUrl.slice(0, 80)}`);
    const tVision = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await genModel.generateContent(messageParts as any);
    console.log(`[analyzeSourceImage] Gemini Vision replied in ${Date.now() - tVision}ms`);

    const rawText = response.response.text();
    if (!rawText) return null;

    const parsed = parseJsonRobust(rawText) as Record<string, unknown>;
    const result = normalizeAnalysis(parsed, hasSubjectPhoto);

    console.log(
      `[analyzeSourceImage Gemini] ${matchName}: include=${result.include} face=${result.hasVisibleFace}` +
        (result.similarityScore != null ? ` score=${result.similarityScore}%` : "") +
        ` — ${result.notes}`
    );

    return result;
  } catch (err) {
    console.warn("[analyzeSourceImage Gemini] failed:", candidateImageUrl, err);
    return null;
  }
}
