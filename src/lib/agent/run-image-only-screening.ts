import { identifySubjectFromImageGemini } from "@/lib/agent/run-gemini-image-screening";
import { runGoogleChatScreening } from "@/lib/agent/run-google-chat-screening";
import type {
  ProfileCompleteness,
  ScreeningInput,
  ScreeningResult,
  VisionIdentification,
} from "@/types/screening";

function inputWithVisionIdentity(
  input: ScreeningInput,
  vision: VisionIdentification
): ScreeningInput {
  const displayName =
    vision.estimatedFullName?.trim() ||
    (vision.possibleAliases[0]?.trim() ?? "") ||
    "Unidentified person (image-led search)";

  return {
    ...input,
    screeningMode: "image_only",
    fullName: displayName,
  };
}

/**
 * Vision-led flow: identify subject from photo → web search PEP/adverse media → structured JSON.
 */
export async function runImageOnlyScreening(
  id: string,
  input: ScreeningInput,
  profileCompleteness: ProfileCompleteness
): Promise<ScreeningResult> {
  if (!input.faceImageBase64?.trim()) {
    throw new Error("A face photo is required for image-led screening");
  }

  // Use Gemini's vision to identify the person from face
  const vision = await identifySubjectFromImageGemini(input.faceImageBase64);
  const enrichedInput = inputWithVisionIdentity(input, vision);

  // Screen the identified person using Gemini name screening
  const result = await runGoogleChatScreening(id, enrichedInput, profileCompleteness);

  return {
    ...result,
    screeningMode: "image_only",
    visionIdentification: vision,
    input: enrichedInput,
  };
}
