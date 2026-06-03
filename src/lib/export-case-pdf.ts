import type { ScreeningResult } from "@/types/screening";

export async function exportCaseReportPdf(result: ScreeningResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const line = (text: string, size = 10, bold = false) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.45) + 4;
  };

  line("GREECE COMPLIANCE — CASE SCREENING REPORT", 14, true);
  line(`Generated: ${new Date().toLocaleString("en-GB")}`);
  y += 4;
  line(`Screening ID: ${result.id}`, 10, true);
  line(`Subject: ${result.input.fullName}`);
  line(`Risk Category: ${result.riskCategory}`);
  line(`Overall Risk Score: ${result.overallRiskScore}/100`);
  line(`Confidence: ${result.confidenceScore}%`);
  line(`PEP Matches: ${result.pepMatchCount} | Adverse Media: ${result.adverseMediaMatchCount}`);
  y += 4;
  line("PEP MATCHES", 11, true);
  result.pepMatches.forEach((m) => {
    line(`• ${m.name} (${m.riskLevel}, ${m.confidenceScore}% confidence)`);
    line(`  ${m.explanation}`, 9);
  });
  y += 4;
  line("ADVERSE MEDIA", 11, true);
  result.adverseMediaMatches.forEach((m) => {
    line(`• ${m.name} (${m.riskLevel})`);
    line(`  ${m.explanation}`, 9);
  });
  y += 4;
  line("AGENT REASONING", 11, true);
  line(result.agentReasoning.summary, 9);
  if (result.analystDecision) {
    y += 4;
    line("ANALYST DECISION", 11, true);
    line(`Decision: ${result.analystDecision.replace(/_/g, " ")}`);
    if (result.analystNotes) line(`Notes: ${result.analystNotes}`, 9);
  }
  line("", 8);
  line("Powered by Greece Compliance Intelligence Agent (mock integration)", 8);

  doc.save(`screening-report-${result.id}.pdf`);
}
