"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IdentityAnalysis, ScreeningInput } from "@/types/screening";
import { Fingerprint, Minus, Check, X } from "lucide-react";

interface IdentityAnalysisPanelProps {
  analysis: IdentityAnalysis;
  input?: ScreeningInput;
}

function MatchIndicator({ value }: { value: boolean | null }) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-500" />;
  if (value === false) return <X className="h-4 w-4 text-rose-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function IdentityAnalysisPanel({ analysis, input }: IdentityAnalysisPanelProps) {
  const hasPhoto = Boolean(input?.faceImageBase64?.trim());
  const faceValue = hasPhoto
    ? analysis.faceMatchScore !== null && analysis.faceMatchScore !== undefined
      ? `${analysis.faceMatchScore}%`
      : "N/A"
    : "N/A";
  const faceMatchIndicator = hasPhoto
    ? analysis.faceMatchScore !== null && analysis.faceMatchScore !== undefined
      ? analysis.faceMatchScore > 70
      : null
    : null;

  const fields = [
    { label: "Name similarity", value: `${analysis.nameSimilarity}%`, match: null as boolean | null },
    { label: "Date of birth", value: analysis.dobMatch === null ? "Not provided" : analysis.dobMatch ? "Match" : "No match", match: analysis.dobMatch },
    { label: "Address", value: analysis.addressMatch === null ? "Not provided" : analysis.addressMatch ? "Match" : "No match", match: analysis.addressMatch },
    { label: "Father's name", value: analysis.fathersNameMatch === null ? "Not provided" : analysis.fathersNameMatch ? "Match" : "No match", match: analysis.fathersNameMatch },
    { label: "Facial match (vs uploaded photo)", value: faceValue, match: faceMatchIndicator },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Fingerprint className="h-5 w-5 text-cyan-400" />
            Overall identity confidence: {analysis.overallIdentityConfidence}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg bg-muted/20 px-4 py-3">
                <span className="text-sm">{f.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{f.value}</span>
                  <MatchIndicator value={f.match} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-emerald-500">Strengthening factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.strengtheningFactors.map((f) => (
              <p key={f} className="text-sm text-muted-foreground">+ {f}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-amber-500">False positive indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.falsePositiveIndicators.length === 0 ? (
              <p className="text-sm text-muted-foreground">None identified</p>
            ) : (
              analysis.falsePositiveIndicators.map((f) => (
                <p key={f} className="text-sm text-muted-foreground">− {f}</p>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
