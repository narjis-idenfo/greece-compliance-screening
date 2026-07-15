export type RiskCategory = "Low" | "Medium" | "High" | "Critical";

export type MatchType = "exact" | "possible" | "false_positive_likely";

export type AnalystDecision = "true_match" | "false_positive" | "needs_review" | null;

export type ScreeningMode = "form" | "image_only";

/** Vision-led guess from photo-only screening */
export interface VisionIdentification {
  estimatedFullName: string | null;
  possibleAliases: string[];
  apparentAgeRange: string | null;
  regionGuess: string | null;
  distinguishingFeatures: string;
  searchQueries: string[];
  identificationConfidence: number;
  analystSummary: string;
}

export interface ScreeningInput {
  screeningMode?: ScreeningMode;
  fullName: string;
  fathersName?: string;
  dateOfBirth?: string;
  address?: string;
  faceImageBase64?: string;
}

export interface ProfileCompleteness {
  score: number;
  filledFields: string[];
  missingFields: string[];
}

/** Image from a PEP registry, news article, or other screening source */
export interface MatchSearchImage {
  url: string;
  caption?: string;
  sourceName?: string;
  sourcePageUrl?: string;
  /** Per-image facial similarity vs uploaded subject (0-100); null if N/A */
  facialMatchScore?: number | null;
}

export interface MatchResult {
  id: string;
  name: string;
  matchedAttributes: string[];
  sourceType: string;
  riskLevel: RiskCategory;
  confidenceScore: number;
  matchType: MatchType;
  explanation: string;
  complianceAnalystReasoning?: string;
  recommendedAction: string;
  sourceUrl?: string;
  references?: string[];
  publishedDate?: string;
  /** Primary subject or article thumbnail (direct https URL) */
  imageUrl?: string;
  /** Additional images from search / source pages (official photos, article images) */
  searchImages?: MatchSearchImage[];
  /** Similarity vs uploaded subject photo (0-100); null if no subject photo or N/A */
  facialMatchScore?: number | null;
}

export interface AgentReasoning {
  summary: string;
  steps: { title: string; detail: string }[];
  dataPointsUsed: string[];
  confidenceFactors: { factor: string; impact: "positive" | "negative" | "neutral"; weight: number }[];
}

export interface IdentityAnalysis {
  nameSimilarity: number;
  dobMatch: boolean | null;
  addressMatch: boolean | null;
  fathersNameMatch: boolean | null;
  nationalityMatch?: boolean | null;
  faceMatchScore: number | null;
  overallIdentityConfidence: number;
  falsePositiveIndicators: string[];
  strengtheningFactors: string[];
}

export interface ScreenedInput {
  name: string;
  aliases: string[];
  fathersName: string;
  nationality: string;
  countryOfResidence: string;
  dateOfBirth: string;
  idNumber: string;
}

export interface RCAAnalysis {
  isRCA: boolean;
  relationshipType: string;
  relatedPEPName: string;
  relatedPEPLevel: string;
  explanation: string;
}

export interface ComplianceAnalystReasoning {
  summary: string;
  detailedAnalysis: string;
  pepStatus: "Primary PEP" | "Secondary PEP" | "RCA" | "Adverse Media Only" | "Clean" | "Not Available";
  keyFindings: string[];
  dataPointsUsed: string[];
  confidenceFactors: { factor: string; impact: "positive" | "negative" | "neutral"; weight: number }[];
}

export interface RiskScoreBreakdownEntry {
  score: number;
  rationale: string;
}

export interface RiskScoreBreakdown {
  sanctions: RiskScoreBreakdownEntry;
  pep: RiskScoreBreakdownEntry;
  adverseMedia: RiskScoreBreakdownEntry;
  identityVerification: RiskScoreBreakdownEntry;
}

export interface ScreeningResult {
  id: string;
  screenedAt: string;
  screeningMode?: ScreeningMode;
  visionIdentification?: VisionIdentification;
  input: ScreeningInput;
  screenedInput?: ScreenedInput;
  profileCompleteness: ProfileCompleteness;
  overallRiskScore: number;
  riskScoreBreakdown: RiskScoreBreakdown;
  riskCategory: RiskCategory;
  confidenceScore: number;
  matchType: MatchType;
  pepMatchCount: number;
  adverseMediaMatchCount: number;
  pepMatches: MatchResult[];
  adverseMediaMatches: MatchResult[];
  rcaAnalysis?: RCAAnalysis;
  complianceAnalystReasoning?: ComplianceAnalystReasoning;
  identityAnalysis: IdentityAnalysis;
  agentReasoning: AgentReasoning;
  analystDecision: AnalystDecision;
  analystNotes: string;
}

export interface DashboardStats {
  totalScreenings: number;
  pendingReview: number;
  highRiskAlerts: number;
  clearedToday: number;
  riskDistribution: { category: RiskCategory; count: number }[];
  recentScreenings: {
    id: string;
    fullName: string;
    riskCategory: RiskCategory;
    confidenceScore: number;
    screenedAt: string;
    status: "completed" | "pending_review";
  }[];
}

export interface AnalystDecisionInput {
  screeningId: string;
  decision: AnalystDecision;
  notes: string;
}
