"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletenessMeter } from "@/components/screening/ProfileCompletenessMeter";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import type { ScreeningInput } from "@/types/screening";
import { Upload, Loader2, ScanFace } from "lucide-react";

interface ImageOnlyScreeningFormProps {
  onSubmit: (input: ScreeningInput) => Promise<void>;
  isLoading?: boolean;
  loadingHint?: string;
}

export function ImageOnlyScreeningForm({ onSubmit, isLoading, loadingHint }: ImageOnlyScreeningFormProps) {
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | undefined>();

  const input: ScreeningInput = {
    screeningMode: "image_only",
    fullName: "",
    faceImageBase64: faceBase64,
  };

  const completeness = calculateProfileCompleteness(input);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFacePreview(result);
      setFaceBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceBase64) return;
    await onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3 border-violet-500/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-violet-400" />
            Photo-led screening
          </CardTitle>
          <CardDescription>
            No name required. Vision will estimate who this may be, then search PEP and adverse media on the web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-10 transition-colors hover:bg-violet-500/10">
            {facePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={facePreview}
                alt="Subject"
                className="mb-4 h-40 w-40 rounded-2xl object-cover ring-2 ring-violet-500/50"
              />
            ) : (
              <Upload className="mb-4 h-10 w-10 text-violet-400/70" />
            )}
            <span className="text-center text-sm font-medium">
              {facePreview ? "Tap to change photo" : "Upload face photo (required)"}
            </span>
            <span className="mt-1 text-center text-xs text-muted-foreground">
              Clear, front-facing photo works best
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} required />
          </label>
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isLoading || !faceBase64}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Identifying &amp; screening…
              </>
            ) : (
              "Run image-led screening"
            )}
          </Button>
          {isLoading && loadingHint && (
            <p className="text-center text-xs text-muted-foreground">{loadingHint}</p>
          )}
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <ProfileCompletenessMeter completeness={completeness} />
      </div>
    </form>
  );
}
