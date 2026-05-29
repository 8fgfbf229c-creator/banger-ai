async function callClaude(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `API error ${response.status}`);
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return text;
}

function cleanJSON(raw) {
  // Remove markdown code blocks if present
  let clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  // Find first [ or { and last ] or }
  const firstBracket = Math.min(
    clean.indexOf("[") === -1 ? Infinity : clean.indexOf("["),
    clean.indexOf("{") === -1 ? Infinity : clean.indexOf("{")
  );
  const lastBracket = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
  if (firstBracket !== Infinity && lastBracket !== -1) {
    clean = clean.slice(firstBracket, lastBracket + 1);
  }
  return clean;
}

export async function POST(req) {
  try {
    const { photoBase64, photoMime, situation, vibe } = await req.json();

    const imagePart = photoBase64
      ? [{
          type: "image",
          source: { type: "base64", media_type: photoMime || "image/jpeg", data: photoBase64 },
        }]
      : [];

    // ── PASS 1: Visual Analysis ───────────────────────────────────────────────
    const pass1Raw = await callClaude([{
      role: "user",
      content: [
        ...imagePart,
        {
          type: "text",
          text: `Analyze this photo like a sharp social observer who reads people instantly.

Return ONLY a raw JSON object. No markdown, no explanation, no backticks. Start with { and end with }

{
  "expression": "exact facial expression description",
  "bodyLanguage": "what posture communicates",
  "perceivedStatus": "what people assume about this person in 2 seconds",
  "hiddenEnergy": "what they might actually be thinking that contradicts their look",
  "environment": "where are they exactly, what surrounds them",
  "viewerAssumption": "the strongest assumption a viewer makes in first 2 seconds",
  "comedicTension": "the sharpest contrast between appearance and reality",
  "tensionType": "looks_intimidating_actually_warm OR looks_serious_actually_funny OR looks_confident_actually_relatable OR stereotype_flip"
}`
        }
      ]
    }]);

    let analysis;
    try {
      analysis = JSON.parse(cleanJSON(pass1Raw));
    } catch(e) {
      throw new Error("Pass 1 failed to parse: " + pass1Raw.slice(0, 200));
    }

    // ── PASS 2: Joke Mechanisms ───────────────────────────────────────────────
    const pass2Raw = await callClaude([{
      role: "user",
      content: `You are a comedy writer for viral TikTok content.

Person analysis: ${JSON.stringify(analysis)}
Context: ${situation || "everyday moment"}
Vibe: ${vibe || "stereotype-flip"}

Generate 3 different joke mechanisms. Each must use a different tension type from this list:
SOCIAL_DOMINANCE_FLIP, SILENT_INTELLIGENCE, STEREOTYPE_INVERSION, EMOTIONAL_CONTRAST, STATUS_MISMATCH, COMMENT_MAGNET

Return ONLY a raw JSON array. No markdown, no explanation. Start with [ and end with ]

[
  {
    "tensionType": "TENSION_TYPE_HERE",
    "setup": "the assumption viewer makes",
    "flip": "the specific unexpected reality",
    "whySharp": "why this works for this specific person"
  }
]`
    }]);

    let mechanisms;
    try {
      mechanisms = JSON.parse(cleanJSON(pass2Raw));
    } catch(e) {
      throw new Error("Pass 2 failed to parse: " + pass2Raw.slice(0, 200));
    }

    // ── PASS 3: Write Overlays ────────────────────────────────────────────────
    const pass3Raw = await callClaude([{
      role: "user",
      content: `Write TikTok text overlays for this creator.

CREATOR: Black man, fun, confident, naturally funny, never arrogant. Light warm humor. The guy who says one thing and everyone laughs because it is just real and true.

Analysis: ${JSON.stringify(analysis)}
Joke mechanisms: ${JSON.stringify(mechanisms)}

RULES:
- Top text: max 10 words, sounds like a real person typed it
- Middle text: max 8 words, punchy
- Bottom punchline: max 10 words, specific, makes them replay it
- Must feel like a real person posted this not an AI
- Fun and light — not deep or philosophical

BANNED: food, snacks, gym jokes, forgetting things, AirPods, being tired, motivational quotes

Return ONLY a raw JSON array of exactly 3 objects. No markdown. Start with [ and end with ]

[
  {
    "title": "concept name max 6 words",
    "whatISee": "person energy in one sentence",
    "tensionType": "tension type used",
    "textTop": "top overlay text",
    "textPOV": "center bold text",
    "textBottom": "the punchline",
    "addPeople": [],
    "addProps": null,
    "captionA": "caption with hashtags under 100 chars",
    "captionB": "second caption under 100 chars",
    "whyItWorks": "why this works for this person specifically",
    "viralScore": 8
  }
]`
    }]);

    let concepts;
    try {
      concepts = JSON.parse(cleanJSON(pass3Raw));
    } catch(e) {
      throw new Error("Pass 3 failed to parse: " + pass3Raw.slice(0, 200));
    }

    return Response.json({ success: true, concepts });

  } catch (err) {
    console.error("Generation error:", err.message);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
