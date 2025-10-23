import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || "placeholder-key";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0.7 },
});

class AIService {
  static async processTranscript(transcript, companyName, attendees, date) {
    const prompt = `
      You are a business coach analyzing meeting transcripts to provide actionable insights.
      
      Review this transcript and share what I did well and why, what I could do even better and recommendations of things I can test differently next time.
      
      Company: ${companyName}
      Attendees: ${attendees.join(", ")}
      Date: ${date}
      
      Transcript:
      ${transcript}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  static async processLinkedIn(linkedinBio, pitchDeck, companyName, role) {
    const prompt = `
      You are a sales strategist creating personalized outreach strategies.
      
      Based on this LinkedIn bio and pitch deck, generate a cold outreach icebreaker for this person.
      
      LinkedIn Bio:
      ${linkedinBio}
      
      Pitch Deck:
      ${pitchDeck}
      
      Company: ${companyName}
      Role: ${role}
      
      Please provide:
      1. Buying signals from the deck
      2. Why they matter and source of information
      3. Discovery triggers
      4. Smart questions to ask in the next call
      5. Preferred style of buying and how you inferred that
      6. Top 5 things they would like from our deck
      7. What parts may not be clear, relevant or valuable and why
      8. What to do instead
      9. Short summary and 3 reflection questions
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }
}

export default AIService;
