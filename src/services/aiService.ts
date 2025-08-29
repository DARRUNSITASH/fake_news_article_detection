import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Generative AI integration
class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeNews(content: string): Promise<{ prediction: 'REAL' | 'FAKE'; confidence: number }> {
    try {
      const prompt = `
You are an expert fake news detection system. Analyze the following news content and determine if it's REAL or FAKE news.

Consider these factors:
1. Factual accuracy and verifiability of claims
2. Source credibility indicators  
3. Emotional manipulation or sensational language
4. Logical consistency and coherence
5. Potential bias or agenda
6. Writing style and professionalism
7. Use of evidence and citations

News Content:
"${content}"

Respond with only a JSON object in this exact format:
{"prediction": "REAL" or "FAKE", "confidence": number between 0.70 and 1.00}

Be objective and precise in your assessment.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        prediction: parsed.prediction === 'FAKE' ? 'FAKE' : 'REAL',
        confidence: Math.min(Math.max(parsed.confidence || 0.8, 0.7), 1.0)
      };

    } catch (error) {
      console.error('Google AI analysis failed:', error);
      throw error;
    }
  }
}

// Initialize with the provided API key
export const googleAI = new GoogleAIService('AIzaSyAMmyPGhsi1EZO1od1BLn2NeivF_YFVdTU');