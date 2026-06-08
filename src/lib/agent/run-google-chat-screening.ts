import { getGoogleClient } from "@/lib/agent/ai-client";
import { getAgentConfig } from "@/lib/agent/config";
import { buildScreeningUserMessage } from "@/lib/agent/build-screening-message";
import {
  parseAgentScreeningPayload,
  buildScreeningResult,
} from "@/lib/agent/map-agent-response";
import type { ProfileCompleteness, ScreeningInput, ScreeningResult } from "@/types/screening";
import type { Part } from "@google/generative-ai";

export async function runGoogleChatScreening(
  id: string,
  input: ScreeningInput,
  profileCompleteness: ProfileCompleteness
): Promise<ScreeningResult> {
  const config = getAgentConfig();
  const googleAI = getGoogleClient();
  const model = config.googleModel;
  const systemPrompt = config.systemPrompt;
  const userMessage = buildScreeningUserMessage(input, profileCompleteness);

  const genModel = googleAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const messageParts: Part[] = [
    { text: userMessage }
  ];

  if (input.faceImageBase64) {
    messageParts.push({
      text: "Facial reference image for identity correlation (if your analysis supports it):",
    } as Part);
    messageParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.faceImageBase64,
      },
    } as Part);
  }

  console.log(`[Gemini] Sending request — model=${model} screeningId=${id}`);
  const tGemini = Date.now();
  const response = await genModel.generateContent(messageParts);
  console.log(`[Gemini] Response received in ${Date.now() - tGemini}ms`);

  const content = response.response.text();

  if (!content) {
    throw new Error("Google Gemini returned an empty response");
  }

  console.log("[Gemini] raw response length:", content.length, "chars");
  console.log("[Gemini] raw response:\n", content);

  const payload = parseAgentScreeningPayload(content, input);
  console.log("[Google Gemini Chat] parsed payload:", JSON.stringify(payload, null, 2));
  return buildScreeningResult(id, input, profileCompleteness, payload);
}
