"use client";

import { MatchResultCard } from "@/components/screening/MatchResultCard";
import type { MatchResult } from "@/types/screening";
import { Newspaper } from "lucide-react";

interface AdverseMediaCardProps {
  match: MatchResult;
}

export function AdverseMediaCard({ match }: AdverseMediaCardProps) {
  return (
    <MatchResultCard match={match}>
      <div className="flex items-center gap-2 border-t border-border/50 pt-3 text-xs text-rose-400">
        <Newspaper className="h-4 w-4" />
        Adverse media hit — verify materiality and recency
      </div>
    </MatchResultCard>
  );
}
