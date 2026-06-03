"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MatchResult } from "@/types/screening";
import { cn, matchTypeColor, matchTypeLabel, riskBg, riskColor } from "@/lib/utils";
import { MatchSearchImages } from "@/components/screening/MatchSearchImages";
import { ExternalLink } from "lucide-react";

interface MatchResultCardProps {
  match: MatchResult;
  children?: React.ReactNode;
}

export function MatchResultCard({ match, children }: MatchResultCardProps) {
  return (
    <Card className="border-border/50 transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">{match.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border", riskBg(match.riskLevel), riskColor(match.riskLevel))}>
              {match.riskLevel}
            </Badge>
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", matchTypeColor(match.matchType))}>
              {matchTypeLabel(match.matchType)}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{match.sourceType}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Confidence: </span>
            <span className="font-semibold text-cyan-400">{match.confidenceScore}%</span>
          </div>
          {match.publishedDate && (
            <div>
              <span className="text-muted-foreground">Published: </span>
              <span>{match.publishedDate}</span>
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Matched attributes</p>
          <div className="flex flex-wrap gap-1.5">
            {match.matchedAttributes.map((attr) => (
              <Badge key={attr} variant="secondary" className="text-xs">
                {attr}
              </Badge>
            ))}
          </div>
        </div>
        <MatchSearchImages imageUrl={match.imageUrl} searchImages={match.searchImages} />
        <p className="text-sm leading-relaxed text-muted-foreground">{match.explanation}</p>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs font-medium text-amber-500">Recommended action</p>
          <p className="mt-1 text-sm">{match.recommendedAction}</p>
        </div>
        {match.sourceUrl && (
          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:underline"
          >
            View source <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
