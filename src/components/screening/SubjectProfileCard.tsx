"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IdentityAnalysis, ScreeningInput } from "@/types/screening";
import { User, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectProfileCardProps {
  input: ScreeningInput;
  identityAnalysis?: IdentityAnalysis;
}

function subjectPhotoSrc(faceImageBase64?: string): string | null {
  if (!faceImageBase64) return null;
  if (faceImageBase64.startsWith("data:")) return faceImageBase64;
  return `data:image/jpeg;base64,${faceImageBase64}`;
}

export function SubjectProfileCard({ input, identityAnalysis }: SubjectProfileCardProps) {
  const photoSrc = subjectPhotoSrc(input.faceImageBase64);
  const hasPhoto = Boolean(input.faceImageBase64?.trim());
  const faceScore = identityAnalysis?.faceMatchScore;
  const faceDisplay =
    !hasPhoto ? "N/A" : faceScore !== null && faceScore !== undefined ? `${faceScore}%` : "N/A";

  return (
    <Card className="border-cyan-500/25 bg-gradient-to-br from-cyan-500/5 to-blue-600/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-cyan-400" />
          Person screened
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 justify-center sm:justify-start">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={`Photo of ${input.fullName}`}
                className="h-36 w-36 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-lg"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30">
                <User className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-semibold">{input.fullName}</dd>
            </div>
            {input.fathersName && (
              <div>
                <dt className="text-muted-foreground">Father&apos;s name</dt>
                <dd>{input.fathersName}</dd>
              </div>
            )}
            {input.dateOfBirth && (
              <div>
                <dt className="text-muted-foreground">Date of birth</dt>
                <dd>{input.dateOfBirth}</dd>
              </div>
            )}
            {input.address && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Address</dt>
                <dd>{input.address}</dd>
              </div>
            )}
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <ScanFace className="h-3.5 w-3.5" />
                Facial match score
              </dt>
              <dd
                className={cn(
                  "font-semibold tabular-nums",
                  !hasPhoto || faceScore === null || faceScore === undefined
                    ? "text-muted-foreground"
                    : "text-violet-400"
                )}
              >
                {faceDisplay}
              </dd>
            </div>
            {!input.fathersName && !input.dateOfBirth && !input.address && !photoSrc && (
              <p className="text-muted-foreground sm:col-span-2">
                Only full name provided. Add optional fields on your next screening to improve match accuracy.
              </p>
            )}
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
