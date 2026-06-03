"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/screening";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS: Record<string, string> = {
  Low: "#34d399",
  Medium: "#fbbf24",
  High: "#fb923c",
  Critical: "#f43f5e",
};

interface RiskDistributionChartProps {
  distribution: DashboardStats["riskDistribution"];
}

export function RiskDistributionChart({ distribution }: RiskDistributionChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Risk distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {distribution.map((entry) => (
                  <Cell key={entry.category} fill={COLORS[entry.category] ?? "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
