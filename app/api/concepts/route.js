import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const prompt = `You are a viral TikTok visual comedy director. Create concepts where IMAGE + TEXT OVERLAYS tell the story together. They must match perfectly.

CREATOR IDENTITY: Black man, intelligent, funny, confident, never mean. Comedy comes from the GAP between what viewer ASSUMES and what TEXT REVEALS.

MOST IMPORTANT RULE — THE CONCEPT MUST MATCH THE IMAGE:
Look at this photo carefully. Describe to yourself:
- Where exactly is this person? What environment?
- What are they wearing?
- What is their expression?
- What is in the background?

The concept MUST use what you actually see. If they are at a gym — use the gym. If they are on stairs — use the stairs. NEVER invent a situation not visible in the photo.

FORMULA:
- Top text = the innocent assumption (what viewer thinks)
- Middle text = deepens the setup
- Bottom text = the twist punchline that flips everything

${situation ? `Extra context: ${situation}` : ""}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

Return ONLY a raw JSON array of exactly 3 objects. No markdown, no backticks:

- title: punchy concept name (max 6 words)
- whatISee: exactly what you see in the photo that inspired this
- textTop: setup assumption (max 10 words)
- textPOV: center bold POV (max 8 words)
- textBottom: punchline twist (max 10 words, make it hit hard)
- addPeople: array of people to add to scene. Empty if not needed.
- addProps: props to add. null if not needed.
- captionA: caption with hashtags (under 100 chars)
- captionB: second caption (under 100 chars)
- whyItWorks: why this goes viral (2 sentences)
- viralScore: number 1-10`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;
    if (photoBase64) {
      result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: photoMime || "image/jpeg", data: photoBase64 } },
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
