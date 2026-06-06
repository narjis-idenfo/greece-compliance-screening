import type { ScreeningInput } from "@/types/screening";
import type { Part } from "@google/generative-ai";

export function buildResponsesInput(
  userMessage: string,
  input: ScreeningInput
): Part[] {
  const parts: Part[] = [{ text: userMessage }];

  if (input.faceImageBase64) {
    parts.push({
      text: "The image below is the subject's uploaded facial reference. Use it when comparing against PEP/adverse media photos found via web search.",
    } as Part);
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.faceImageBase64,
      },
    } as Part);
  }

  return parts;
}
