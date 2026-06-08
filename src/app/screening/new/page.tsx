"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreeningForm } from "@/components/screening/ScreeningForm";
import { ImageOnlyScreeningForm } from "@/components/screening/ImageOnlyScreeningForm";
import { ScreeningModePicker } from "@/components/screening/ScreeningModePicker";
import { cacheScreeningResult } from "@/lib/screening-session";
import type { ScreeningInput, ScreeningMode, ScreeningResult } from "@/types/screening";

export default function NewScreeningPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ScreeningMode>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingHint =
    mode === "image_only"
      ? "Identifying subject from photo, searching PEP/adverse media, and comparing faces — may take 2–4 minutes."
      : "Running screening, fetching images from sources, and comparing faces — this may take 1–3 minutes.";

  const handleSubmit = async (input: ScreeningInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          res.status === 504 || res.status === 502
            ? "Screening timed out — please try again."
            : `Server error (${res.status}): ${text.slice(0, 120)}`
        );
      }
      if (!res.ok) throw new Error((data.error as string) ?? "Screening failed");

      const screeningId = data.screeningId as string;
      const result = data.result as ScreeningResult | undefined;
      if (result) {
        cacheScreeningResult(result);
      }

      router.push(`/screening/${screeningId}/results`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Screening failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New screening</h1>
        <p className="mt-1 text-muted-foreground">
          Choose how to identify the subject, then run PEP and adverse media analysis.
        </p>
      </div>

      <ScreeningModePicker mode={mode} onChange={setMode} disabled={isLoading} />

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {mode === "form" ? (
        <ScreeningForm onSubmit={handleSubmit} isLoading={isLoading} loadingHint={loadingHint} />
      ) : (
        <ImageOnlyScreeningForm onSubmit={handleSubmit} isLoading={isLoading} loadingHint={loadingHint} />
      )}
    </div>
  );
}
