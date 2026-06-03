"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types/screening";
import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

const items = [
  { key: "totalScreenings" as const, label: "Total Screenings", icon: Activity, color: "text-cyan-400" },
  { key: "pendingReview" as const, label: "Pending Review", icon: Clock, color: "text-amber-400" },
  { key: "highRiskAlerts" as const, label: "High Risk Alerts", icon: AlertTriangle, color: "text-rose-400" },
  { key: "clearedToday" as const, label: "Cleared Today", icon: CheckCircle2, color: "text-emerald-400" },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="group border-border/50 transition-transform hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-muted/50 p-3 transition-colors group-hover:bg-muted">
              <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats[key].toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
