"use client";

import { Loader2, Shield } from "lucide-react";

export function LoadingOverlay({
  message = "Loading…",
  submessage,
}: {
  message?: string;
  submessage?: string;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <Shield className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {message}
        </div>
        {submessage && <p className="max-w-md text-center text-xs">{submessage}</p>}
      </div>
    </div>
  );
}
