import type { ScreeningResult } from "@/types/screening";

const KEY_PREFIX = "screening:result:";

export function cacheScreeningResult(result: ScreeningResult): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY_PREFIX + result.id, JSON.stringify(result));
  } catch {
    // Quota exceeded or private mode — GET /api will still work with disk store
  }
}

export function getCachedScreeningResult(id: string): ScreeningResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as ScreeningResult;
  } catch {
    return null;
  }
}

export function updateCachedScreeningResult(result: ScreeningResult): void {
  cacheScreeningResult(result);
}
