"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProfileCompleteness } from "@/types/screening";
import { cn } from "@/lib/utils";

interface ProfileCompletenessMeterProps {
  completeness: ProfileCompleteness;
  className?: string;
}

export function ProfileCompletenessMeter({ completeness, className }: ProfileCompletenessMeterProps) {
  const { score, filledFields, missingFields } = completeness;
  const label =
    score >= 80 ? "High confidence profile" : score >= 50 ? "Moderate profile" : "Minimal profile — higher false positive risk";

  return (
    <Card className={cn("border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Profile Completeness</CardTitle>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold tabular-nums">{score}%</span>
          <span className="text-xs text-muted-foreground">More data → fewer false positives</span>
        </div>
        <Progress value={score} className="h-2.5" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-500">Provided</p>
            {filledFields.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {f}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Optional — add to improve</p>
            {missingFields
              .filter((f) => f !== "Full Name")
              .map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <Circle className="h-3.5 w-3.5" />
                  {f}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
