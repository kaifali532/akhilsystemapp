import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

export const aiHelper = {
  async predictWaitTime(queueDetails: any[], doctorSpeed: number): Promise<string> {
    try {
      const prompt = `
        You are an AI Hospital Queue Optimizer for Akhil Systems Pvt Ltd.
        Given the following queue of patients waiting for a doctor (who takes on average ${doctorSpeed} minutes per patient),
        calculate the estimated wait time. Note that 'emergency' patients are prioritized.
        Queue Details: ${JSON.stringify(queueDetails)}
        
        Provide a concise HTML summary of the estimated wait times and suggest optimal queue re-ordering.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      return response.text || 'Unable to predict.';
    } catch (error) {
      console.error(error);
      return 'AI prediction failed. Ensure GEMINI_API_KEY is configured.';
    }
  },

  async summarizePatientHistory(notes: any[]): Promise<string> {
    try {
        if (!notes || notes.length === 0) return "No history available to summarize.";

        const prompt = `
          Summarize the following patient consultation notes. Extract key conditions, prescribed medications, and important follow-up actions.
          Notes: ${JSON.stringify(notes)}
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
        });
        return response.text || 'Unable to summarize.';
    } catch (e) {
        console.error(e);
        return 'Summarization failed.';
    }
  }
};
