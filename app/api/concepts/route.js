export async function POST(req) {
  try {
    const { photoBase64, photoMime, situation, vibe } = await req.json();

    const vibeDescriptions = {
      "smart-twist": "Looks simple on surface, reveals sharp intelligence or irony at the end",
      "stereotype-flip": "Set up a visual assumption the viewer makes, then the text completely flips it — done with warmth and wit, never mean",
      "confident-flex": "Subtle showing off done with class and self-awareness, never bragging",
      "deadpan": "Something absurd happening visually — creator looks completely unbothered",
      "self-aware": "Creator is in on the joke — makes fun of the situation with confidence",
    };

    const prompt = `You are a viral TikTok visual comedy director. Your job is to create concepts where the IMAGE + TEXT OVERLAYS tell the entire story together. They must match perfectly.

CREATOR IDENTITY: Black man, intelligent, funny, supremely confident, never mean. Sharp warm humor. The comedy comes from the GAP between what the viewer ASSUMES when they see the image and what the TEXT REVEALS.

CRITICAL RULE — READ THE IMAGE FIRST:
Before writing anything, carefully observe EVERYTHING in this specific photo:
- Exactly where is this person? What is the precise location/environment?
- What are they wearing? What does it say about them?
- What is their expression and body language?
- What objects, people, or details are visible in the background?
- What is the mood and lighting of the scene?

THEN build the concept around EXACTLY what you see.
- If they are on stairs → the concept uses the stairs
- If they are in a car → the concept uses the car
- If they are in a room → the concept uses that specific room
- NEVER invent a location or situation that is not visible in the image
- The text overlays must make sense WITH the specific image — not against it

THE FORMULA THAT WORKS:
Top text = what the viewer THINKS is happening (the assumption)
Middle text = POV that deepens the setup
Bottom text = the TWIST that flips everything and makes them laugh or say "damn"

PUNCHLINE RULES:
- The bottom text must be SURPRISING — not what anyone expects
- It must connect DIRECTLY to something visible in the image
- Short = harder hitting. Max 10 words. Less is more.

${situation ? `Extra context from creator: ${situation}` : ""}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

Generate 3 concepts. Each must use a DIFFERENT angle.

Return ONLY a raw JSON array of exactly 3 objects. No markdown, no backticks:

- title: concept name (max 6 words, punchy)
- whatISee: one sentence describing exactly what you see in this specific image
- textTop: TOP overlay — sets up the assumption (max 10 words)
- textPOV: CENTER bold text — the POV (max 8 words)
- textBottom: BOTTOM — the punchline (max 10 words)
- addPeople: array of specific people to add. Empty array if not needed.
- addProps: specific props to add. null if not needed.
- captionA: first caption with hashtags (under 100 chars)
- captionB: second caption (under 100 chars)
- whyItWorks: why this goes viral (2 sentences)
- viralScore: number 1-10`;

    const messageContent = photoBase64
      ? [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: photoMime || "image/jpeg",
              data: photoBase64,
            },
          },
          { type: "text", text: prompt },
        ]
      : [{ type: "text", text: prompt }];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

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
        messages: [{ role: "user", content: messageContent }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const raw = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = raw.replace(/```json|```/g, "").trim();
    const concepts = JSON.parse(clean);

    return Response.json({ success: true, concepts });
  } catch (err) {
    console.error("Concept generation error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
