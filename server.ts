import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim().length > 0) ? customApiKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Socratic Tutor Conversational API
app.post("/api/tutor/respond", async (req, res) => {
  try {
    const { problem, state, userMessage, history, topic, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      // Return a smart fallback response if GEMINI_API_KEY is not configured
      return res.json({
        replyText: `Let's work through this step together! Look closely at the visual interactive model for "${problem?.title || "this problem"}". What happens when you test your next move?`,
        hintType: "question",
        isCorrect: null,
        xpEarned: 10,
        audioSpeechText: "Let's work through this together! What happens when you test your next move?",
      });
    }

    const systemInstruction = `You are "Sora", the AI Math & Problem Solving Tutor from Synthesis Tutor.
Your goal is to foster deep mental models, visual intuition, and mathematical curiosity in kids/students aged 6-16.
Rule 1: Never directly blurt out the raw numerical answer if the user hasn't solved it yet. Use Socratic questioning.
Rule 2: Praise effort, strategy, and critical thinking ("I love how you tried to balance the left side first!").
Rule 3: Refer to the interactive visual manipulatives whenever relevant (e.g., "Look at the balance scale", "Notice the fraction slices", "Check the coordinate grid").
Rule 4: Keep explanations brief, punchy, engaging, and easy to read (1-3 short paragraphs max).
Rule 5: If the user solves it correctly, praise enthusiastically, explain *why* their solution works visually, and set isCorrect to true.

Current Topic: ${topic || "Math & Logic"}
Current Problem: ${JSON.stringify(problem || {})}
Current Visual Manipulative State: ${JSON.stringify(state || {})}
User History: ${JSON.stringify(history || [])}
`;

    const prompt = `User says or tried action: "${userMessage || "Can you give me a hint on this setup?"}"
Please respond as Sora the Synthesis AI Tutor in JSON format matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "Sora's friendly Socratic response to the student.",
            },
            hintType: {
              type: Type.STRING,
              description: "One of: 'question', 'visual_clue', 'encouragement', 'celebration', 'concept_check'",
            },
            suggestedManipulativeAction: {
              type: Type.STRING,
              description: "Optional suggestion for interactive manipulative highlight or reset.",
            },
            isCorrect: {
              type: Type.BOOLEAN,
              description: "True if user solved problem, false if attempt was incorrect, null if general message/question.",
            },
            xpEarned: {
              type: Type.INTEGER,
              description: "XP points to award if solved or made breakthrough (0 to 100).",
            },
            audioSpeechText: {
              type: Type.STRING,
              description: "Short spoken text formatted for Text-to-Speech (clear, cheerful voice line).",
            },
          },
          required: ["replyText", "hintType", "isCorrect", "xpEarned", "audioSpeechText"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/tutor/respond:", error);
    // Return friendly 200 payload with Socratic feedback so client never breaks
    res.json({
      replyText: "Let's take a look at this problem together! Try testing a change on the visual model or ask me another question.",
      hintType: "encouragement",
      isCorrect: null,
      xpEarned: 10,
      audioSpeechText: "Let's take a look at this together!",
    });
  }
});

// 2. Text-To-Speech API (Synthesis Voice)
app.post("/api/tutor/speech", async (req, res) => {
  try {
    const { text, voice = "Kore", customApiKey } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGeminiClient(customApiKey);
    if (!ai) {
      return res.json({ audio: null, fallback: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say warmly and clearly like a friendly math coach: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, mimeType: "audio/pcm;rate=24000" });
    } else {
      res.json({ audio: null, fallback: true });
    }
  } catch (error: any) {
    console.error("Error in /api/tutor/speech:", error);
    res.json({ audio: null, fallback: true });
  }
});

// 3. Dynamic Interactive Problem Generator API
app.post("/api/tutor/generate-problem", async (req, res) => {
  try {
    const { topic, difficulty = 1, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      return res.json({
        id: `gen_${Date.now()}`,
        topic: topic || "balance_equations",
        title: "Dynamic Exploration Challenge",
        story: "Welcome to the adaptive Synthesis sandbox. Explore and test your hypothesis with the interactive tools on screen!",
        instructions: "Interact with the visual elements to find the missing value.",
        socraticHints: [
          "Look at the balance between left and right.",
          "What happens if you isolate the unknown variable?",
        ],
        conceptExplanation: "Using visual models turns abstract algebraic thinking into physical intuition.",
      });
    }

    const systemInstruction = `You are an expert curriculum designer for Synthesis Tutor (Synthesis.com/tutor).
Create an engaging, visual, interactive math or logic problem for kids.
Topic categories:
- balance_equations (Algebraic balance scale with weights and mystery variables x)
- fraction_lab (Visual fraction pie/bar builder, combining or splitting parts)
- spatial_puzzles (Geometry, perimeter, area, rotation, tile packing)
- exponent_growth (Doubling, exponential decay, tree branching visualizers)
- coordinate_quest (Grid navigation, slope, secret treasure plotting)
- logic_matrix (Boolean logic, constraint solving, truth tables)

Make the storyline adventurous, creative, and memorable!`;

    const prompt = `Generate a level ${difficulty} interactive problem for topic: "${topic}".
Return JSON adhering strictly to schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            instructions: { type: Type.STRING },
            targetValue: { type: Type.STRING, description: "Expected numerical or algebraic solution representation" },
            initialManipulativeState: {
              type: Type.OBJECT,
              description: "JSON state for the visual interactive component",
              properties: {
                leftPan: { type: Type.ARRAY, items: { type: Type.STRING } },
                rightPan: { type: Type.ARRAY, items: { type: Type.STRING } },
                fractions: { type: Type.ARRAY, items: { type: Type.STRING } },
                targetFraction: { type: Type.STRING },
                gridWidth: { type: Type.INTEGER },
                gridHeight: { type: Type.INTEGER },
                shapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                targetArea: { type: Type.INTEGER },
                initialValue: { type: Type.INTEGER },
                growthRate: { type: Type.INTEGER },
                targetSteps: { type: Type.INTEGER },
                targetCoords: { type: Type.ARRAY, items: { type: Type.INTEGER } },
              },
            },
            socraticHints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            conceptExplanation: { type: Type.STRING },
          },
          required: ["id", "topic", "title", "story", "instructions", "socraticHints", "conceptExplanation"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/tutor/generate-problem:", error);
    res.json({
      id: `gen_${Date.now()}`,
      topic: "balance_equations",
      title: "Interactive Balance Challenge",
      story: "Test how balance scales work by adding and removing weights.",
      instructions: "Keep both pans balanced to solve for the missing weight.",
      socraticHints: ["What happens when you remove equal weights from both sides?"],
      conceptExplanation: "Equal operations on both sides maintain mathematical balance.",
    });
  }
});

