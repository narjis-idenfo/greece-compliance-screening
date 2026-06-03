import { getGoogleClient } from "@/lib/agent/ai-client";
import { getAgentConfig } from "@/lib/agent/config";
import { parseJsonRobust } from "@/lib/agent/parse-json-robust";
import type { VisionIdentification } from "@/types/screening";


export async function identifySubjectFromImageGemini(
  faceImageBase64: string
): Promise<VisionIdentification> {
  const config = getAgentConfig();
  const googleAI = getGoogleClient();
  const model = config.googleModel;

  const genModel = googleAI.getGenerativeModel({
    model,
  });

  const response = await genModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a compliance identity analyst. The user provided ONLY this photograph (no name).

Examine the face and context. Return JSON only:
{
  "estimatedFullName": string or null (best guess at full name if inferable from context like captions/watermarks visible in image, else null),
  "possibleAliases": string[] (alternate spellings or partial names to search),
  "apparentAgeRange": string or null (e.g. "40-50"),
  "regionGuess": string or null (likely country/region of origin or context),
  "distinguishingFeatures": string (hair, glasses, facial hair, scars, etc. — for compliance matching),
  "searchQueries": string[] (3-5 search queries to find this person's PEP/adverse media footprint — use names if guessed, else descriptive queries),
  "identificationConfidence": number 0-100 (how confident you are in estimatedFullName),
  "analystSummary": string (2 sentences for compliance analyst)
}

Do not invent a name with high confidence unless there is reasonable visual/contextual basis. Prefer searchQueries that help identify potential PEP matches.`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: faceImageBase64,
            },
          },
        ],
      },
    ],
  });

  const raw = response.response.text();
  if (!raw) {
    throw new Error("Gemini vision identification returned empty response");
  }

  const p = parseJsonRobust(raw) as Record<string, unknown>;

  const identification: VisionIdentification = {
    estimatedFullName:
      typeof p.estimatedFullName === "string" && p.estimatedFullName.trim()
        ? p.estimatedFullName.trim()
        : null,
    possibleAliases: Array.isArray(p.possibleAliases)
      ? (p.possibleAliases as string[]).filter((a) => typeof a === "string")
      : [],
    apparentAgeRange: typeof p.apparentAgeRange === "string" ? p.apparentAgeRange : null,
    regionGuess: typeof p.regionGuess === "string" ? p.regionGuess : null,
    distinguishingFeatures:
      typeof p.distinguishingFeatures === "string" ? p.distinguishingFeatures : "",
    searchQueries: Array.isArray(p.searchQueries)
      ? (p.searchQueries as string[]).filter((q) => typeof q === "string").slice(0, 6)
      : [],
    identificationConfidence: Math.min(
      100,
      Math.max(0, Math.round(Number(p.identificationConfidence) || 0))
    ),
    analystSummary: typeof p.analystSummary === "string" ? p.analystSummary : "",
  };

  console.log("[Gemini Vision] Face identification:", JSON.stringify(identification, null, 2));

  return identification;
}
