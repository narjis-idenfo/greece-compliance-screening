"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { RecentScreenings } from "@/components/dashboard/RecentScreenings";
import { LoadingOverlay } from "@/components/screening/LoadingOverlay";
import type { DashboardStats } from "@/types/screening";
import { ScanSearch, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <LoadingOverlay message="Loading compliance dashboard…" />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-8 backdrop-blur-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-sm text-cyan-500">
            <Sparkles className="h-4 w-4" />
            Compliance Intelligence
          </div>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            PEP & Adverse Media Name Screening
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Screen individuals against politically exposed persons databases and adverse media sources.
            Multi-parameter identity matching reduces false positives and increases analyst confidence.
          </p>
          <Link href="/screening/new" className="mt-6 inline-block">
            <Button variant="gradient" size="lg">
              <ScanSearch />
              Start new screening
            </Button>
          </Link>
        </div>
      </section>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RiskDistributionChart distribution={stats.riskDistribution} />
        <RecentScreenings screenings={stats.recentScreenings} />
      </div>
    </div>
  );
}
