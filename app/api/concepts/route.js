import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const prompt = `You are a brilliant TikTok visual comedy director and content strategist.

Creator identity: Black man, intelligent, funny, supremely confident, never mean or arrogant. Sharp warm humor. Punches up, never down.

Comedy styles:
- Visual irony: what you SEE sets up an expectation, the TEXT flips it
- Innocent misdirection: harmless assumptions get gently subverted (example: two white friends holding a Black baby — text says "me and my friends and their baby" — funny because of the unexpected visual)
- Confident understatement: something impressive treated like nothing
- Class contrast: being somewhere unexpected, owning it completely

${photoBase64 ? "Analyze this photo carefully — the person, environment, mood, background, lighting, what's present, what's missing." : "No photo — create a vivid scenario."}

Situation: ${situation || "confident Black man in an everyday situation"}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

Brainstorm 3 stunning funny shareable TikTok concepts. Return ONLY a raw JSON array of exactly 3 objects — no markdown, no backticks, no explanation:

- title: concept name, punchy (max 8 words)
- textTop: TOP of screen — sets up the assumption (max 12 words, e.g. "Me and my friends and their baby 👀")
- textPOV: CENTER bold text — main POV or observation (max 10 words)
- textBottom: BOTTOM — the punchline that flips everything (max 12 words)
- addPeople: array of strings — specific people to add with full description (race, age, look, position, what they're doing). Empty array if none needed.
- addProps: string — specific props or environment changes. null if nothing needed.
- imagePrompt: detailed prompt for image generation AI to recreate this full scene (describe subject, added people, environment, lighting, mood — very specific)
- sceneLogic: one sentence why this scene composition creates the joke
- captionA: first caption with hashtags (under 100 chars)
- captionB: second caption different angle (under 100 chars)
- whyItWorks: why this image + text combo goes viral (2 sentences)
- viralScore: number 1-10`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let result;
    if (photoBase64) {
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: photoMime || "image/jpeg",
            data: photoBase64,
          },
        },
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const raw = result.response.text();
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
