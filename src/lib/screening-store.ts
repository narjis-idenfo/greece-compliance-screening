import { mkdir, readFile, writeFile, access } from "fs/promises";
import { join } from "path";
import type { ScreeningResult } from "@/types/screening";

const STORE_DIR = join(process.cwd(), ".data", "screenings");

function screeningPath(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  if (safe !== id) {
    throw new Error("Invalid screening ID");
  }
  return join(STORE_DIR, `${safe}.json`);
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
}

export async function saveScreeningResult(result: ScreeningResult): Promise<void> {
  await ensureStoreDir();
  await writeFile(screeningPath(result.id), JSON.stringify(result, null, 2), "utf-8");
}

export async function loadScreeningResult(id: string): Promise<ScreeningResult | null> {
  try {
    const raw = await readFile(screeningPath(id), "utf-8");
    return JSON.parse(raw) as ScreeningResult;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

export async function screeningExists(id: string): Promise<boolean> {
  try {
    await access(screeningPath(id));
    return true;
  } catch {
    return false;
  }
}
