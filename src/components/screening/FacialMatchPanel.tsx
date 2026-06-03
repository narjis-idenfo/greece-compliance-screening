"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IdentityAnalysis, ScreeningInput } from "@/types/screening";
import { ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

interface FacialMatchPanelProps {
  input: ScreeningInput;
  analysis: IdentityAnalysis;
}

function subjectPhotoSrc(faceImageBase64?: string): string | null {
  if (!faceImageBase64) return null;
  if (faceImageBase64.startsWith("data:")) return faceImageBase64;
  return `data:image/jpeg;base64,${faceImageBase64}`;
}

function scoreLabel(score: number | null | undefined, hasPhoto: boolean): string {
  if (!hasPhoto) return "N/A";
  if (score === null || score === undefined) return "N/A";
  return `${Math.round(score)}%`;
}

function scoreColor(score: number | null | undefined, hasPhoto: boolean): string {
  if (!hasPhoto || score === null || score === undefined) return "text-muted-foreground";
  if (score >= 80) return "text-rose-400";
  if (score >= 55) return "text-amber-400";
  return "text-emerald-400";
}

export function FacialMatchPanel({ input, analysis }: FacialMatchPanelProps) {
  const hasPhoto = Boolean(input.faceImageBase64?.trim());
  const photoSrc = subjectPhotoSrc(input.faceImageBase64);
  const overallScore = analysis.faceMatchScore;

  return (
    <Card className="border-violet-500/25 bg-gradient-to-br from-violet-500/5 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanFace className="h-5 w-5 text-violet-400" />
          Facial match analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt="Subject reference"
                className="mx-auto h-32 w-32 rounded-2xl object-cover ring-2 ring-violet-500/40 sm:mx-0"
              />
            ) : (
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 sm:mx-0">
                <ScanFace className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Subject reference photo</p>
          </div>
          <div className="flex-1 space-y-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Overall facial match score</p>
              <p className={cn("mt-1 text-3xl font-bold tabular-nums", scoreColor(overallScore, hasPhoto))}>
                {scoreLabel(overallScore, hasPhoto)}
              </p>
              {!hasPhoto && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Upload a face photo when screening to enable facial comparison.
                </p>
              )}
            </div>
            {hasPhoto && overallScore !== null && overallScore !== undefined && (
              <p className="text-sm text-muted-foreground">
                {overallScore >= 80
                  ? "High visual similarity to one or more matches — verify identity carefully."
                  : overallScore >= 55
                    ? "Moderate visual similarity — corroborate with other identifiers."
                    : "Low visual similarity — supports false-positive assessment if other signals are weak."}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
