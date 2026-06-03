/**
 * Extract and parse JSON from model output (markdown fences, trailing text, minor truncation).
 */

export function extractJsonCandidate(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

/** Attempt to close truncated JSON (unterminated strings / missing brackets). */
export function repairTruncatedJson(json: string): string {
  let s = json.trim();

  // Drop incomplete trailing property (common when output is cut off mid-string)
  s = s.replace(/,?\s*"[^"]*":\s*"[^"]*$/, "");
  s = s.replace(/,?\s*"[^"]*":\s*$/, "");
  s = s.replace(/,?\s*"[^"]*$/, "");
  s = s.replace(/,\s*$/, "");

  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") {
      if (stack.length && stack[stack.length - 1] === c) stack.pop();
    }
  }

  if (inString) s += '"';
  while (stack.length) s += stack.pop();

  return s;
}

export function parseJsonRobust(text: string): unknown {
  const candidate = extractJsonCandidate(text);
  try {
    return JSON.parse(candidate);
  } catch {
    const repaired = repairTruncatedJson(candidate);
    return JSON.parse(repaired);
  }
}
