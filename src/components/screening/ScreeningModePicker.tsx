"use client";

import { cn } from "@/lib/utils";
import { ClipboardList, ScanFace } from "lucide-react";
import type { ScreeningMode } from "@/types/screening";

interface ScreeningModePickerProps {
  mode: ScreeningMode;
  onChange: (mode: ScreeningMode) => void;
  disabled?: boolean;
}

const options: {
  id: ScreeningMode;
  title: string;
  description: string;
  icon: typeof ClipboardList;
}[] = [
  {
    id: "form",
    title: "Identity form",
    description: "Screen by name with optional DOB, address, and photo.",
    icon: ClipboardList,
  },
  {
    id: "image_only",
    title: "Photo only",
    description: "Vision-led search — upload a face photo; AI estimates identity and searches PEP/media.",
    icon: ScanFace,
  },
];

export function ScreeningModePicker({ mode, onChange, disabled }: ScreeningModePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map(({ id, title, description, icon: Icon }) => {
        const selected = mode === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all",
              selected
                ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                : "border-border/60 bg-card/50 hover:border-border hover:bg-muted/20",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                selected ? "bg-cyan-500/20 text-cyan-400" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
