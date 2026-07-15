"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CaseDecisionPanel } from "@/components/screening/CaseDecisionPanel";
import { SubjectProfileCard } from "@/components/screening/SubjectProfileCard";
import { RiskScoreCard } from "@/components/screening/RiskScoreCard";
import { LoadingOverlay } from "@/components/screening/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { fetchScreeningResult } from "@/lib/fetch-screening-result";
import { updateCachedScreeningResult } from "@/lib/screening-session";
import type { AnalystDecision, ScreeningResult } from "@/types/screening";
import { ArrowLeft } from "lucide-react";

export default function CaseReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchScreeningResult(id).then((data) => {
      if (data) setResult(data);
    });
  }, [id]);

  const handleSave = async (decision: AnalystDecision, notes: string) => {
    const res = await fetch(`/api/screening/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, notes }),
    });
    const updated = await res.json();
    if (res.ok) {
      setResult(updated);
      updateCachedScreeningResult(updated);
      setSaved(true);
    }
  };

  if (!result) return <LoadingOverlay message="Loading case for review…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href={`/screening/${id}/results`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case review</h1>
          <p className="text-sm text-muted-foreground">Compliance analyst workflow</p>
        </div>
        {saved && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-500">
            Decision saved
          </span>
        )}
      </div>

      <SubjectProfileCard input={result.input} identityAnalysis={result.identityAnalysis} />

      <RiskScoreCard
        fullName={result.input.fullName}
        overallRiskScore={result.overallRiskScore}
        riskScoreBreakdown={result.riskScoreBreakdown}
        riskCategory={result.riskCategory}
        confidenceScore={result.confidenceScore}
        matchType={result.matchType}
        pepMatchCount={result.pepMatchCount}
        adverseMediaMatchCount={result.adverseMediaMatchCount}
        screenedAt={result.screenedAt}
      />

      <CaseDecisionPanel result={result} onSave={handleSave} />
    </div>
  );
}
