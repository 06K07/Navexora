// server.js
// A tiny backend that calls the Claude API to generate a personalized
// learning roadmap for any field. Keeps the API key safe on the server
// side (never expose it in frontend code).

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.warn(
    "WARNING: ANTHROPIC_API_KEY is not set. Add it to a .env file before calling /api/roadmap."
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Upstream AI request failed." });
    }

    const data = await response.json();
    const rawText = data.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    // Strip accidental markdown code fences just in case.
    const cleaned = rawText.replace(/^```json\s*|```$/g, "").trim();

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

app.get("/", (req, res) => {
  res.send("Navexora AI roadmap backend is running.");
});

app.listen(PORT, () => {
  console.log(`Navexora backend listening on http://localhost:${PORT}`);
});