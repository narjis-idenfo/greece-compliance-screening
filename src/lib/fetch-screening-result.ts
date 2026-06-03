import type { ScreeningResult } from "@/types/screening";
import {
  getCachedScreeningResult,
  updateCachedScreeningResult,
} from "@/lib/screening-session";

export async function fetchScreeningResult(id: string): Promise<ScreeningResult | null> {
  const cached = getCachedScreeningResult(id);
  if (cached) return cached;

  const res = await fetch(`/api/screening/${id}`);
  const data = await res.json();
  if (!res.ok || data.error) return null;

  const result = data as ScreeningResult;
  updateCachedScreeningResult(result);
  return result;
}
