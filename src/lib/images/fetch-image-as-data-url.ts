import { isSafePublicUrl } from "@/lib/images/is-safe-url";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 4 * 1024 * 1024;

export interface FetchedImageData {
  dataUrl: string;
  contentType: string;
  byteLength: number;
}

/**
 * Download an image server-side (same path as /api/images/proxy) for Gemini Vision.
 */
export async function fetchImageAsDataUrl(imageUrl: string): Promise<FetchedImageData | null> {
  if (!isSafePublicUrl(imageUrl)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GreeceComplianceScreening/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      console.warn("[fetchImageAsDataUrl] HTTP", res.status, imageUrl);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.warn("[fetchImageAsDataUrl] not an image:", contentType, imageUrl);
      return null;
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      console.warn("[fetchImageAsDataUrl] too large:", buffer.byteLength, imageUrl);
      return null;
    }

    const base64 = Buffer.from(buffer).toString("base64");
    const mime = contentType.split(";")[0].trim() || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    return { dataUrl, contentType: mime, byteLength: buffer.byteLength };
  } catch (err) {
    console.warn("[fetchImageAsDataUrl] failed:", imageUrl, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
