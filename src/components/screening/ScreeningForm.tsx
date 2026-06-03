"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletenessMeter } from "@/components/screening/ProfileCompletenessMeter";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import type { ScreeningInput } from "@/types/screening";
import { Upload, Loader2, ScanSearch } from "lucide-react";

interface ScreeningFormProps {
  onSubmit: (input: ScreeningInput) => Promise<void>;
  isLoading?: boolean;
  loadingHint?: string;
}

export function ScreeningForm({ onSubmit, isLoading, loadingHint }: ScreeningFormProps) {
  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | undefined>();

  const input: ScreeningInput = useMemo(
    () => ({
      fullName,
      fathersName: fathersName || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address || undefined,
      faceImageBase64: faceBase64,
    }),
    [fullName, fathersName, dateOfBirth, address, faceBase64]
  );

  const completeness = useMemo(() => calculateProfileCompleteness(input), [input]);

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
    if (!fullName.trim()) return;
    await onSubmit({ ...input, screeningMode: "form" });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-cyan-500" />
            Identity Parameters
          </CardTitle>
          <CardDescription>
            Full name is required. Add secondary parameters to increase match confidence and reduce false positives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Nikolaos Papadopoulos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fathersName">Father&apos;s Name</Label>
              <Input
                id="fathersName"
                placeholder="Optional"
                value={fathersName}
                onChange={(e) => setFathersName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="City, region, country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Face / Photo Upload</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 transition-colors hover:bg-muted/40">
              {facePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={facePreview} alt="Preview" className="mb-3 h-24 w-24 rounded-full object-cover ring-2 ring-cyan-500/50" />
              ) : (
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {facePreview ? "Click to replace photo" : "Upload optional facial reference"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading || !fullName.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Screening…
              </>
            ) : (
              "Run Screening"
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
