import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { photoBase64, photoMime, situation, vibe } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.4 },
    });

    const creativeModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 1.1, topP: 0.95 },
    });

    const imagepart = photoBase64
      ? [{ inlineData: { mimeType: photoMime || "image/jpeg", data: photoBase64 } }]
      : [];

    // ── PASS 1: Visual + Social Analysis ─────────────────────────────────────
    const analysisPrompt = `You are a sharp social observer and body language expert.
Analyze this photo like a human who reads people instantly.

Return ONLY raw JSON — no markdown, no backticks:
{
  "expression": "exact description of facial expression",
  "bodyLanguage": "what their posture and body communicate",
  "perceivedStatus": "what most people would assume about this person's status/personality in 2 seconds",
  "hiddenEnergy": "what this person might actually be thinking or feeling that contradicts how they look",
  "environment": "exactly where are they, what is around them",
  "socialDynamic": "what is happening socially in this scene",
  "viewerAssumption": "the single strongest assumption a viewer makes in the first 2 seconds",
  "comedicTension": "the single sharpest contrast between appearance and reality for this specific person",
  "tensionType": "one of: looks_intimidating_actually_warm | looks_serious_actually_funny | looks_confident_actually_relatable | looks_focused_actually_distracted | looks_powerful_actually_humble | stereotype_flip"
}`;

    const analysisResult = await model.generateContent([
      analysisPrompt,
      ...imagepart,
    ]);
    const analysisRaw = analysisResult.response.text().replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(analysisRaw);

    // ── PASS 2: Joke Mechanism Selection ─────────────────────────────────────
    const jokeMechanismPrompt = `You are a comedy writer who specializes in viral social media humor.

Here is the analysis of the person in the photo:
${JSON.stringify(analysis, null, 2)}

Situation context: ${situation || "everyday moment"}
Requested vibe: ${vibe || "stereotype-flip"}

Based on this analysis, generate 3 DIFFERENT joke mechanisms. Each must use a different type of comedy tension.

Choose from these tension types and assign one to each concept:
- SOCIAL DOMINANCE FLIP: looks powerful → reveals something unexpectedly humble or relatable
- SILENT INTELLIGENCE: looks quiet/still → reveals sharp social observation nobody else noticed  
- STEREOTYPE INVERSION: viewer makes racial/social assumption → completely subverted with warmth
- EMOTIONAL CONTRAST: serious exterior → surprisingly soft, funny, or vulnerable interior
- STATUS MISMATCH: looks one economic/social level → actually at a completely different level
- COMMENT MAGNET: says something so true that people MUST comment to agree or disagree

For each concept return:
- tensionType: which type from above
- setup: the assumption the viewer makes (1 sentence)
- flip: what the reality actually is (1 sentence, must be specific NOT generic)
- whySharp: why this specific flip works for THIS person's specific look
- commentBait: what kind of comment this will trigger

Return ONLY raw JSON array of 3 objects. No markdown, no backticks.`;

    const mechanismResult = await creativeModel.generateContent(jokeMechanismPrompt);
    const mechanismRaw = mechanismResult.response.text().replace(/```json|```/g, "").trim();
    const mechanisms = JSON.parse(mechanismRaw);

    // ── PASS 3: Write the Overlays ────────────────────────────────────────────
    const overlayPrompt = `You are writing TikTok text overlays. You have the analysis and joke mechanisms. Now write the final overlays.

CREATOR IDENTITY:
- Black man, fun, confident, naturally funny, never arrogant
- His humor: light, smart, makes people smile and feel included
- NOT: deep philosopher, trying too hard, mean, generic
- YES: the guy who says one thing and the room laughs because it's just TRUE and real

Photo analysis:
${JSON.stringify(analysis, null, 2)}

Joke mechanisms to use:
${JSON.stringify(mechanisms, null, 2)}

WRITING RULES:
1. Top text = 10 words max. Sounds like something a real person would type
2. Middle text = 8 words max. Punchy, bold energy
3. Bottom text = 10 words max. THE PUNCHLINE. Must feel earned, specific, impossible to apply to everyone
4. NO motivational language, NO fake deep quotes, NO internet slang
5. Must sound like a real person posted this, not an AI
6. The punchline must make someone say "wait" then laugh

BANNED PUNCHLINES:
- anything about food, snacks, cake
- gym jokes about sets or reps
- forgetting things at home
- AirPods or phone chargers  
- being tired or sleepy
- "this is my X face"
- generic "we all do this" observations

HARDNESS FILTER — before finalizing each concept ask:
- Would I screenshot this? 
- Would I send this to a friend?
- Does this feel like only THIS person could post it?
If the answer is no to any — rewrite it.

Return ONLY raw JSON array of exactly 3 objects. No markdown, no backticks:
- title: concept name max 6 words
- whatISee: one sentence on the person's energy in this photo
- tensionType: which tension type this uses
- textTop: top overlay
- textPOV: center bold overlay  
- textBottom: the punchline
- addPeople: specific people to add to scene for extra comedy. Empty array if not needed.
- addProps: props or environment changes. null if not needed.
- captionA: caption with hashtags under 100 chars
- captionB: second caption under 100 chars
- whyItWorks: why this punchline works for THIS person specifically (2 sentences)
- viralScore: 1-10`;

    const overlayResult = await creativeModel.generateContent(overlayPrompt);
    const overlayRaw = overlayResult.response.text().replace(/```json|```/g, "").trim();
    const concepts = JSON.parse(overlayRaw);

    return Response.json({ success: true, concepts });
  } catch (err) {
    console.error("Concept generation error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
