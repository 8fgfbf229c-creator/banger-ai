import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { photoBase64, photoMime, situation, vibe } = await req.json();

    const vibeDescriptions = {
      "smart-twist": "Looks simple on surface, reveals sharp intelligence or irony at the end",
      "stereotype-flip": "Set up a visual assumption the viewer makes, then the text or scene completely flips it — done with warmth and wit, never mean",
      "confident-flex": "Subtle showing off done with class and self-awareness, never bragging",
      "deadpan": "Something absurd happening visually — creator looks completely unbothered",
      "self-aware": "Creator is in on the joke — makes fun of the situation with confidence",
    };

    const systemPrompt = `You are a brilliant TikTok visual comedy director and content strategist.

Your specialty: creating concepts where the VISUAL SCENE + TEXT OVERLAYS tell the entire story. No talking. The image does all the work.

Creator identity: Black man, intelligent, funny, supremely confident, never mean or arrogant. His humor is sharp, warm, makes people think AND laugh. He punches up, never down.

Comedy styles you use:
- Visual irony: what you SEE sets up an expectation, the TEXT flips it
- Innocent misdirection: harmless assumptions get gently subverted (like: two white friends holding a Black baby — text says "me and my friends and their baby" — funny because of the unexpected visual)
- Confident understatement: something impressive treated like it's nothing
- Class contrast: being somewhere unexpected, owning it completely

When brainstorming scene additions, be SPECIFIC and CREATIVE. Think about exact people, their race, age, appearance, what they're doing, where they stand. Think about props, background details that add a second layer.

Text overlays must be SHORT and punchy — less words hit harder.

Respond ONLY with raw JSON. No markdown, no backticks, no explanation.`;

    const userPrompt = `${photoBase64 ? "Analyze this photo carefully — the person, environment, mood, background, lighting, what's present, what's missing." : "No photo provided — create a vivid scenario."}

Situation: ${situation || "confident Black man in an everyday situation"}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

Brainstorm 3 stunning, funny, shareable TikTok concepts. Return ONLY a raw JSON array of exactly 3 objects:

- title: concept name, punchy (max 8 words)
- textTop: TOP of screen — sets up the assumption (max 12 words, e.g. "Me and my friends and their baby 👀")
- textPOV: CENTER bold text — main POV or observation (max 10 words)
- textBottom: BOTTOM — the punchline that flips everything (max 12 words)
- addPeople: array of strings — specific people to add with full description (race, age, look, position, what they're doing). Empty array if none needed.
- addProps: string — specific props or environment changes. null if nothing needed.
- imagePrompt: a detailed prompt to send to an image generation AI to recreate this full scene (describe the main subject, added people, environment, lighting, mood — be very specific so the image generator gets it right)
- sceneLogic: one sentence why this scene composition creates the joke
- captionA: first caption with hashtags (under 100 chars)
- captionB: second caption different angle (under 100 chars)
- whyItWorks: why this image + text combo goes viral (2 sentences)
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
          { type: "text", text: userPrompt },
        ]
      : userPrompt;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: messageContent }],
    });

    const raw = response.content
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
