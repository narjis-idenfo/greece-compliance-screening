import type { ScreeningInput } from "@/types/screening";
import type { ResponseInput } from "openai/resources/responses/responses";

export function buildResponsesInput(
  userMessage: string,
  input: ScreeningInput
): string | ResponseInput {
  if (!input.faceImageBase64) {
    return userMessage;
  }

  return [
    {
      role: "user",
      content: [
        { type: "input_text", text: userMessage },
        {
          type: "input_image",
          detail: "auto",
          image_url: `data:image/jpeg;base64,${input.faceImageBase64}`,
        },
        {
          type: "input_text",
          text: "The image above is the subject's uploaded facial reference. Use it when comparing against PEP/adverse media photos found via web search.",
        },
      ],
    },
  ];
}
