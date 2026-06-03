"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskCategory, MatchType } from "@/types/screening";
import { cn, matchTypeColor, matchTypeLabel, riskBg, riskColor } from "@/lib/utils";
import { AlertTriangle, Shield, Target } from "lucide-react";

interface RiskScoreCardProps {
  fullName: string;
  overallRiskScore: number;
  riskCategory: RiskCategory;
  confidenceScore: number;
  matchType: MatchType;
  pepMatchCount: number;
  adverseMediaMatchCount: number;
  screenedAt: string;
}

export function RiskScoreCard({
  fullName,
  overallRiskScore,
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
          <Metric icon={AlertTriangle} label="Overall Risk Score" value={`${overallRiskScore}/100`} accent="text-orange-400" />
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
