import type { MatchResult, ScreeningResult, DashboardStats } from "@/types/screening";

/** High-risk PEP match — exact name + DOB alignment */
export const highRiskPepMatch: MatchResult = {
  id: "pep-001",
  name: "Nikolaos Papadopoulos",
  matchedAttributes: ["Full Name", "Date of Birth", "Nationality"],
  sourceType: "EU PEP Registry — Greece",
  riskLevel: "Critical",
  confidenceScore: 94,
  matchType: "exact",
  explanation:
    "Subject matches a sitting Member of the Hellenic Parliament (2021–present). Name transliteration and DOB align with official parliamentary records.",
  recommendedAction:
    "Escalate to MLRO immediately. Obtain enhanced due diligence documentation and verify political exposure role before onboarding.",
  sourceUrl: "https://www.hellenicparliament.gr/en/mps",
  publishedDate: "2024-01-15",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Parliament_of_Greece.jpg/640px-Parliament_of_Greece.jpg",
  searchImages: [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Parliament_of_Greece.jpg/640px-Parliament_of_Greece.jpg",
      caption: "Hellenic Parliament — official institution reference",
      sourceName: "Wikimedia Commons",
      sourcePageUrl: "https://www.hellenicparliament.gr/en/mps",
    },
  ],
  facialMatchScore: 91,
};

/** Medium-risk adverse media match */
export const mediumRiskAdverseMediaMatch: MatchResult = {
  id: "am-001",
  name: "N. Papadopoulos",
  matchedAttributes: ["Partial Name", "Geographic Region"],
  sourceType: "Global Adverse Media — Reuters",
  riskLevel: "Medium",
  confidenceScore: 62,
  matchType: "possible",
  explanation:
    "Article references investigation into municipal contract irregularities in Attica region. Name is abbreviated; no DOB in source.",
  recommendedAction:
    "Request additional identity attributes. Cross-reference with corporate registry filings before determining materiality.",
  sourceUrl: "https://www.reuters.com/example",
  publishedDate: "2023-09-22",
  searchImages: [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Reuters_Logo_2024.svg/320px-Reuters_Logo_2024.svg.png",
      caption: "Publication branding — illustrative; verify subject photo on article",
      sourceName: "Reuters",
      sourcePageUrl: "https://www.reuters.com/example",
    },
  ],
  facialMatchScore: 42,
};

/** Low-confidence possible match — likely false positive */
export const lowConfidencePossibleMatch: MatchResult = {
  id: "pep-002",
  name: "Nikos Papadopoulos",
  matchedAttributes: ["Phonetic Name Similarity"],
  sourceType: "World-Check PEP — Historical",
  riskLevel: "Low",
  confidenceScore: 28,
  matchType: "false_positive_likely",
  explanation:
    "Phonetic name match only. Listed PEP left office in 2012; no DOB or address corroboration. Common Greek surname increases collision probability.",
  recommendedAction:
    "Likely false positive. Document rationale if clearing. Re-screen if additional identifiers become available.",
  publishedDate: "2012-06-01",
  facialMatchScore: null,
};

export const mockDashboardStats: DashboardStats = {
  totalScreenings: 1247,
  pendingReview: 23,
  highRiskAlerts: 8,
  clearedToday: 41,
  riskDistribution: [
    { category: "Low", count: 892 },
    { category: "Medium", count: 241 },
    { category: "High", count: 87 },
    { category: "Critical", count: 27 },
  ],
  recentScreenings: [
    {
      id: "scr-demo-001",
      fullName: "Nikolaos Papadopoulos",
      riskCategory: "Critical",
      confidenceScore: 94,
      screenedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "pending_review",
    },
    {
      id: "scr-demo-002",
      fullName: "Maria Konstantinou",
      riskCategory: "Low",
      confidenceScore: 91,
      screenedAt: new Date(Date.now() - 7200000).toISOString(),
      status: "completed",
    },
    {
      id: "scr-demo-003",
      fullName: "Dimitris Alexiou",
      riskCategory: "Medium",
      confidenceScore: 67,
      screenedAt: new Date(Date.now() - 86400000).toISOString(),
      status: "pending_review",
    },
    {
      id: "scr-demo-004",
      fullName: "Elena Georgiou",
      riskCategory: "Low",
      confidenceScore: 88,
      screenedAt: new Date(Date.now() - 172800000).toISOString(),
      status: "completed",
    },
  ],
};

