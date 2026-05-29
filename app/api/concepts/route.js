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
Bottom text = the TWIST that flips the assumption and makes them laugh or say "damn"

PUNCHLINE RULES:
- The bottom text must be SURPRISING — not what anyone expects
- It must connect DIRECTLY to something visible in the image
- Short = harder hitting. Max 10 words. Less is more.
- Think: what would make someone replay this video?

${situation ? `Extra context from creator: ${situation}` : ""}
Vibe: ${vibeDescriptions[vibe] || vibeDescriptions["stereotype-flip"]}

NOW look at the image and generate 3 concepts. Each must use a DIFFERENT angle — don't repeat the same type of joke.

Return ONLY a raw JSON array of exactly 3 objects. No markdown, no backticks, no explanation:

- title: concept name (max 6 words, punchy)
- whatISee: one sentence describing exactly what you see in this specific image that inspired this concept
- textTop: TOP overlay — sets up the assumption (max 10 words, conversational, e.g. "Me trying to look normal at the airport")
- textPOV: CENTER bold text — the POV or observation that deepens it (max 8 words, hits hard)
- textBottom: BOTTOM — the punchline that flips everything (max 10 words, this is the money shot)
- addPeople: array of specific people to add to make the scene funnier — detailed description. Empty array if not needed.
- addProps: specific props or environment changes that enhance the joke. null if not needed.
- captionA: first caption with hashtags (under 100 chars, punchy)
- captionB: second caption different angle (under 100 chars)
- whyItWorks: specifically why THIS image + THESE words = viral (2 sentences, be precise)
- viralScore: number 1-10`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
