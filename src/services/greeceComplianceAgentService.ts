/**
 * Greece Compliance Intelligence Agent Service
 *
 * Connects to your ChatGPT compliance agent via OpenAI:
 * - Assistants API when GREECE_COMPLIANCE_ASSISTANT_ID is set
 * - Chat Completions otherwise (uses prompts/screening-agent-system.md)
 *
 * Screenings are persisted to .data/screenings/ so GET works across server instances.
 */

import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import { getAgentConfig } from "@/lib/agent/config";
import { runLiveScreening } from "@/lib/agent/run-live-screening";
import { enrichScreeningWithImagesAndFaces } from "@/lib/images/enrich-screening-images";
import {
  saveScreeningResult,
  loadScreeningResult,
} from "@/lib/screening-store";
import {
  buildMockScreeningResult,
  mockDashboardStats,
} from "@/data/mock-screening-data";
import type {
  AnalystDecisionInput,
  DashboardStats,
  ScreeningInput,
  ScreeningResult,
} from "@/types/screening";

function generateId(): string {
  return `scr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function callGreeceComplianceAgent(
  input: ScreeningInput,
  profileCompleteness: ReturnType<typeof calculateProfileCompleteness>
): Promise<ScreeningResult> {
  const id = generateId();
  const { useLiveAgent } = getAgentConfig();

  if (useLiveAgent) {
    try {
      return await runLiveScreening(id, input, profileCompleteness);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent request failed";
      throw new Error(`Greece Compliance Intelligence: ${message}`);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));
  const result = buildMockScreeningResult(id, input, profileCompleteness.score);
  result.profileCompleteness = profileCompleteness;
  return result;
}

export function isUsingLiveAgent(): boolean {
  return getAgentConfig().useLiveAgent;
}

export const greeceComplianceAgentService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockDashboardStats;
  },

  async submitScreening(
    input: ScreeningInput
  ): Promise<{ screeningId: string; result: ScreeningResult }> {
    const mode = input.screeningMode ?? "form";

    if (mode === "image_only") {
      if (!input.faceImageBase64?.trim()) {
        throw new Error("Upload a face photo for image-led screening");
      }
    } else if (!input.fullName?.trim()) {
      throw new Error("Full name is required for identity form screening");
    }

    const screeningInput: ScreeningInput = {
      ...input,
      screeningMode: mode,
      fullName: input.fullName?.trim() ?? "",
    };

    const profileCompleteness = calculateProfileCompleteness(screeningInput);
    let result = await callGreeceComplianceAgent(screeningInput, profileCompleteness);

    if (getAgentConfig().useLiveAgent) {
      try {
        result = await enrichScreeningWithImagesAndFaces(result);
      } catch (err) {
        console.warn("[submitScreening] image enrichment failed:", err);
      }
    }

    await saveScreeningResult(result);

    return { screeningId: result.id, result };
  },

  async getScreeningResult(screeningId: string): Promise<ScreeningResult | null> {
    const stored = await loadScreeningResult(screeningId);
    if (stored) return stored;

    if (screeningId.startsWith("scr-demo")) {
      const demo = buildMockScreeningResult(
        screeningId,
        {
          fullName: "Nikolaos Papadopoulos",
          fathersName: "Georgios Papadopoulos",
          dateOfBirth: "1975-03-12",
          address: "Athens, Attica, Greece",
        },
        85
      );
      demo.profileCompleteness = calculateProfileCompleteness(demo.input);
      await saveScreeningResult(demo);
      return demo;
    }

    return null;
  },

  async saveAnalystDecision(input: AnalystDecisionInput): Promise<ScreeningResult> {
    const existing = await loadScreeningResult(input.screeningId);
    if (!existing) {
      throw new Error("Screening not found");
    }

    const updated: ScreeningResult = {
      ...existing,
      analystDecision: input.decision,
      analystNotes: input.notes,
    };
    await saveScreeningResult(updated);
    return updated;
  },
};