// 4. Whiteboard / Scratchpad Drawing Analysis API
app.post("/api/tutor/analyze-drawing", async (req, res) => {
  try {
    const { imageBase64, currentProblem, customApiKey } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const ai = getGeminiClient(customApiKey);
    if (!ai) {
      return res.json({
        feedback: "I noticed your sketch on the whiteboard! Writing out your reasoning step-by-step is a great problem-solving strategy. Keep testing your numbers on the visual manipulative!",
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this student's math scratchpad/whiteboard work for the problem: "${JSON.stringify(currentProblem || {})}".
Read their handwritten numbers, drawings, equations, or scratch work.
1. Describe what they wrote/drew.
2. Identify if there's a math step or calculation in progress.
3. Offer a warm Socratic hint based on their handwritten work.`,
          },
        ],
      },
      config: {
        systemInstruction: "You are Sora, AI Math Tutor analyzing a student's digital whiteboard drawing.",
      },
    });

    res.json({ feedback: response.text || "Great scratchpad work! Keep going!" });
  } catch (error: any) {
    console.error("Error in /api/tutor/analyze-drawing:", error);
    res.json({
      feedback: "I see your scratchpad drawing! Working through steps visually is the best way to build mathematical intuition.",
    });
  }
});

// Vite middleware for development vs static production serving
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade for Real-time Voice endpoint
  server.on("upgrade", (request, socket, head) => {
    const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    if (urlObj.pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // Handle Gemini Live WebSocket session
  wss.on("connection", async (clientWs: WebSocket, req) => {
    console.log("Client connected to /api/live WebSocket");
    const urlObj = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const customApiKey = urlObj.searchParams.get("apiKey") || undefined;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: "GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.",
        })
      );
      clientWs.close();
      return;
    }

    let session: any = null;

    try {
      // Parse query params for topic/level/voice
      const urlObj = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const voiceName = urlObj.searchParams.get("voice") || "Aoede";
      const topic = urlObj.searchParams.get("topic") || "Counting and Mathematics";
      const level = urlObj.searchParams.get("level") || "1";
      const contextInfo = urlObj.searchParams.get("context") || "";

      const systemInstruction = `You are "Koda", the warm, enthusiastic AI Math Coach from Synthesis Tutor.
You are having a real-time spoken voice conversation with a student actively solving math questions.

CRITICAL INSTRUCTION FOR STUDENT ASSISTANCE:
1. The student opened Koda because they are struggling with the ACTIVE QUESTION on screen: "${contextInfo || topic}".
2. TARGET THE ACTIVE QUESTION IMMEDIATELY: As soon as the conversation starts or when asked, greet the student warmly and directly address the active question they are struggling with.
3. Ask a warm, gentle Socratic question or offer a helpful hint tailored specifically to this active question to help them discover the answer.

DYNAMIC QUESTION PROGRESSION RULE:
1. When the student answers correctly, solves the problem, or asks to move on, say: "Great job! Let's move to the next question!" or "Next question!".
2. ALWAYS explicitly include the phrase "next question" or "move to the next question" when it is time to move on, so the interactive app can automatically advance the screen!

PEDAGOGICAL & VOCAL RULES:
- Introduce yourself as Koda if asked. Speak warmly, clearly, and concisely in natural conversational sentences suitable for speech.
- Use Socratic coaching: guide the student to discover the answer using visual tools (ten-frames, 100-charts, counting on, pods of 10, balance scale, place value blocks).
- Keep responses brief (1-3 sentences per turn) so the student has plenty of time to respond verbally.
- Current Topic: ${topic}
- Current Level: Level ${level}
- Active Question Context: ${contextInfo || "Student is exploring number concepts and interactive math manipulatives."}
`;

      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName as any },
            },
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            // Check for audio chunk from model
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "audio",
                  audio: audioData,
                  mimeType: "audio/pcm;rate=24000",
                })
              );
            }

            // Check for model text transcription
            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              for (const part of modelParts) {
                if (part.text && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "modelText",
                      text: part.text,
                    })
                  );
                }
              }
            }

            // Check for user input transcription if available
            const inputParts = (message as any).clientContent?.turns?.[0]?.parts;
            if (inputParts) {
              for (const part of inputParts) {
                if (part.text && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "userText",
                      text: part.text,
                    })
                  );
                }
              }
            }

            // Interruption handling (student spoke over model)
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // Turn complete
            if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }
          },
          onerror: (err: any) => {
            console.error("Gemini Live Session Error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err?.message || "Live voice session encountered an issue.",
                })
              );
            }
          },
          onclose: () => {
            console.log("Gemini Live Session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "closed" }));
            }
          },
        },
      });

      // Send initial ready signal to client
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "ready", voice: voiceName }));
      }

      // Handle client audio / text messages
      clientWs.on("message", (raw) => {
        try {
          const parsed = JSON.parse(raw.toString());

          if (parsed.type === "audio" && parsed.audio) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (parsed.type === "text" && parsed.text) {
            session.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: parsed.text }],
                },
              ],
              turnComplete: true,
            });
          } else if (parsed.type === "updateContext" && parsed.context) {
            session.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: `[System Update: The student is now on this math question/screen: ${parsed.context}. Ask a warm, encouraging Socratic question to guide them!]` }],
                },
              ],
              turnComplete: true,
            });
          }
        } catch (e) {
          console.error("Error processing client live message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected from /api/live");
        if (session) {
          try {
            session.close();
          } catch (e) {
            // ignore close error
          }
        }
      });
    } catch (err: any) {
      console.error("Failed to establish Gemini Live connection:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            error: err?.message || "Failed to start Gemini Live voice session.",
          })
        );
        clientWs.close();
      }
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Synthesis Tutor Server with Gemini Live running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
