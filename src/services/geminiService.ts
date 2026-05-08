import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Model fallback chain - will try these in order
const MODELS = [
  "gemini-2.5-flash-lite", // fastest + high limits
  "gemini-2.5-flash",      // best quality/free balance
  "gemini-3-flash",      // stable fallback
  "gemini-2.0-flash-lite",      // lightweight fallback
  "gemini-2.0-flash",   // cheap/simple fallback
  "gemini-2.5-pro"         // strongest fallback (if available)
];

export async function analyzeLocation(location: string): Promise<AnalysisResponse> {
  const prompt = `
    You are a top-tier business consultant and market researcher for "ProblemFinder AI".
    Your goal is to discover REAL, HIGH-PAIN, and NECESSARY problems in the following location: "${location}".
    
    Focus ONLY on problems where people/businesses/governments are ALREADY losing money, time, efficiency, or productivity.
    Avoid "nice to have" ideas.

    IMPORTANT:
    - Problems must be highly practical and operationally specific.
    - Avoid generic problems like "traffic", "healthcare issues", "education problems", etc.
    - The problem should be specific enough that it can realistically be solved using:
      - SaaS software
      - mobile apps
      - websites
      - AI tools
      - automation systems
      - digital workflow tools
      - business management platforms
    - Focus on repetitive workflow inefficiencies, manual operations, coordination problems, inventory issues, scheduling gaps, payment tracking issues, communication inefficiencies, local business operational gaps, logistics inefficiencies, and outdated processes.

    IMPORTANT FOR REVENUE ESTIMATES:
    - Revenue projections MUST be realistic and conservative.
    - Do NOT generate fantasy revenue numbers or billion-dollar assumptions.
    - Base earning potential on realistic local adoption, affordability, and actual market conditions in the location.
    - Prefer believable small-to-medium business opportunities over unrealistic unicorn-style projections.
    
    For the location "${location}", return exactly 5 problems in a valid JSON format.
    Each problem must include:
    {
      "title": string,
      "severity": number (1-10),
      "urgency": string ("Low" | "Medium" | "High" | "Critical"),
      "whoFaces": string,
      "existingSolutions": string,
      "whySolutionsFail": string,
      "frequency": string,
      "marketSize": string,
      "potentialUsers": string,
      "willPay": boolean,
      "type": string ("Software" | "Hardware" | "Service" | "Hybrid"),
      "difficulty": string ("Easy" | "Medium" | "Hard"),
      "competition": string ("Low" | "Medium" | "High"),
      "startupScore": number (1-100),
      "revenuePotential": string,
      "estMonthlyRev": string,
      "estAnnualRev": string,
      "profitabilityVerdict": string ("HIGHLY PROFITABLE" | "MODERATELY PROFITABLE" | "LOW PROFIT POTENTIAL" | "NOT WORTH BUILDING"),
      "risk": string ("Low" | "Medium" | "High"),
      "scalability": string ("Local" | "National" | "Global"),
      "timeToProfit": string,
      "mvpFeatures": string[],
      "techStack": string[],
      "monetization": string,
      "roi": string,
      "cac": string,
      "pricingModel": string,
      "breakEven": string,
      "growthPotential": string,
      "problemPoints": string[],
      "solutionOverview": string,
      "implementationStrategy": string
    }

    Also, include a global 'marketSummary' object for the location with:
    {
      "summary": string,
      "economicVibe": string,
      "topSectors": string[],
      "heatmapRegions": { "region": string, "score": number }[]
    }
    
    Return ONLY valid JSON with structure: { "problems": [...], "marketSummary": {...} }
  `;

  let lastError: Error | null = null;

  // Try each model in sequence
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    
    try {
      console.log(`Attempting with model: ${model} (${i + 1}/${MODELS.length})`);
      
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (!text) {
        throw new Error("No response from AI");
      }
      
      const parsed = JSON.parse(text);
      console.log(`✓ Success with model: ${model}`);
      return parsed;
      
    } catch (error: any) {
      lastError = error;
      console.error(`✗ Model ${model} failed:`, error.message);
      
      // Check if it's a rate limit error
      const isRateLimit = 
        error.message?.includes('429') ||
        error.message?.includes('rate limit') ||
        error.message?.includes('quota') ||
        error.status === 429;
      
      // If rate limit and not the last model, continue to next
      if (isRateLimit && i < MODELS.length - 1) {
        console.log(`Rate limit hit. Trying next model...`);
        continue;
      }
      
      // If it's not a rate limit error, or it's the last model, throw
      if (i === MODELS.length - 1) {
        throw new Error(`All models failed. Last error: ${error.message}`);
      }
    }
  }
  
  throw lastError || new Error("Analysis failed");
}
