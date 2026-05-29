async function callClaude(messages, temperature = 0.7) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Claude API error");
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
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

    // ── PASS 1: Visual + Social Analysis ─────────────────────────────────────
    const pass1 = await callClaude([{
      role: "user",
      content: [
        ...imagePart,
        {
          type: "text",
          text: `You are a sharp social observer and body language expert.
Analyze this photo like a human who reads people instantly.

Return ONLY raw JSON — no markdown, no backticks:
{
  "expression": "exact description of facial expression",
  "bodyLanguage": "what their posture and body communicate",
  "perceivedStatus": "what most people assume about this person in 2 seconds",
  "hiddenEnergy": "what this person might actually be thinking that contradicts how they look",
  "environment": "exactly where are they, what is around them",
  "viewerAssumption": "the single strongest assumption a viewer makes in first 2 seconds",
  "comedicTension": "sharpest contrast between appearance and reality for this specific person",
  "tensionType": "one of: looks_intimidating_actually_warm | looks_serious_actually_funny | looks_confident_actually_relatable | looks_focused_actually_distracted | stereotype_flip"
}`
        }
      ]
    }], 0.4);

    const analysis = JSON.parse(pass1.replace(/```json|```/g, "").trim());

    // ── PASS 2: Joke Mechanisms ───────────────────────────────────────────────
    const pass2 = await callClaude([{
      role: "user",
      content: `You are a comedy writer who specializes in viral TikTok humor.

Photo analysis:
${JSON.stringify(analysis, null, 2)}

Context: ${situation || "everyday moment"}
Vibe: ${vibe || "stereotype-flip"}

Generate 3 DIFFERENT joke mechanisms. Each uses a different tension type:
- SOCIAL DOMINANCE FLIP: looks powerful → reveals something unexpectedly humble or relatable
- SILENT INTELLIGENCE: looks quiet → reveals sharp observation nobody else noticed
- STEREOTYPE INVERSION: viewer makes assumption → completely subverted with warmth and wit
- EMOTIONAL CONTRAST: serious exterior → surprisingly funny or vulnerable interior
- STATUS MISMATCH: looks one level → actually at a completely different level
- COMMENT MAGNET: says something so true people MUST comment

Return ONLY raw JSON array of 3 objects. No markdown:
- tensionType: which type
- setup: the assumption viewer makes (1 sentence)
- flip: the reality (1 sentence, specific NOT generic)
- whySharp: why this works for THIS person's specific look`
    }], 1.1);

    const mechanisms = JSON.parse(pass2.replace(/```json|```/g, "").trim());

    // ── PASS 3: Write The Overlays ────────────────────────────────────────────
    const pass3 = await callClaude([{
      role: "user",
      content: `You are writing TikTok text overlays for a specific creator.

CREATOR IDENTITY:
- Black man, fun, confident, naturally funny, never arrogant or mean
- Humor style: light, warm, makes people smile and feel included
- The guy who says one thing and the room laughs because it's just TRUE and real
- NOT trying to be deep or philosophical — just genuinely funny and himself

Photo analysis:
${JSON.stringify(analysis, null, 2)}

Joke mechanisms:
${JSON.stringify(mechanisms, null, 2)}

WRITING RULES:
1. Top text = max 10 words. Sounds like a real person typed it
2. Middle text = max 8 words. Punchy bold energy
3. Bottom text = max 10 words. THE PUNCHLINE — specific, earned, makes them replay it
4. Must sound like a real person posted this, NOT an AI
5. Light and fun — not deep, not philosophical, not trying too hard

BANNED:
- food, snacks, cake, cooking
- gym jokes about sets/reps
- forgetting things at home
- AirPods, chargers, phones
- being tired or sleepy
- motivational language
- fake deep quotes

HARDNESS CHECK before keeping each punchline:
✓ Would someone screenshot this?
✓ Would they send it to a friend?
✓ Does it feel like only THIS person could post it?

Return ONLY raw JSON array of exactly 3 objects. No markdown, no backticks:
- title: concept name max 6 words
- whatISee: this person's energy in one sentence
- tensionType: tension type used
- textTop: top overlay
- textPOV: center bold overlay
- textBottom: the punchline
- addPeople: specific people to add for extra comedy. Empty array if not needed.
- addProps: props or changes to add. null if not needed.
- captionA: caption with hashtags under 100 chars
- captionB: second caption under 100 chars
- whyItWorks: why this punchline works for THIS person (2 sentences)
- viralScore: 1-10`
    }], 1.1);

    const concepts = JSON.parse(pass3.replace(/```json|```/g, "").trim());

    return Response.json({ success: true, concepts });
  } catch (err) {
    console.error("Concept generation error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
