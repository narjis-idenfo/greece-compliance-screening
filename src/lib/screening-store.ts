import { mkdir, readFile, writeFile, access } from "fs/promises";
import { join } from "path";
import type { ScreeningResult } from "@/types/screening";

const STORE_DIR = join(process.cwd(), ".data", "screenings");

// In-memory fallback for serverless environments (Vercel, etc.)
const memoryStore = new Map<string, ScreeningResult>();
let useFilesystem = true;

function screeningPath(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  if (safe !== id) {
    throw new Error("Invalid screening ID");
  }
  return join(STORE_DIR, `${safe}.json`);
}

async function ensureStoreDir(): Promise<void> {
  try {
    await mkdir(STORE_DIR, { recursive: true });
  } catch (err) {
    // If we can't create directory (e.g., Vercel serverless), use in-memory storage
    console.warn("[screening-store] Filesystem unavailable, using in-memory storage:", err instanceof Error ? err.message : err);
    useFilesystem = false;
  }
}

export async function saveScreeningResult(result: ScreeningResult): Promise<void> {
  if (!useFilesystem) {
    // Use in-memory storage
    memoryStore.set(result.id, result);
    return;
  }

  try {
    await ensureStoreDir();
    await writeFile(screeningPath(result.id), JSON.stringify(result, null, 2), "utf-8");
  } catch (err) {
    // Fallback to in-memory if filesystem fails
    console.warn("[screening-store] Failed to save to filesystem, using memory:", err instanceof Error ? err.message : err);
    useFilesystem = false;
    memoryStore.set(result.id, result);
  }
}

export async function loadScreeningResult(id: string): Promise<ScreeningResult | null> {
  // Check in-memory store first
  if (memoryStore.has(id)) {
    return memoryStore.get(id) || null;
  }

  // Try filesystem
  if (!useFilesystem) {
    return null;
  }

  try {
    const raw = await readFile(screeningPath(id), "utf-8");
    const result = JSON.parse(raw) as ScreeningResult;
    // Cache in memory
    memoryStore.set(id, result);
    return result;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    // On other errors, disable filesystem access
    console.warn("[screening-store] Filesystem error, switching to memory storage:", err instanceof Error ? err.message : err);
    useFilesystem = false;
    return null;
  }
}

export async function screeningExists(id: string): Promise<boolean> {
  // Check in-memory store
  if (memoryStore.has(id)) {
    return true;
  }

  // Check filesystem
  if (!useFilesystem) {
    return false;
  }

  try {
    await access(screeningPath(id));
    return true;
  } catch {
    return false;
  }
}
