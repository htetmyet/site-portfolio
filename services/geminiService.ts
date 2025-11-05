
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedIdea } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;

export const generateAIdea = async (industry: string): Promise<GeneratedIdea[]> => {
  if (!apiKey) {
    throw new Error("GEMINI API key not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `As an expert AI solutions consultant, generate 3 innovative AI-powered ideas for the ${industry} industry. For each idea, provide a catchy name, a one-sentence summary, and the key AI technology used (e.g., NLP, Computer Vision, Predictive Analytics).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "A catchy, marketable name for the AI solution.",
              },
              summary: {
                type: Type.STRING,
                description: "A concise one-sentence summary of what the solution does.",
              },
              technology: {
                type: Type.STRING,
                description: "The core AI technology powering the solution (e.g., NLP, Computer Vision, Predictive Analytics)."
              }
            },
            required: ["name", "summary", "technology"]
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const ideas: GeneratedIdea[] = JSON.parse(jsonString);
    return ideas;

  } catch (error) {
    console.error("Error generating AI ideas:", error);
    throw new Error("Failed to generate ideas from AI. Please try again.");
  }
};
