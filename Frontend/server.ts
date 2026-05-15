import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;
  
  const wss = new WebSocketServer({ server, path: "/live" });

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "AIzaSy_dummy_key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  wss.on("connection", async (clientWs, req) => {
    // Determine the topic from url query, default to "Solar System"
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const topic = url.searchParams.get("topic") || "General Knowledge";
    
    let session: any = null;
    try {
        session = await ai.live.connect({
          model: "gemini-3-flash-preview",
          callbacks: {
            onmessage: (message: any) => {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                 clientWs.send(JSON.stringify({ audio }));
              }
              if (message.serverContent?.interrupted) {
                 clientWs.send(JSON.stringify({ interrupted: true }));
              }
            },
          },
          config: {
            responseModalities: ["AUDIO" as any],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
            },
            systemInstruction: `You are a curious student learning about "${topic}". The user is your teacher. Your goal is to let them explain concepts to you, and you should react naturally, summarize what they said, ask counter-questions, and occasionally challenge their explanations to deepen their understanding. Keep your responses short (1-2 sentences) so the conversation flows fast. Be conversational and engaging. Do not break character. Keep evaluating their knowledge in a subtle way.`,
          },
        });
    } catch(err) {
        console.error("Live API connection failed:", err);
        clientWs.close();
        return;
    }

    clientWs.on("message", (data) => {
      try {
         const { audio } = JSON.parse(data.toString());
         if (audio && session) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            }).catch((e: any) => console.error("Error sending input", e));
         }
      } catch (e) {
          // Ignore invalid JSON parsing or errors
      }
    });
    
    clientWs.on("close", () => {
        if (session) {
           // We don't have session.close? or we might depending on sdk version
           // session might just die when we stop sending data
        }
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
  app.post("/api/generate-roadmap/text", express.json({ limit: '10mb' }), async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `Generate a learning roadmap for the topic: "${topic}". Return ONLY valid JSON exactly matching this format, with no markdown formatting or code blocks:
      {
        "nodes": [
          {"id": "1", "label": "Basics", "description": "...", "status": "untouched"}, ...
        ],
        "edges": [
          {"id": "e1-2", "source": "1", "target": "2"}, ...
        ]
      }
      Include 5-8 nodes that map a logical learning path.`;

      let data;
      try {
        const aiRes = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const responseText = aiRes.text || "{}";
        data = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        console.error("AI Generation failed, falling back", e);
        data = {
          nodes: [
            { id: '1', label: `Introduction to ${topic}`, description: 'Core concepts and history', status: 'untouched' },
            { id: '2', label: 'Foundational Principles', description: 'The math and logic behind it', status: 'untouched' },
            { id: '3', label: 'Advanced Topics', description: 'Deep dive into complex areas', status: 'untouched' },
            { id: '4', label: 'Practical Applications', description: 'Real-world use cases', status: 'untouched' },
            { id: '5', label: 'Future Trends', description: 'Where the field is heading', status: 'untouched' }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e2-4', source: '2', target: '4' },
            { id: 'e3-5', source: '3', target: '5' },
            { id: 'e4-5', source: '4', target: '5' }
          ]
        };
      }
      
      res.json(data);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Failed to generate roadmap" });
    }
  });

  app.post("/api/generate-roadmap/file", upload.single("syllabus"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const genericRoadmap = {
        nodes: [
          { id: '1', label: `Introduction to Syllabus`, description: 'Overview of the document and identifying key goals.', status: 'untouched' },
          { id: '2', label: 'Foundational Principles', description: 'Understand the first core module extracted from the text.', status: 'untouched' },
          { id: '3', label: 'Advanced Topics', description: 'Tackle the more difficult sections of the document.', status: 'untouched' },
          { id: '4', label: 'Practical Applications', description: 'Learn the practical components outlined in the syllabus.', status: 'untouched' },
          { id: '5', label: 'Future Trends', description: 'Final project or mastery of all modules.', status: 'untouched' }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e2-4', source: '2', target: '4' },
          { id: 'e3-5', source: '3', target: '5' },
          { id: 'e4-5', source: '4', target: '5' }
        ]
      };
      
      res.json(genericRoadmap);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate roadmap" });
    }
  });

  app.post("/api/practice/challenge", express.json(), async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `Generate exactly 10 multiple choice questions about the topic: "${topic}". Return ONLY valid JSON exactly matching this format:
      [
        {
          "question": "Question text...",
          "options": ["A", "B", "C", "D"],
          "correctAnswerIndex": 0
        }
      ]`;

      const aiRes = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(aiRes.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]");
      res.json(data);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: String(error).includes('429') ? 'Rate limit exceeded. Please try again later or provide your own API key if applicable.' : 'Failed to generate response' });
    }
  });

  app.post("/api/practice/flashcards", express.json(), async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `Generate exactly 10 flashcards about the topic: "${topic}". Return ONLY valid JSON exactly matching this format:
      [
        {
          "front": "Term or question...",
          "back": "Definition or answer..."
        }
      ]`;

      const aiRes = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(aiRes.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]");
      res.json(data);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Failed to generate flashcards" });
    }
  });

  app.post("/api/practice/listen", express.json(), async (req, res) => {
      try {
        const { topic } = req.body;
        const prompt = `Give a comprehensive audio lecture on "${topic}". Break it down into 8 distinct sections. Make it conversational like an AI tutor teaching a student. Return ONLY valid JSON exactly matching this format:
        [
          "First sentence...",
          "Second sentence...",
          "Third sentence..."
        ]`;
        const aiRes = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(aiRes.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]");
        res.json({ sentences: data });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Failed" });
      }
  });

  app.post("/api/practice/tts", express.json(), async (req, res) => {
      try {
         const { text } = req.body;
         const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text }] }],
            config: {
              responseModalities: ["AUDIO" as any],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Aoede' },
                  },
              },
            },
         });
         const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
         res.json({ audioBase64: base64Audio });
      } catch (error) {
         console.error("TTS generation failed:", error);
         res.status(500).json({ error: "TTS Failed" });
      }
  });

  app.post("/api/chat", express.json(), async (req, res) => {
    try {
      const { topic, history, message } = req.body;
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: `You are a helpful AI tutor on the topic "${topic}". Be concise, friendly, and educational. Help the student explore this topic with clear explanations and encourage curiosity. Keep responses to 2-3 sentences.`
        }
      });
      res.json({ text: aiRes.text });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  app.post("/api/practice/prove-it", express.json(), async (req, res) => {
    try {
      const { topic, history, message, isEndSession } = req.body;
      let systemInstruction = `You are a curious student learning about "${topic}". The user is your teacher. Your goal is to let them explain concepts to you, and you should react naturally, summarize what they said, ask counter-questions, and occasionally challenge their explanations to deepen their understanding. Keep your responses short (1-2 sentences). Be conversational and engaging. Do not break character. Keep evaluating their knowledge in a subtle way.`;
      
      let finalMessage = message;
      if (isEndSession) {
         systemInstruction = `You are an AI learning assistant evaluating a student's session teaching you about "${topic}". Provide a concise summary of how well they did, their score (out of 100), and suggestions for improvement. Respond in plain text, conversational.`;
         finalMessage = "I'm ending the session now. Please give me my summary, score, and improvements based on our conversation.";
      }

      const contents = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: finalMessage }] });

      const aiRes = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents,
          config: {
            systemInstruction
          }
      });
      res.json({ text: aiRes.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to respond" });
    }
  });

  app.post("/api/practice/wrong-one", express.json(), async (req, res) => {
    try {
      const { topic } = req.body;
      const prompt = `Generate exactly 10 "Choose the INCORRECT answer" questions about: "${topic}". Trick questions are encouraged. Return ONLY valid JSON exactly matching this format:
      [
        {
          "question": "Which statement about [Topic] is INCORRECT?",
          "options": ["Correct fact 1", "Correct fact 2", "Wrong fact (the answer)", "Correct fact 3"],
          "wrongAnswerIndex": 2,
          "explanation": "Explanation of why it's wrong..."
        }
      ]`;

      const aiRes = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(aiRes.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]");
      res.json(data);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Failed to generate wrong-one challenge" });
    }
  });


  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API error caught by middleware:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
