"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SubjectProfileCard } from "@/components/screening/SubjectProfileCard";
import { VisionIdentificationCard } from "@/components/screening/VisionIdentificationCard";
import { Badge } from "@/components/ui/badge";
import { RiskScoreCard } from "@/components/screening/RiskScoreCard";
import { PepMatchCard } from "@/components/screening/PepMatchCard";
import { AdverseMediaCard } from "@/components/screening/AdverseMediaCard";
import { IdentityAnalysisPanel } from "@/components/screening/IdentityAnalysisPanel";
import { FacialMatchPanel } from "@/components/screening/FacialMatchPanel";
import { WebSearchImagesTab } from "@/components/screening/WebSearchImagesTab";
import { AgentReasoningPanel } from "@/components/screening/AgentReasoningPanel";
import { LoadingOverlay } from "@/components/screening/LoadingOverlay";
import { fetchScreeningResult } from "@/lib/fetch-screening-result";
import { countSearchImages } from "@/lib/collect-search-images";
import type { ScreeningResult } from "@/types/screening";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    fetchScreeningResult(id).then((data) => {
      if (data) {
        setResult(data);
      } else {
        setLoadError("Screening not found. It may have expired or the server was restarted before results were saved.");
      }
    });
  }, [id]);

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
        <Button variant="outline" onClick={() => router.push("/screening/new")}>
          Start new screening
        </Button>
      </div>
    );
  }

  if (!result) return <LoadingOverlay message="Loading screening results…" />;

  const imageCount = countSearchImages(result);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Screening results</h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Screened {formatDate(result.screenedAt)} · ID {result.id}
            {result.screeningMode === "image_only" && (
              <Badge className="border-violet-500/40 bg-violet-500/15 text-violet-300">
                Image-led
              </Badge>
            )}
          </p>
        </div>
        <Link href={`/screening/${id}/review`}>
          <Button variant="gradient">
            <ClipboardCheck />
            Case review
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {result.visionIdentification && (
        <VisionIdentificationCard vision={result.visionIdentification} />
      )}

      <SubjectProfileCard input={result.input} identityAnalysis={result.identityAnalysis} />

      <FacialMatchPanel input={result.input} analysis={result.identityAnalysis} />

      <RiskScoreCard
        fullName={result.input.fullName}
        overallRiskScore={result.overallRiskScore}
        riskCategory={result.riskCategory}
        confidenceScore={result.confidenceScore}
        matchType={result.matchType}
        pepMatchCount={result.pepMatchCount}
        adverseMediaMatchCount={result.adverseMediaMatchCount}
        screenedAt={result.screenedAt}
      />

      <Tabs defaultValue="pep" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="pep">PEP Matches ({result.pepMatchCount})</TabsTrigger>
          <TabsTrigger value="media">Adverse Media ({result.adverseMediaMatchCount})</TabsTrigger>
          <TabsTrigger value="images">Source Images ({imageCount})</TabsTrigger>
          <TabsTrigger value="identity">Identity Match Analysis</TabsTrigger>
          <TabsTrigger value="reasoning">Agent Reasoning</TabsTrigger>
        </TabsList>
        <TabsContent value="pep" className="space-y-4">
          {result.pepMatches.map((m) => (
            <PepMatchCard key={m.id} match={m} />
          ))}
        </TabsContent>
        <TabsContent value="media" className="space-y-4">
          {result.adverseMediaMatches.map((m) => (
            <AdverseMediaCard key={m.id} match={m} />
          ))}
        </TabsContent>
        <TabsContent value="images">
          <WebSearchImagesTab result={result} />
        </TabsContent>
        <TabsContent value="identity">
          <IdentityAnalysisPanel analysis={result.identityAnalysis} input={result.input} />
        </TabsContent>
        <TabsContent value="reasoning">
          <AgentReasoningPanel reasoning={result.agentReasoning} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/screening/new")}>
          Run another screening
        </Button>
      </div>
    </div>
  );
}
