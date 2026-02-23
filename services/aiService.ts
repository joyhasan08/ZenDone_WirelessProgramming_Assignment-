
import { GoogleGenAI } from "@google/genai";
import { Todo, Category, Priority } from "../types";

const getApiKey = (): string | undefined => {
  return (window as any).ENV?.API_KEY || localStorage.getItem('zen_ai_api_key') || undefined;
};

export const getTaskMotivation = async (taskCount: number, completedCount: number): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Stay focused and keep crushing your goals!";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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

export const getSmartSuggestions = async (existingTasks: Todo[]): Promise<string[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const taskTitles = existingTasks.map(t => t.title).join(', ');
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Based on these existing tasks: ${taskTitles || 'none'}, suggest 3 new task ideas that would help the user be more productive. Return only the task titles, one per line, no numbering.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    return response.text?.trim().split('\n').filter(t => t.trim()) || [];
  } catch (error) {
    console.error("AI Suggestions error:", error);
    return [];
  }
};

export const autoCategorize = async (taskTitle: string): Promise<Category> => {
  const apiKey = getApiKey();
  if (!apiKey) return 'other';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Categorize this task into one of these categories: work, personal, shopping, health, learning, other. Just return the category name, nothing else. Task: "${taskTitle}"`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 20,
      }
    });

    const category = response.text?.trim().toLowerCase();
    const validCategories: Category[] = ['work', 'personal', 'shopping', 'health', 'learning', 'other'];
    return validCategories.includes(category as Category) ? category as Category : 'other';
  } catch (error) {
    console.error("AI Categorize error:", error);
    return 'other';
  }
};

export const getPriorityFromAI = async (taskTitle: string): Promise<Priority> => {
  const apiKey = getApiKey();
  if (!apiKey) return 'medium';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Rate the priority of this task as low, medium, or high. Consider urgency and importance. Just return one word: low, medium, or high. Task: "${taskTitle}"`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 10,
      }
    });

    const priority = response.text?.trim().toLowerCase();
    const validPriorities: Priority[] = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as Priority) ? priority as Priority : 'medium';
  } catch (error) {
    console.error("AI Priority error:", error);
    return 'medium';
  }
};

export const getProductivityInsights = async (todos: Todo[], completedCount: number): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Track your tasks to see insights!";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const pendingTasks = todos.filter(t => t.status === 'pending');
    const highPriority = pendingTasks.filter(t => t.priority === 'high').length;
    const overdue = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give a brief productivity insight based on this data: ${completedCount} tasks completed today, ${pendingTasks.length} pending, ${highPriority} high priority, ${overdue} overdue. Keep it under 2 sentences.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 80,
      }
    });

    return response.text?.trim() || "Great progress today!";
  } catch (error) {
    console.error("AI Insights error:", error);
    return "Keep tracking your progress!";
  }
};
