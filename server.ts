import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/gemini", async (req, res) => {
    try {
      if (!ai) {
         return res.status(500).json({ error: "GEMINI_API_KEY is missing. Configure it in Settings." });
      }
      const { messages, systemPrompt, model } = req.body;
      
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: Array.isArray(m.content)
          ? m.content.map((c: any) => {
              if (c.type === "text") return { text: c.text };
              if (c.type === "image_url" || c.type === "image") {
                const dataUrl = c.image_url?.url || c.source?.data;
                const base64Data = dataUrl.includes(',') ? dataUrl.split(",")[1] : dataUrl;
                const mimeType = dataUrl.includes(';') ? dataUrl.match(/data:(.*?);/)?.[1] : "image/jpeg";
                return { inlineData: { data: base64Data, mimeType: mimeType || "image/jpeg" } };
              }
              if (c.type === "document") {
                 const dataUrl = c.source?.data;
                 const base64Data = dataUrl?.includes(',') ? dataUrl.split(",")[1] : dataUrl;
                 return { inlineData: { data: base64Data, mimeType: c.source?.media_type || "application/pdf" } };
              }
              return { text: JSON.stringify(c) };
            })
          : [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ text: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate content" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
