"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacialComparisonRow } from "@/components/screening/FacialComparisonRow";
import {
  collectSearchImagesFromResult,
  type CollectedSearchImage,
} from "@/lib/collect-search-images";
import { proxyImageUrl } from "@/lib/images/proxy-image-url";
import type { ScreeningResult } from "@/types/screening";
import { ExternalLink, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebSearchImagesTabProps {
  result: ScreeningResult;
}

function scoreLabel(score: number | null, hasSubjectPhoto: boolean): string {
  if (!hasSubjectPhoto) return "Facial match: N/A";
  if (score === null || score === undefined) return "Facial match: N/A";
  return `Facial match: ${Math.round(score)}%`;
}

function ImageCard({
  image,
  result,
  hasSubjectPhoto,
}: {
  image: CollectedSearchImage;
  result: ScreeningResult;
  hasSubjectPhoto: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const facialScore = image.facialMatchScore;

  if (failed) return null;

  return (
    <Card className="overflow-hidden border-border/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyImageUrl(image.url)}
        alt={image.caption ?? image.matchName}
        className="h-48 w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {image.category === "pep" ? "PEP" : "Adverse Media"}
          </Badge>
          <span className="text-sm font-medium">{image.matchName}</span>
        </div>
        {image.caption && <p className="text-xs text-muted-foreground">{image.caption}</p>}
        <p className="break-all text-[10px] text-muted-foreground/80">{image.url}</p>
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            !hasSubjectPhoto || facialScore === null
              ? "text-muted-foreground"
              : facialScore >= 80
                ? "text-rose-400"
                : facialScore >= 55
                  ? "text-amber-400"
                  : "text-emerald-400"
          )}
        >
          {scoreLabel(facialScore, hasSubjectPhoto)}
        </p>
        {hasSubjectPhoto && facialScore !== null && (
          <FacialComparisonRow
            input={result.input}
            sourceImageUrl={image.url}
            matchName={image.matchName}
            facialMatchScore={facialScore}
          />
        )}
        {image.sourceName && <p className="text-xs text-muted-foreground">{image.sourceName}</p>}
        {image.sourcePageUrl && (
          <a
            href={image.sourcePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:underline"
          >
            Open source page <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export function WebSearchImagesTab({ result }: WebSearchImagesTabProps) {
  const hasSubjectPhoto = Boolean(result.input.faceImageBase64?.trim());
  const images = collectSearchImagesFromResult(result);

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No images could be retrieved from source pages for this screening.
          </p>
          <p className="text-xs text-muted-foreground">
            Sources may block automated access, or matches had no source URLs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Images retrieved from sources ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Images were fetched from match source pages, verified, and loaded through the app proxy.
          {hasSubjectPhoto
            ? " Only images with a visible human face are shown. Facial scores appear when comparison succeeded."
            : " Only source images containing a visible human face are included. Upload a photo to enable facial match scores."}
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            image={img}
            result={result}
            hasSubjectPhoto={hasSubjectPhoto}
          />
        ))}
      </div>
    </div>
  );
}
