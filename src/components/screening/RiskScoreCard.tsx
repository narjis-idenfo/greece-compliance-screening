"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RiskCategory, MatchType, RiskScoreBreakdown } from "@/types/screening";
import { cn, matchTypeColor, matchTypeLabel, riskBg, riskColor } from "@/lib/utils";
import { AlertTriangle, Shield, Target } from "lucide-react";

interface RiskScoreCardProps {
  fullName: string;
  overallRiskScore: number;
  riskScoreBreakdown: RiskScoreBreakdown;
  riskCategory: RiskCategory;
  confidenceScore: number;
  matchType: MatchType;
  pepMatchCount: number;
  adverseMediaMatchCount: number;
  screenedAt: string;
}

const BREAKDOWN_CATEGORIES: { key: keyof RiskScoreBreakdown; label: string }[] = [
  { key: "sanctions", label: "Sanctions" },
  { key: "pep", label: "PEP" },
  { key: "adverseMedia", label: "Adverse Media" },
  { key: "identityVerification", label: "Identity Verification" },
];

function categoryFromScore(score: number): RiskCategory {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export function RiskScoreCard({
  fullName,
  overallRiskScore,
  riskScoreBreakdown,
  riskCategory,
  confidenceScore,
  matchType,
  pepMatchCount,
  adverseMediaMatchCount,
}: RiskScoreCardProps) {
  return (
    <Card className="overflow-hidden border-border/60">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Subject screened</p>
            <CardTitle className="mt-1 text-2xl">{fullName}</CardTitle>
          </div>
          <Badge className={cn("border text-sm", riskBg(riskCategory), riskColor(riskCategory))}>
            {riskCategory} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="text-left transition-opacity hover:opacity-80">
                <Metric
                  icon={AlertTriangle}
                  label="Overall Risk Score"
                  value={`${overallRiskScore}/100`}
                  accent="text-orange-400"
                />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Risk score breakdown</DialogTitle>
                <DialogDescription>
                  How the overall score of {overallRiskScore}/100 was composed across risk categories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {BREAKDOWN_CATEGORIES.map(({ key, label }) => {
                  const entry = riskScoreBreakdown[key];
                  const category = categoryFromScore(entry.score);
                  return (
                    <div key={key} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">{label}</p>
                        <Badge className={cn("border text-xs", riskBg(category), riskColor(category))}>
                          {entry.score}/100
                        </Badge>
                      </div>
                      {entry.rationale && (
                        <p className="mt-2 text-sm text-muted-foreground">{entry.rationale}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          <Metric icon={Target} label="Match Confidence" value={`${confidenceScore}%`} accent="text-cyan-400" />
          <Metric icon={Shield} label="PEP Matches" value={String(pepMatchCount)} accent="text-violet-400" />
          <Metric icon={Shield} label="Adverse Media" value={String(adverseMediaMatchCount)} accent="text-rose-400" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", matchTypeColor(matchType))}>
            {matchTypeLabel(matchType)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
      <Icon className={cn("mb-2 h-5 w-5", accent)} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", accent)}>{value}</p>
    </div>
  );
}