export function buildMockScreeningResult(
  id: string,
  input: {
    fullName: string;
    fathersName?: string;
    dateOfBirth?: string;
    address?: string;
    faceImageBase64?: string;
  },
  profileScore: number
): ScreeningResult {
  const hasRichProfile = profileScore >= 70;

  return {
    id,
    screenedAt: new Date().toISOString(),
    input,
    profileCompleteness: {
      score: profileScore,
      filledFields: [],
      missingFields: [],
    },
    overallRiskScore: hasRichProfile ? 78 : 52,
    riskScoreBreakdown: hasRichProfile
      ? {
          sanctions: { score: 20, rationale: "No sanctions list matches found." },
          pep: {
            score: 85,
            rationale: "Exact match against a Primary PEP registry entry with high confidence.",
          },
          adverseMedia: {
            score: 60,
            rationale: "One medium-risk adverse media finding linked to financial misconduct.",
          },
          identityVerification: {
            score: 91,
            rationale: "Strong corroboration across DOB, father's name, and address records.",
          },
        }
      : {
          sanctions: { score: 10, rationale: "No sanctions list matches found." },
          pep: {
            score: 55,
            rationale: "Possible match on a PEP list with low confirming detail.",
          },
          adverseMedia: {
            score: 45,
            rationale: "Low-confidence adverse media mention, not clearly corroborated.",
          },
          identityVerification: {
            score: 55,
            rationale: "Only primary name provided; limited corroborating identity data.",
          },
        },
    riskCategory: hasRichProfile ? "Critical" : "Medium",
    confidenceScore: hasRichProfile ? 89 : 58,
    matchType: hasRichProfile ? "exact" : "possible",
    pepMatchCount: 2,
    adverseMediaMatchCount: 1,
    pepMatches: [highRiskPepMatch, lowConfidencePossibleMatch],
    adverseMediaMatches: [mediumRiskAdverseMediaMatch],
    identityAnalysis: {
      nameSimilarity: hasRichProfile ? 96 : 72,
      dobMatch: input.dateOfBirth ? true : null,
      addressMatch: input.address ? true : null,
      fathersNameMatch: input.fathersName ? true : null,
      faceMatchScore: input.faceImageBase64 ? 84 : null, // null when no upload → shown as N/A in UI
      overallIdentityConfidence: hasRichProfile ? 91 : 55,
      falsePositiveIndicators: hasRichProfile
        ? []
        : [
            "Only primary name provided",
            "Common surname in target jurisdiction",
            "No DOB corroboration",
          ],
      strengtheningFactors: hasRichProfile
        ? [
            "DOB matches registry record",
            "Father's name aligns with civil records",
            "Address within known constituency",
          ]
        : ["Full name exact match on PEP list"],
    },
    agentReasoning: {
      summary:
        "Greece Compliance Intelligence agent screened subject against PEP databases and adverse media feeds. Multiple signals detected with varying confidence.",
      steps: [
        {
          title: "Identity normalization",
          detail: `Normalized "${input.fullName}" to Greek and Latin transliterations for fuzzy matching.`,
        },
        {
          title: "PEP registry scan",
          detail: "Queried EU PEP, national parliamentary, and World-Check historical lists.",
        },
        {
          title: "Adverse media sweep",
          detail: "Scanned 14 news aggregators and regulatory enforcement bulletins (24-month window).",
        },
        {
          title: "Confidence scoring",
          detail: `Applied ${profileScore}% profile completeness weighting to reduce false positive probability.`,
        },
      ],
      dataPointsUsed: [
        input.fullName,
        input.fathersName,
        input.dateOfBirth,
        input.address,
        input.faceImageBase64 ? "Facial biometrics" : undefined,
      ].filter(Boolean) as string[],
      confidenceFactors: [
        { factor: "Name exact match", impact: "positive", weight: 35 },
        { factor: "DOB provided", impact: input.dateOfBirth ? "positive" : "negative", weight: 25 },
        { factor: "Common surname", impact: "negative", weight: 15 },
        { factor: "PEP role recency", impact: "positive", weight: 20 },
      ],
    },
    analystDecision: null,
    analystNotes: "",
  };
}
