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

const buildServiceFallback = () => `I'm sorry, I couldn't find the exact answer for that. 😊

For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;

const buildQuotaFallback = () => `The Lak Isuru Tea assistant is temporarily unavailable because the Gemini API quota has been reached. Please try again in a few minutes.`;

export const askGemini = async (prompt) => {
  try {
    const geminiClient = await getGeminiClient();

    if (!geminiClient) {
      return `I'm sorry, the AI assistant is not configured right now. 😊

For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;
    }

    const extractResponseText = (result) => {
      if (!result) return null;
      if (typeof result.text === "string" && result.text.trim()) return result.text.trim();
      if (typeof result.outputText === "string" && result.outputText.trim()) return result.outputText.trim();
      if (result.candidates?.[0]?.content?.parts) {
        const text = result.candidates[0].content.parts.map((p) => p.text || p.data || "").join(" ").trim();
        if (text) return text;
      }
      return null;
    };

    const handleError = (err) => {
      const code = err?.error?.code || err?.status || err?.code;
      if (code === 429 || code === "RESOURCE_EXHAUSTED" || code === "too_many_requests") {
        return { quota: true, message: buildQuotaFallback() };
      }
      return { quota: false, message: null };
    };

    // Try models.generateContent first (stable API).
    try {
      const result = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { maxOutputTokens: 512, candidateCount: 1 },
      });

      const text = extractResponseText(result);
      if (text) {
        return text;
      }
    } catch (err) {
      const errorInfo = handleError(err);
      console.warn("models.generateContent failed", err?.message || err);
      if (errorInfo.quota) {
        return errorInfo.message;
      }
    }

    // If interactions API is available, try it as a fallback (experimental but sometimes returns richer output)
    try {
      if (typeof geminiClient.interactions?.create === "function") {
        const interactionResp = await geminiClient.interactions.create({
          model: "gemini-2.5-flash",
          input: { text: prompt, type: "text" },
        });

        if (typeof interactionResp.outputText === "string" && interactionResp.outputText.trim()) {
          return interactionResp.outputText.trim();
        }

        const parts = [];
        for (const out of [].concat(interactionResp.output || [])) {
          if (out?.content) {
            for (const c of out.content) {
              if (typeof c?.text === "string") parts.push(c.text);
              else if (c?.type === "message" && c?.data) parts.push(String(c.data));
            }
          }
        }
        if (parts.length) return parts.join(" ").trim();
      }
    } catch (err) {
      const errorInfo = handleError(err);
      console.warn("interactions.create failed", err?.message || err);
      if (errorInfo.quota) {
        return errorInfo.message;
      }
    }

    return buildServiceFallback();
  } catch (error) {
    console.error("Gemini API error:", error?.message || error);

    return `I'm sorry, I couldn't answer that right now. 😊

For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;
  }
};