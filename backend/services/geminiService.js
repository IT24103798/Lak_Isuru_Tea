import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "..", ".env") });

let aiPromise;

const getGeminiClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (!aiPromise) {
    aiPromise = import("@google/genai").then(({ GoogleGenAI }) => {
      return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    });
  }

  return aiPromise;
};

export const askGemini = async (prompt) => {
  try {
    const geminiClient = await getGeminiClient();

    if (!geminiClient) {
      return "The AI assistant is not configured yet. Please try again later.";
    }

    const result = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return "Sorry, I cannot answer right now. Please try again later.";
  }
};