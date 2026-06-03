"use client";

import { MatchResultCard } from "@/components/screening/MatchResultCard";
import type { MatchResult } from "@/types/screening";
import { Landmark } from "lucide-react";

interface PepMatchCardProps {
  match: MatchResult;
}

export function PepMatchCard({ match }: PepMatchCardProps) {
  return (
    <MatchResultCard match={match}>
      <div className="flex items-center gap-2 border-t border-border/50 pt-3 text-xs text-violet-400">
        <Landmark className="h-4 w-4" />
        Politically Exposed Person — enhanced due diligence may apply
      </div>
    </MatchResultCard>
  );
}
