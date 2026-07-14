"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentReasoning } from "@/types/screening";
import { Brain, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentReasoningPanelProps {
  reasoning: AgentReasoning;
}

export function AgentReasoningPanel({ reasoning }: AgentReasoningPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-violet-400" />
            Compliance Intelligence — Agent Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">{reasoning.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reasoning steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reasoning.steps.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                {i + 1}
              </div>
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidence factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reasoning.confidenceFactors.map((f) => (
            <div key={f.factor} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                {f.factor}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs capitalize",
                    f.impact === "positive" && "text-emerald-500",
                    f.impact === "negative" && "text-rose-500",
                    f.impact === "neutral" && "text-muted-foreground"
                  )}
                >
                  {f.impact}
                </span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${f.weight}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data points used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {reasoning.dataPointsUsed.map((dp) => (
              <span key={dp} className="rounded-lg bg-muted/50 px-3 py-1 text-sm">
                {dp}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
