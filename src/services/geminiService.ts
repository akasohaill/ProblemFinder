
import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeLocation(location: string): Promise<AnalysisResponse> {
  const prompt = `
    You are a top-tier business consultant and market researcher for "ProblemFinder AI".
    Your goal is to discover REAL, HIGH-PAIN, and NECESSARY problems in the following location: "${location}".
    
    Focus ONLY on problems where people/businesses/governments are ALREADY losing money, time, efficiency, or productivity.
    Avoid "nice to have" ideas.
    
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
      "problemPoints": string[], // 5 key points explaining WHY this is a major problem
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
    
    Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
