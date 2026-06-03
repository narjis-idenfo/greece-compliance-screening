import type { ProfileCompleteness, ScreeningInput, VisionIdentification } from "@/types/screening";

export function buildScreeningUserMessage(
  input: ScreeningInput,
  profileCompleteness: ProfileCompleteness,
  visionIdentification?: VisionIdentification
): string {
  const payload = {
    task:
      input.screeningMode === "image_only"
        ? "image_led_pep_and_adverse_media_screening"
        : "pep_and_adverse_media_screening",
    jurisdiction: "Greece / EU",
    input: {
      fullName: input.fullName,
      fathersName: input.fathersName ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      address: input.address ?? null,
      hasFaceImage: Boolean(input.faceImageBase64),
      screeningMode: input.screeningMode ?? "form",
    },
    visionIdentification: visionIdentification ?? null,
    profileCompleteness,
    instructions:
      input.screeningMode === "image_only"
        ? "Subject was identified from photo only. Use vision identification and web search to find PEP/adverse media matches. Compare all matches to the reference photo."
        : "Screen this individual. For each PEP and adverse media match, include imageUrl and searchImages with direct HTTPS URLs from real sources when found.",
  };

  return JSON.stringify(payload, null, 2);
}
