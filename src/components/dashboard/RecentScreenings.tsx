"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/types/screening";
import { formatDate, riskBg, riskColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface RecentScreeningsProps {
  screenings: DashboardStats["recentScreenings"];
}

export function RecentScreenings({ screenings }: RecentScreeningsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent screenings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {screenings.map((s) => (
          <Link
            key={s.id}
            href={`/screening/${s.id}/results`}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 p-4 transition-colors hover:bg-muted/30"
          >
            <div>
              <p className="font-medium">{s.fullName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(s.screenedAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("border", riskBg(s.riskCategory), riskColor(s.riskCategory))}>
                {s.riskCategory}
              </Badge>
              <span className="text-sm tabular-nums text-muted-foreground">{s.confidenceScore}%</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
