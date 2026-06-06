import { runGoogleChatScreening } from "@/lib/agent/run-google-chat-screening";
import { runImageOnlyScreening } from "@/lib/agent/run-image-only-screening";
import type { ProfileCompleteness, ScreeningInput, ScreeningResult } from "@/types/screening";

function mergeScreeningResults(
  nameResult: ScreeningResult,
  faceResult: ScreeningResult
): ScreeningResult {
  // Combine results: name screening + face/vision screening (both Gemini)
  return {
    ...nameResult,
    visionIdentification: faceResult.visionIdentification,
    // Higher overall risk if either screening found high risk
    overallRiskScore: Math.max(nameResult.overallRiskScore, faceResult.overallRiskScore),
    riskCategory:
      nameResult.riskCategory === "Critical" || faceResult.riskCategory === "Critical"
        ? "Critical"
        : nameResult.riskCategory === "High" || faceResult.riskCategory === "High"
          ? "High"
          : nameResult.riskCategory === "Medium" || faceResult.riskCategory === "Medium"
            ? "Medium"
            : "Low",
    // Combine matches from both
    pepMatches: [...nameResult.pepMatches, ...faceResult.pepMatches],
    adverseMediaMatches: [...nameResult.adverseMediaMatches, ...faceResult.adverseMediaMatches],
    pepMatchCount: nameResult.pepMatchCount + faceResult.pepMatchCount,
    adverseMediaMatchCount:
      nameResult.adverseMediaMatchCount + faceResult.adverseMediaMatchCount,
    // Update reasoning to reflect both screenings
    agentReasoning: {
      summary: `[Gemini Name Screening + Gemini Face Screening] ${nameResult.agentReasoning.summary}`,
      steps: [
        { title: "Name Screening (Gemini)", detail: nameResult.agentReasoning.summary },
        { title: "Face/Vision Screening (Gemini)", detail: faceResult.agentReasoning.summary },
      ],
      dataPointsUsed: [
        ...nameResult.agentReasoning.dataPointsUsed,
        ...faceResult.agentReasoning.dataPointsUsed,
      ],
      confidenceFactors: [
        ...nameResult.agentReasoning.confidenceFactors,
        ...faceResult.agentReasoning.confidenceFactors,
      ],
    },
  };
}

export async function runLiveScreening(
  id: string,
  input: ScreeningInput,
  profileCompleteness: ProfileCompleteness
): Promise<ScreeningResult> {
  const hasName = input.fullName?.trim();
  const hasFace = input.faceImageBase64?.trim();

  // Only face screening
  if (!hasName && hasFace) {
    return runImageOnlyScreening(id, input, profileCompleteness);
  }

  // Only name screening
  if (hasName && !hasFace) {
    return runGoogleChatScreening(id, input, profileCompleteness);
  }

  // Both name and face - run in parallel
  if (hasName && hasFace) {
    console.log("[Screening] Running parallel: Gemini name screening + Gemini face/vision screening");
    const [nameResult, faceResult] = await Promise.all([
      runGoogleChatScreening(id, input, profileCompleteness),
      runImageOnlyScreening(id, input, profileCompleteness),
    ]);

    console.log("[Screening] Combining results from Gemini name + face screenings");
    return mergeScreeningResults(nameResult, faceResult);
  }

  // No screening data
  throw new Error("Either a name or face image is required for screening");
}
