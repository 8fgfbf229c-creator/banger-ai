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

    const prompt = `You are the sharpest TikTok comedy writer alive. Your job is to look at this photo and write text overlays that make people STOP scrolling, LAUGH, and SHARE immediately.

CREATOR IDENTITY:
- Black man, intelligent, sharp, confident, never mean
- His superpower: he LOOKS one way and the text reveals something completely unexpected
- The humor is in the GAP — what you assume vs what is actually true
- Think Kevin Hart's confidence + Dave Chappelle's sharpness + zero arrogance

WHAT MAKES A BANGER:
The top text sets up an assumption. The bottom text DESTROYS it in a way nobody saw coming. The punchline must be:
1. SPECIFIC — not generic. "Last slice of cake" and "skipped leg day" are LAZY and BANNED
2. UNEXPECTED — if someone could guess it, it's not good enough
3. CONNECTED to who this person actually looks like they are
4. SHORT — under 8 words hits harder than 12 words every time

LOOK AT THIS PHOTO AND ASK:
- What does this person's expression suggest they are thinking?
- What do they look like they do for a living?
- What assumption would 1000 different viewers make about them?
- What is the LAST thing anyone would expect this person to say or do?
- What social observation can be made about someone who looks exactly like this?

BANNED PUNCHLINES (too generic, used a million times):
- Anything about cake, food, snacks
- Skipped leg day
- Recalling a meme
- Thinking about pizza
- Anything about being tired
- Basic gym jokes

GOOD PUNCHLINE EXAMPLES (this is the energy):
- Someone looks super serious → "Just realized I've been mispronouncing 'quinoa' for 3 years"
- Someone looks confident → "My uber rating is 4.94 and I will never recover"
- Someone looks thoughtful → "Trying to remember if I said 'you too' when the waiter said enjoy your meal"
- Someone looks intense → "Ranked 847th in my city at chess and I tell everyone"

${situation ? `Extra context: ${situation}` : ""}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

Generate 3 concepts — each completely different angle. No two concepts can use the same type of joke.

Return ONLY a raw JSON array of exactly 3 objects. No markdown, no backticks:

- title: concept name (max 6 words, punchy)
- whatISee: what you observe about this specific person — their expression, energy, vibe, what they look like they do
- textTop: setup (max 10 words — what the viewer assumes)
- textPOV: center bold text (max 8 words — deepens the setup)
- textBottom: THE PUNCHLINE (max 10 words — must be specific, unexpected, makes them replay it)
- addPeople: people to add to scene for extra comedy. Empty array if not needed.
- addProps: props to add. null if not needed.
- captionA: caption with hashtags (under 100 chars)
- captionB: second caption different angle (under 100 chars)
- whyItWorks: specifically why this punchline works for THIS person's look (2 sentences)
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
