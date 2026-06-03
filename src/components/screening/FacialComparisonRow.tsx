"use client";

import type { ScreeningInput } from "@/types/screening";
import { proxyImageUrl } from "@/lib/images/proxy-image-url";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FacialComparisonRowProps {
  input: ScreeningInput;
  sourceImageUrl: string;
  matchName: string;
  facialMatchScore: number | null;
}

function subjectPhotoSrc(faceImageBase64?: string): string | null {
  if (!faceImageBase64) return null;
  if (faceImageBase64.startsWith("data:")) return faceImageBase64;
  return `data:image/jpeg;base64,${faceImageBase64}`;
}

export function FacialComparisonRow({
  input,
  sourceImageUrl,
  matchName,
  facialMatchScore,
}: FacialComparisonRowProps) {
  const subjectSrc = subjectPhotoSrc(input.faceImageBase64);
  const hasPhoto = Boolean(subjectSrc);
  const scoreLabel =
    !hasPhoto ? "N/A" : facialMatchScore !== null ? `${Math.round(facialMatchScore)}%` : "N/A";

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Facial comparison — {matchName}
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={subjectSrc ?? undefined}
            alt="Your upload"
            className="h-24 w-24 rounded-xl object-cover ring-2 ring-cyan-500/30"
          />
          <p className="mt-1 text-xs text-muted-foreground">Subject (uploaded)</p>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxyImageUrl(sourceImageUrl)}
            alt={`Source: ${matchName}`}
            className="h-24 w-24 rounded-xl object-cover ring-2 ring-amber-500/30"
          />
          <p className="mt-1 max-w-[140px] truncate text-xs text-muted-foreground">From source</p>
        </div>
        <div className="rounded-lg bg-muted/30 px-4 py-3 text-center sm:ml-2">
          <p className="text-xs text-muted-foreground">Match score</p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              !hasPhoto || facialMatchScore === null
                ? "text-muted-foreground"
                : facialMatchScore >= 80
                  ? "text-rose-400"
                  : facialMatchScore >= 55
                    ? "text-amber-400"
                    : "text-emerald-400"
            )}
          >
            {scoreLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
