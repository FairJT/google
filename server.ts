import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Helper for lazy loading GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Chat Endpoint with Aura AI
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages format" });
      return;
    }

    const ai = getGeminiClient();
    
    // Convert message history to string or use them to compile prompt
    const compiledHistory = messages.map((m: any) => {
      const roleName = m.role === "user" ? "کاربر (مشتری)" : "آورا (دستیار هوش مصنوعی)";
      return `${roleName}: ${m.content}`;
    }).join("\n");

    const prompt = `You are Aura (آورا), an elite AI Style Consultant and booking helper for Aura Salon, an AI-driven cloud beauty salon platform in Iran.
Your traits: professional, warm, styling-expert, extremely polite, helpful, and elegant.
Your language: STRICTLY Persian (Farsi) only. Always speak in a polite, respectful, and sophisticated tone suited for a high-end Persian beauty clinic/salon (احترام و صمیمیت فارسی).
Your tasks:
1. Provide personalized style recommendations (hair, makeup, nails, skin).
2. Suggest services (e.g., بالیاژ, کوپ ژورنالی, هیدروفیشیال, کاشت ناخن ژل‌ایکس) based on their vibe/needs.
3. Help them understand salon procedures or guide them on booking. Always discuss prices in "تومان" (Toman).
Keep answers elegantly concise, structured, and visually stunning (using clean Farsi Markdown with bolding or bullet points).

Here is the conversation history:
${compiledHistory}

Aura AI:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply = response.text || "من عذرخواهی می‌کنم، در حال حاضر در ارائه خدمات با مشکل مواجه شدم. چطور می‌توانم به شما کمک کنم؟";
    res.json({ content: reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 2. Semantic Search Endpoint
app.post("/api/semantic-search", async (req, res) => {
  try {
    const { query, salons, artists } = req.body;
    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are an AI-driven search matcher for a cloud beauty platform in Iran.
The user is looking for beauty services, aesthetics, or styles with this Persian query: "${query}"

Here is the list of available salons:
${JSON.stringify(salons, null, 2)}

Here is the list of available artists/specialists:
${JSON.stringify(artists, null, 2)}

Analyze this list and return a JSON array of the top matching entity keys (either salon keys or artist names) that best fit this query, along with a detailed 'matchReason' in Persian (Farsi, under 2 sentences) explaining why they are a great fit, and a 'matchScore' (0 to 100).
Respond with valid, parseable JSON conforming to this schema:
[
  {
    "type": "salon" | "artist",
    "name": "Name of Salon or Artist",
    "matchScore": number,
    "matchReason": "توضیح کوتاه و جذاب به زبان فارسی درباره علت انتخاب این گزینه"
  }
]
Do not wrap the JSON in Markdown codeblocks. Return ONLY raw valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const results = JSON.parse(response.text?.trim() || "[]");
    res.json({ results });
  } catch (error: any) {
    console.error("Error in /api/semantic-search:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 3. Dynamic Pricing & demand simulation endpoint
app.post("/api/dynamic-pricing", async (req, res) => {
  try {
    const { serviceName, basePrice, popularity, timeOfDay, dayOfWeek } = req.body;
    
    const ai = getGeminiClient();
    
    const prompt = `Analyze the optimal dynamic price offset for a premium Persian salon service under the following conditions:
Service: ${serviceName}
Base Price: ${basePrice} Toman (تومان)
Popularity (1-10): ${popularity}
Time of Day: ${timeOfDay} (e.g. Morning, Peak Afternoon, Evening)
Day of Week: ${dayOfWeek} (Note: In Iran, Thursday and Friday are the weekend/holiday, which represents the highest Peak demand)

Calculate an elegant dynamic multiplier (e.g. 0.95 for low demand morning hours, 1.25 for peak weekend hours) and write a 1-sentence justification in Persian (Farsi) explaining the rate change.
Respond with raw JSON only (no markdown block):
{
  "multiplier": number,
  "finalPrice": number,
  "demandLevel": "Low" | "Moderate" | "High" | "Surge",
  "reason": "توضیح کوتاه به زبان فارسی در مورد علت تغییر قیمت"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const pricing = JSON.parse(response.text?.trim() || "{}");
    res.json(pricing);
  } catch (error: any) {
    console.error("Error in /api/dynamic-pricing:", error);
    // Graceful fallback
    res.json({
      multiplier: 1.1,
      finalPrice: Math.round((req.body.basePrice || 500000) * 1.1),
      demandLevel: "Moderate",
      reason: "نرخ استاندارد با توجه به تقاضای متوسط اعمال شد."
    });
  }
});

// Integrate Vite Middleware or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
