
import { GoogleGenAI } from "@google/genai";

/**
 * Lazy-initialized AI client to ensure stability in environments 
 * without a configured API key.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Nuvabase: Gemini API Key is missing. AI requests will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "dummy-key" });
};

const geminiService = {
  /**
   * Generates SQL based on natural language and schema context.
   */
  async generateSql(prompt: string, schemaContext: string): Promise<string> {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are a PostgreSQL expert for Nuvabase (a Supabase-like platform). 
          Generate a valid, efficient SQL query based on the user's request.
          Use the following schema context: ${schemaContext}.
          Return ONLY the raw SQL code. Do not include markdown formatting or explanations.
          CRITICAL: Only generate SELECT statements. Do not suggest mutations (INSERT, UPDATE, DELETE).`,
          temperature: 0.1,
        },
      });
      return response.text || '';
    } catch (error) {
      console.error("Gemini SQL Error:", error);
      throw error;
    }
  },

  /**
   * Debugs an erroneous SQL query.
   */
  async debugSql(query: string, error: string, schemaContext: string): Promise<string> {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Query: ${query}\nError: ${error}`,
        config: {
          systemInstruction: `You are a PostgreSQL Debugger for Nuvabase. 
          Analyze the query and error provided. 
          Provide a concise explanation of what is wrong and then provide the corrected SQL query.
          Schema context: ${schemaContext}.
          Focus on syntax errors, incorrect column names, or security violations.
          Format your response as: [EXPLANATION]... [FIX]...`,
          temperature: 0.2,
        },
      });
      return response.text || '';
    } catch (error) {
      console.error("Gemini Debug Error:", error);
      throw error;
    }
  },

  /**
   * Provides architectural or optimization advice.
   */
  async getInsights(prompt: string): Promise<string> {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are Nuvabase AI, an expert backend engineer and SRE. Provide concise, actionable advice on database design, RLS security, and infrastructure scaling.",
        },
      });
      return response.text || '';
    } catch (error) {
      console.error("Gemini Insights Error:", error);
      throw error;
    }
  }
};

export default geminiService;
