import type { ScreeningResult } from "@/types/screening";

const DARK_NAVY = [18, 24, 40] as const;
const RED_ACCENT = [220, 53, 69] as const;
const LIGHT_BLUE_BG = [240, 248, 255] as const;
const BORDER_GRAY = [220, 220, 225] as const;
const TEXT_DARK = [30, 30, 30] as const;
const TEXT_MID = [80, 80, 90] as const;
const WHITE = [255, 255, 255] as const;

export async function exportCaseReportPdf(result: ScreeningResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 16;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  // ── helpers ──────────────────────────────────────────────────────────────

  function checkPage(needed = 12) {
    if (y + needed > PAGE_H - 16) {
      doc.addPage();
      y = 16;
    }
  }

  function setColor(rgb: readonly [number, number, number], fill = true) {
    if (fill) doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    else doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  function text(
    content: string,
    x: number,
    yPos: number,
    opts?: { size?: number; bold?: boolean; color?: readonly [number, number, number]; maxWidth?: number }
  ) {
    doc.setFontSize(opts?.size ?? 10);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    const rgb = opts?.color ?? TEXT_DARK;
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    if (opts?.maxWidth) {
      const lines = doc.splitTextToSize(content, opts.maxWidth);
      doc.text(lines, x, yPos);
      return lines.length;
    }
    doc.text(content, x, yPos);
    return 1;
  }

  function wrappedText(
    content: string,
    x: number,
    maxWidth: number,
    opts?: { size?: number; bold?: boolean; color?: readonly [number, number, number]; lineHeight?: number }
  ): number {
    doc.setFontSize(opts?.size ?? 10);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    const rgb = opts?.color ?? TEXT_DARK;
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    const lines = doc.splitTextToSize(content, maxWidth);
    const lh = opts?.lineHeight ?? ((opts?.size ?? 10) * 0.45 + 2);
    doc.text(lines, x, y);
    y += lines.length * lh;
    return lines.length;
  }

  function hRule(yPos: number, color: readonly [number, number, number] = BORDER_GRAY) {
    setColor(color, false);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos);
  }

  // ── HEADER BANNER ────────────────────────────────────────────────────────
  setColor(DARK_NAVY);
  doc.rect(0, 0, PAGE_W, 34, "F");

  text("AML / CFT COMPLIANCE REPORT", PAGE_W / 2, 14, {
    size: 16,
    bold: true,
    color: WHITE,
  });
  // centre-align manually
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleW = doc.getTextWidth("AML / CFT COMPLIANCE REPORT");
  doc.text("AML / CFT COMPLIANCE REPORT", (PAGE_W - titleW) / 2, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  const subTitle = "CONFIDENTIAL BACKGROUND SCREENING";
  const subW = doc.getTextWidth(subTitle);
  doc.text(subTitle, (PAGE_W - subW) / 2, 23);

  y = 44;

  // ── SUBJECT ENTITY DETAILS ───────────────────────────────────────────────
  checkPage(70);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);
  doc.text("Subject Entity Details", MARGIN, y);
  y += 5;
  hRule(y);
  y += 4;

  const si = result.screenedInput;
  const inp = result.input;

  const rows: [string, string][] = [
    ["Primary Name", si?.name ?? inp.fullName],
    ["Known Aliases", si?.aliases?.join(", ") || "Not Available"],
    ["Father Name", si?.fathersName ?? inp.fathersName ?? "Not Available"],
    ["Country of Residence / Domicile", si?.countryOfResidence ?? inp.address ?? "Not Available"],
    ["Nationality", si?.nationality ?? "Not Available"],
    ["Date of Birth", si?.dateOfBirth ?? inp.dateOfBirth ?? "Not Available"],
    ["RCA Relationship with PEP", result.rcaAnalysis?.isRCA ? `${result.rcaAnalysis.relationshipType} of ${result.rcaAnalysis.relatedPEPName}` : "Not Available (Primary PEP)"],
  ];

  for (let i = 0; i < rows.length; i++) {
    checkPage(10);
    const rowY = y;
    const rowH = 9;
    // alternating row background
    if (i % 2 === 0) {
      setColor([248, 249, 251]);
      doc.rect(MARGIN, rowY - 4, CONTENT_W, rowH, "F");
    }
    hRule(rowY - 4, [235, 235, 240]);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
    doc.text(rows[i][0], MARGIN + 3, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    const valLines = doc.splitTextToSize(rows[i][1], CONTENT_W * 0.55);
    doc.text(valLines, MARGIN + CONTENT_W * 0.42, y);
    y += Math.max(rowH, valLines.length * 4.5);
  }
  hRule(y, [235, 235, 240]);
  y += 8;

  // ── COMPLIANCE ANALYST ASSESSMENT ────────────────────────────────────────
  checkPage(20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);
  doc.text("Compliance Analyst Assessment", MARGIN, y);
  y += 5;
  hRule(y);
  y += 5;

  // Overall summary paragraph
  const summaryText = result.complianceAnalystReasoning?.summary || result.agentReasoning?.summary || "No summary available.";
  checkPage(16);
  wrappedText(summaryText, MARGIN, CONTENT_W, { size: 9, color: TEXT_MID, lineHeight: 4.5 });
  y += 5;

  // ── PEP MATCHES ──────────────────────────────────────────────────────────
  if (result.pepMatches.length > 0) {
    for (const match of result.pepMatches) {
      checkPage(36);
      const blockStartY = y;

      // Red left border accent
      setColor(RED_ACCENT);
      doc.rect(MARGIN, blockStartY - 1, 3, 0, "F"); // placeholder — drawn after we know height

      // Header line
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(RED_ACCENT[0], RED_ACCENT[1], RED_ACCENT[2]);
      const matchHeader = `Risk Match: ${(match as { pepType?: string }).pepType ?? "PEP Match"} — ${match.name}`;
      const headerLines = doc.splitTextToSize(matchHeader, CONTENT_W - 8);
      doc.text(headerLines, MARGIN + 6, y);
      y += headerLines.length * 5 + 2;

      // Explanation body
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
      const explanationText = match.complianceAnalystReasoning || match.explanation || "";
      const expLines = doc.splitTextToSize(explanationText, CONTENT_W - 8);
      doc.text(expLines, MARGIN + 6, y);
      y += expLines.length * 4.2 + 2;

      // Risk level badge
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(RED_ACCENT[0], RED_ACCENT[1], RED_ACCENT[2]);
      doc.text(`Risk Level: ${match.riskLevel}  |  Confidence: ${match.confidenceScore}%  |  Match: ${match.matchType}`, MARGIN + 6, y);
      y += 3;

      const blockEndY = y;
      // Draw red left border now that we know full height
      setColor(RED_ACCENT);
      doc.rect(MARGIN, blockStartY - 1, 3, blockEndY - blockStartY + 2, "F");

      // Light outer border
      setColor([250, 235, 235], false);
      doc.setDrawColor(230, 210, 210);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, blockStartY - 2, CONTENT_W, blockEndY - blockStartY + 4, 2, 2, "S");

      y += 4;
    }
  }

  // ── ADVERSE MEDIA MATCHES ─────────────────────────────────────────────────
  if (result.adverseMediaMatches.length > 0) {
    for (const match of result.adverseMediaMatches) {
      checkPage(36);
      const blockStartY = y;

      setColor(RED_ACCENT);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(RED_ACCENT[0], RED_ACCENT[1], RED_ACCENT[2]);
      const matchHeader = `Risk Match: Adverse Media — ${match.name}`;
      const headerLines = doc.splitTextToSize(matchHeader, CONTENT_W - 8);
      doc.text(headerLines, MARGIN + 6, y);
      y += headerLines.length * 5 + 2;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
      const explanationText = match.complianceAnalystReasoning || match.explanation || "";
      const expLines = doc.splitTextToSize(explanationText, CONTENT_W - 8);
      doc.text(expLines, MARGIN + 6, y);
      y += expLines.length * 4.2 + 2;

      if (match.sourceType) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(RED_ACCENT[0], RED_ACCENT[1], RED_ACCENT[2]);
        doc.text(`Source: ${match.sourceType}  |  Risk: ${match.riskLevel}  |  Confidence: ${match.confidenceScore}%`, MARGIN + 6, y);
        y += 4;
      }

      if (match.publishedDate) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
        doc.text(`Published: ${match.publishedDate}`, MARGIN + 6, y);
        y += 3;
      }

      const blockEndY = y;
      setColor(RED_ACCENT);
      doc.rect(MARGIN, blockStartY - 1, 3, blockEndY - blockStartY + 2, "F");

      doc.setDrawColor(230, 210, 210);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, blockStartY - 2, CONTENT_W, blockEndY - blockStartY + 4, 2, 2, "S");

      y += 4;
    }
  }

  // ── ACTION REQUIRED ───────────────────────────────────────────────────────
  if (result.analystDecision || result.overallRiskScore >= 61) {
    checkPage(24);

    setColor(LIGHT_BLUE_BG);
    doc.rect(MARGIN, y - 3, CONTENT_W, 0, "F"); // placeholder

    const actionStartY = y;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);

    const actionTitle = result.analystDecision
      ? `Action Required: ${result.analystDecision.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
      : "Action Required: Enhanced Due Diligence";
    doc.text(actionTitle, MARGIN + 4, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);

    const actionText = result.analystNotes
      || (result.overallRiskScore >= 81
        ? "Due to the Critical risk rating, any financial relationship with this individual demands strict Enhanced Due Diligence (EDD) and senior management approval before onboarding or continued service."
        : "Due to the High risk rating and identified PEP/Adverse Media matches, Enhanced Due Diligence (EDD) is required. Senior management sign-off is recommended before proceeding.");

    const actionLines = doc.splitTextToSize(actionText, CONTENT_W - 8);
    doc.text(actionLines, MARGIN + 4, y);
    y += actionLines.length * 4.5 + 4;

    const actionEndY = y;
    setColor(LIGHT_BLUE_BG);
    doc.rect(MARGIN, actionStartY - 4, CONTENT_W, actionEndY - actionStartY + 6, "F");

    // Re-draw text over background
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);
    doc.text(actionTitle, MARGIN + 4, actionStartY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
    doc.text(actionLines, MARGIN + 4, actionStartY + 6);

    setColor([180, 210, 240], false);
    doc.setDrawColor(180, 210, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, actionStartY - 4, CONTENT_W, actionEndY - actionStartY + 6, 2, 2, "S");

    y += 8;
  }

  // ── REFERENCES & SOURCES ─────────────────────────────────────────────────
  const allRefs: string[] = [];
  for (const m of [...result.pepMatches, ...result.adverseMediaMatches]) {
    if (m.sourceUrl) allRefs.push(m.sourceUrl);
    if (m.references) allRefs.push(...m.references.filter((r) => !allRefs.includes(r)));
  }

  checkPage(20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK_NAVY[0], DARK_NAVY[1], DARK_NAVY[2]);
  doc.text("References & Sources", MARGIN, y);
  y += 4;
  hRule(y);
  y += 5;

  if (allRefs.length > 0) {
    for (const ref of allRefs) {
      checkPage(8);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
      const refLines = doc.splitTextToSize(`• ${ref}`, CONTENT_W - 4);
      doc.text(refLines, MARGIN + 3, y);
      y += refLines.length * 4 + 2;
    }
  } else {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_MID[0], TEXT_MID[1], TEXT_MID[2]);
    if (result.pepMatches.length > 0) {
      doc.text(`• Official Announcements: PEP match sourced from government/parliament records.`, MARGIN + 3, y);
      y += 5;
    }
    if (result.adverseMediaMatches.length > 0) {
      doc.text(`• National Media / Legal Databases: Adverse media findings from open-source intelligence.`, MARGIN + 3, y);
      y += 5;
    }
  }

  y += 4;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 170);
    const footerText = `Screening ID: ${result.id}  |  Generated: ${new Date().toLocaleString("en-GB")}  |  Page ${pg} of ${totalPages}`;
    const footerW = doc.getTextWidth(footerText);
    doc.text(footerText, (PAGE_W - footerW) / 2, PAGE_H - 8);
    hRule(PAGE_H - 11, [220, 220, 225]);
  }

  doc.save(`AML-CFT-Report-${result.id}.pdf`);
}
