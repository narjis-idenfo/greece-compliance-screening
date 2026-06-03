"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AnalystDecision, ScreeningResult } from "@/types/screening";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, HelpCircle, FileDown, Loader2 } from "lucide-react";
import { exportCaseReportPdf } from "@/lib/export-case-pdf";

interface CaseDecisionPanelProps {
  result: ScreeningResult;
  onSave: (decision: AnalystDecision, notes: string) => Promise<void>;
}

const decisions: { value: AnalystDecision; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: "true_match", label: "True Match", icon: CheckCircle, color: "border-rose-500/50 bg-rose-500/10 text-rose-400" },
  { value: "false_positive", label: "False Positive", icon: XCircle, color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" },
  { value: "needs_review", label: "Needs Review", icon: HelpCircle, color: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
];

export function CaseDecisionPanel({ result, onSave }: CaseDecisionPanelProps) {
  const [selected, setSelected] = useState<AnalystDecision>(result.analystDecision);
  const [notes, setNotes] = useState(result.analystNotes);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(selected, notes);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCaseReportPdf(result);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyst case decision</CardTitle>
        <CardDescription>Document your review outcome for audit trail and regulatory reporting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {decisions.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                selected === value ? color : "border-border/50 bg-muted/20 hover:bg-muted/40"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Analyst notes</label>
          <Textarea
            placeholder="Document rationale, additional checks performed, escalation details…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={!selected || saving} variant="gradient">
            {saving ? <Loader2 className="animate-spin" /> : null}
            Save decision
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
            Export case report (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
