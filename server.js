// server.js
// A tiny backend that calls the Claude API to generate a personalized
// learning roadmap for any field. Keeps the API key safe on the server
// side (never expose it in frontend code).

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

if (!GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not set. Add it to a .env file before calling /api/roadmap."
  );
}

// Builds the prompt sent to Claude. Forces JSON-only output so the
// frontend can parse it directly into the roadmap UI.
function buildPrompt({ fieldName, level, hours }) {
  return `You are a career roadmap planning assistant.

Generate a personalized, realistic learning roadmap for someone who wants to become a "${fieldName}".

Their current level: ${level}
Their available time: ${hours}

Return ONLY valid JSON (no markdown fences, no commentary, no preamble) matching exactly this shape:

{
  "phases": [
    {
      "title": "string - phase name",
      "weeks": number,
      "skills": ["3-4 specific skills to learn in this phase"],
      "books": ["2 real, specific, well-known book titles with authors relevant to this phase"],
      "playlists": ["2 real, specific YouTube channels or course names relevant to this phase"],
      "interview": ["2 realistic interview or assessment questions relevant to this phase"]
    }
  ]
}

Requirements:
- Produce exactly 5 phases, ordered from foundational to advanced, ending with an interview/assessment prep phase.
- Adjust the "weeks" values to reflect the person's stated level and available time (less time/lower level = more weeks; more time/higher level = fewer weeks).
- Use REAL, specific, well-known resources (actual book titles and authors, actual YouTube channels/course platforms) appropriate for "${fieldName}" — do not use placeholder text.
- Keep each skill/resource concise (under 12 words).
- Output must be valid JSON only.`;
}

// Shared helper to call the Anthropic API and return cleaned text.
async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.replace(/^```json\s*|```$/g, "").trim();
}

app.post("/api/roadmap", async (req, res) => {
  try {
    const { fieldName, level, hours } = req.body;

    if (!fieldName || !level || !hours) {
      return res.status(400).json({ error: "fieldName, level, and hours are required." });
    }

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
    }

    const prompt = buildPrompt({ fieldName, level, hours });
    const cleaned = await callClaude(prompt, 2200);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", cleaned);
      return res.status(502).json({ error: "AI returned malformed data. Try again." });
    }

    if (!parsed.phases || !Array.isArray(parsed.phases)) {
      return res.status(502).json({ error: "AI response missing 'phases' array." });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Generates a fresh, different batch of interview questions on demand —
// used by the "New questions" button so users get variety instead of
// seeing the same fixed list every time.
app.post("/api/questions", async (req, res) => {
  try {
    const { fieldName, phaseTitle } = req.body;

    if (!fieldName || !phaseTitle) {
      return res.status(400).json({ error: "fieldName and phaseTitle are required." });
    }
    if (!GEMINI_API_KEY) {
  return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
    }

    const prompt = `Generate 3 fresh, realistic interview or assessment questions for the
"${phaseTitle}" stage of becoming a "${fieldName}".

Make them different in wording and angle from typical generic questions — vary difficulty
and style (some conceptual, some scenario-based).

Return ONLY valid JSON, no markdown fences, no commentary, matching exactly:
{ "questions": ["question 1", "question 2", "question 3"] }`;

    const cleaned = await callGemini(prompt);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse questions JSON:", cleaned);
      return res.status(502).json({ error: "AI returned malformed data. Try again." });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return res.status(502).json({ error: "AI response missing 'questions' array." });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send("Navexora AI roadmap backend is running.");
});

app.listen(PORT, () => {
  console.log(`Navexora backend listening on http://localhost:${PORT}`);
});
