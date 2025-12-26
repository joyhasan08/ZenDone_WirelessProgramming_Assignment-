
import { GoogleGenAI } from "@google/genai";

export const getTaskMotivation = async (taskCount: number, completedCount: number): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Stay focused and keep crushing your goals!";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a very short, one-sentence motivational tip for someone who has ${taskCount} total tasks and has finished ${completedCount} of them today. Make it snappy and encouraging.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "Every step forward is progress.";
  } catch (error) {
    console.error("AI Motivation error:", error);
    return "Keep up the great work!";
  }
};
