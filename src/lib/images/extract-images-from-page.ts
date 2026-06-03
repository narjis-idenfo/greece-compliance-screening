import { isSafePublicUrl, resolveUrl } from "@/lib/images/is-safe-url";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 2_000_000;

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

function extractImgSrcs(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const resolved = resolveUrl(m[1], baseUrl);
    if (resolved) urls.push(resolved);
  }
  return urls;
}

function scoreImageCandidate(url: string): number {
  const lower = url.toLowerCase();
  let score = 0;
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(lower)) score += 30;
  if (/(portrait|photo|headshot|face|profile|avatar|mp|member)/i.test(lower)) score += 20;
  if (/(logo|icon|sprite|banner|ad|pixel|1x1|tracking)/i.test(lower)) score -= 40;
  if (lower.includes("svg")) score -= 30;
  return score;
}

export interface ExtractedPageImage {
  url: string;
  source: "og:image" | "twitter:image" | "img";
}

/**
 * Fetch a source page and extract likely person/article image URLs.
 */
export async function extractImagesFromPage(pageUrl: string): Promise<ExtractedPageImage[]> {
  if (!isSafePublicUrl(pageUrl)) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GreeceComplianceScreening/1.0; +https://example.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) return [];

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) return [];

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const baseUrl = res.url || pageUrl;
    const found: ExtractedPageImage[] = [];
    const seen = new Set<string>();

    const add = (url: string, source: ExtractedPageImage["source"]) => {
      const resolved = resolveUrl(url, baseUrl);
      if (!resolved || !isSafePublicUrl(resolved)) return;
      if (seen.has(resolved)) return;
      seen.add(resolved);
      found.push({ url: resolved, source });
    };

    const og = metaContent(html, "og:image");
    if (og) add(og, "og:image");

    const twitter = metaContent(html, "twitter:image");
    if (twitter) add(twitter, "twitter:image");

    const imgs = extractImgSrcs(html, baseUrl);
    for (const img of imgs.slice(0, 30)) {
      add(img, "img");
    }

    return found
      .sort((a, b) => scoreImageCandidate(b.url) - scoreImageCandidate(a.url))
      .slice(0, 5);
  } catch (err) {
    console.warn("[extractImagesFromPage] failed:", pageUrl, err);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verify URL returns an image content-type (HEAD, then GET range).
 */
export async function verifyImageUrl(imageUrl: string): Promise<boolean> {
  if (!isSafePublicUrl(imageUrl)) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    let res = await fetch(imageUrl, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GreeceComplianceBot/1.0)" },
      redirect: "follow",
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.startsWith("image/")) return true;
    }

    res = await fetch(imageUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GreeceComplianceBot/1.0)",
        Range: "bytes=0-512",
      },
      redirect: "follow",
    });

    const ct = res.headers.get("content-type") ?? "";
    return res.ok && ct.startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
