import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function riskColor(category: string): string {
  switch (category) {
    case "Critical":
      return "text-rose-500";
    case "High":
      return "text-orange-500";
    case "Medium":
      return "text-amber-500";
    default:
      return "text-emerald-500";
  }
}

export function riskBg(category: string): string {
  switch (category) {
    case "Critical":
      return "bg-rose-500/15 border-rose-500/30";
    case "High":
      return "bg-orange-500/15 border-orange-500/30";
    case "Medium":
      return "bg-amber-500/15 border-amber-500/30";
    default:
      return "bg-emerald-500/15 border-emerald-500/30";
  }
}

export function matchTypeLabel(type: string): string {
  switch (type) {
    case "exact":
      return "Exact Match";
    case "possible":
      return "Possible Match";
    case "false_positive_likely":
      return "False Positive Likely";
    default:
      return type;
  }
}

export function matchTypeColor(type: string): string {
  switch (type) {
    case "exact":
      return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    case "possible":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "false_positive_likely":
      return "bg-sky-500/20 text-sky-400 border-sky-500/40";
    default:
      return "bg-muted text-muted-foreground";
  }
}
