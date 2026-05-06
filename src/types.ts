
export interface Problem {
  title: string;
  severity: number;
  urgency: "Low" | "Medium" | "High" | "Critical";
  whoFaces: string;
  existingSolutions: string;
  whySolutionsFail: string;
  frequency: string;
  marketSize: string;
  potentialUsers: string;
  willPay: boolean;
  type: "Software" | "Hardware" | "Service" | "Hybrid";
  difficulty: "Easy" | "Medium" | "Hard";
  competition: "Low" | "Medium" | "High";
  startupScore: number;
  revenuePotential: string;
  estMonthlyRev: string;
  estAnnualRev: string;
  profitabilityVerdict: "HIGHLY PROFITABLE" | "MODERATELY PROFITABLE" | "LOW PROFIT POTENTIAL" | "NOT WORTH BUILDING";
  risk: "Low" | "Medium" | "High";
  scalability: "Local" | "National" | "Global";
  timeToProfit: string;
  mvpFeatures: string[];
  techStack: string[];
  monetization: string;
  roi: string;
  cac: string;
  pricingModel: string;
  breakEven: string;
  growthPotential: string;
  problemPoints: string[];
  solutionOverview: string;
  implementationStrategy: string;
}

export interface MarketSummary {
  summary: string;
  economicVibe: string;
  topSectors: string[];
  heatmapRegions: { region: string; score: number }[];
}

export interface AnalysisResponse {
  problems: Problem[];
  marketSummary: MarketSummary;
}
