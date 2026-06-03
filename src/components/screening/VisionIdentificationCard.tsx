"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VisionIdentification } from "@/types/screening";
import { Eye } from "lucide-react";

interface VisionIdentificationCardProps {
  vision: VisionIdentification;
}

export function VisionIdentificationCard({ vision }: VisionIdentificationCardProps) {
  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-violet-400" />
          Vision-led identification
          <Badge variant="secondary" className="text-xs">
            {vision.identificationConfidence}% name confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="leading-relaxed text-muted-foreground">{vision.analystSummary}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Estimated name</dt>
            <dd className="font-medium">{vision.estimatedFullName ?? "Could not determine"}</dd>
          </div>
          {vision.apparentAgeRange && (
            <div>
              <dt className="text-muted-foreground">Apparent age</dt>
              <dd>{vision.apparentAgeRange}</dd>
            </div>
          )}
          {vision.regionGuess && (
            <div>
              <dt className="text-muted-foreground">Region guess</dt>
              <dd>{vision.regionGuess}</dd>
            </div>
          )}
          {vision.distinguishingFeatures && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Features</dt>
              <dd>{vision.distinguishingFeatures}</dd>
            </div>
          )}
        </dl>
        {vision.possibleAliases.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Aliases searched</p>
            <div className="flex flex-wrap gap-1.5">
              {vision.possibleAliases.map((a) => (
                <Badge key={a} variant="outline" className="text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {vision.searchQueries.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Web search queries used</p>
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {vision.searchQueries.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
