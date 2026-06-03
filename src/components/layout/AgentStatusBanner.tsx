"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, FlaskConical } from "lucide-react";

interface AgentStatus {
  mode: "live" | "mock";
  assistantConfigured: boolean;
  webSearchEnabled?: boolean;
  model: string;
  message: string;
}

export function AgentStatusBanner() {
  const [status, setStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    fetch("/api/agent/status")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  if (!status) return null;

  const isLive = status.mode === "live";

  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        isLive
          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
          : "border-amber-500/30 bg-amber-500/10 text-amber-100"
      )}
    >
      {isLive ? <Bot className="mt-0.5 h-4 w-4 shrink-0" /> : <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>
        <p className="font-medium">{isLive ? "Live agent connected" : "Mock mode"}</p>
        <p className="mt-0.5 opacity-90">{status.message}</p>
      </div>
    </div>
  );
}
