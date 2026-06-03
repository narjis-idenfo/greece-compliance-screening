import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAgentConfig } from "@/lib/agent/config";

let googleClient: GoogleGenerativeAI | null = null;

export function getGoogleClient(): GoogleGenerativeAI {
  const config = getAgentConfig();

  if (!config.googleApiKey) {
    throw new Error("GOOGLE_API_KEY is not set. Add it to .env.local for Gemini screening");
  }

  if (!googleClient) {
    googleClient = new GoogleGenerativeAI(config.googleApiKey);
  }

  return googleClient;
}
