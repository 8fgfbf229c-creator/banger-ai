async function callClaude(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

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
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

function cleanJSON(raw) {
  let clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = Math.min(
    clean.indexOf("[") === -1 ? Infinity : clean.indexOf("["),
    clean.indexOf("{") === -1 ? Infinity : clean.indexOf("{")
  );
  const last = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
  if (first !== Infinity && last !== -1) clean = clean.slice(first, last + 1);
  return clean;
}

const STYLE_PROMPTS = {
  pov: {
    name: "POV",
    instruction: `Generate POV-style content. Every top text MUST start with "POV:" 
    The POV sets up a very specific moment or situation the viewer instantly recognizes.
    The punchline reveals something unexpected, funny, or deeply relatable about that moment.
    Examples of good POV energy:
    - "POV: you're the only one who actually prepared for this meeting"
    - "POV: you ordered one coffee and stayed 4 hours"
    - "POV: you're watching someone explain something you already knew"
    Make it so specific that people say "how did they know??"`,
  },
  funny: {
    name: "Funny",
    instruction: `Generate pure comedy content. The goal is to make people laugh out loud.
    Study the image and find what is genuinely funny about the situation, the person's expression, 
    the environment, or the contrast between what's happening and what the text says.
    The punchline must be unexpected — if someone could guess it, it's not funny enough.
    Light, warm humor. Never mean. Makes people want to share it immediately.
    Think: the joke you tell at a party that makes everyone burst out laughing.`,
  },
  relatable: {
    name: "Relatable",
    instruction: `Generate deeply relatable content that makes people feel SEEN.
    Look at the image and find the universal human truth in it.
    The content should make someone stop and say "wait this is literally me" or 
    immediately tag a friend because it describes them perfectly.
    The more specific the observation, the more relatable it becomes paradoxically.
    Think about moments everyone experiences but nobody talks about.`,
  },
  flex: {
    name: "Flex",
    instruction: `Generate confident flex content — classy, subtle, never arrogant.
    The flex should feel earned and real, not forced.
    The best flex makes people respect you more, not feel put down.
    It can be about intelligence, taste, lifestyle, presence, or perspective.
    The viewer should think "damn I respect that" not "who does he think he is."
    Understated confidence hits harder than loud bragging.`,
  },
  observation: {
    name: "Observation",
    instruction: `Generate sharp social observation content.
    Look at the image and make an observation about human behavior, society, or life 
    that most people feel but have never heard said this clearly.
    The best observations make people comment to agree, share to show friends, 
    or save because they want to remember it.
    Think: the thing everyone knows is true but nobody says out loud.`,
  },
};

export async function POST(req) {
  try {
    const { photoBase64, photoMime, situation, style } = await req.json();

    const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.pov;

    const imagePart = photoBase64
      ? [{ type: "image", source: { type: "base64", media_type: photoMime || "image/jpeg", data: photoBase64 } }]
      : [];

    // ── PASS 1: Read the image deeply ────────────────────────────────────────
    const pass1 = await callClaude([{
      role: "user",
      content: [
        ...imagePart,
        {
          type: "text",
          text: `Look at this image carefully. Describe it like a poet and a comedian combined.

Return ONLY raw JSON starting with { and ending with }:
{
  "whatIsHappening": "exactly what is in this image — be specific and vivid",
  "mood": "the atmosphere and feeling of this image",
  "subject": "who or what is the main subject",
  "details": "interesting specific details most people would notice",
  "hiddenTruth": "what deeper truth or humor is hiding in plain sight in this image",
  "universalMoment": "what universal human experience does this image represent",
  "comedyGold": "the single funniest or most interesting thing about this specific image"
}`
        }
      ]
    }]);

    let analysis;
    try {
      analysis = JSON.parse(cleanJSON(pass1));
    } catch(e) {
      throw new Error("Analysis failed: " + pass1.slice(0, 200));
    }

    // ── PASS 2: Generate 3 concepts based on style ────────────────────────────
    const pass2 = await callClaude([{
      role: "user",
      content: `You are writing viral TikTok text overlays.

IMAGE ANALYSIS:
${JSON.stringify(analysis, null, 2)}

EXTRA CONTEXT: ${situation || "none"}

CONTENT STYLE: ${styleConfig.name}
STYLE INSTRUCTIONS: ${styleConfig.instruction}

CREATOR: Confident, funny, warm. Makes content about ANYTHING — nature, coffee, football, everyday moments, people. Every image has a story worth telling.

THE FORMAT:
- Top text: sets up the moment (max 10 words)
- Middle text: deepens it or gives the POV (max 8 words)  
- Bottom text: the payoff — the line that makes people stop (max 10 words)

QUALITY CHECK for each concept:
✓ Would someone screenshot this?
✓ Would they send it to a friend?
✓ Is the bottom line genuinely surprising or true?
✓ Does it ONLY work for THIS specific image?

BANNED: food jokes (unless food is literally in the image), gym jokes, forgetting things, AirPods, being tired, motivational quotes, anything generic

Return ONLY raw JSON array of exactly 3 objects. Start with [ end with ]:
[
  {
    "title": "concept title max 6 words",
    "style": "${styleConfig.name}",
    "whatMakesItWork": "one sentence on why this specific image makes this concept land",
    "textTop": "top overlay",
    "textPOV": "middle overlay",
    "textBottom": "bottom punchline",
    "captionA": "caption with hashtags under 100 chars",
    "captionB": "second caption under 100 chars",
    "targetEmotion": "laugh | tag_friend | screenshot | comment | share",
    "viralScore": 8
  }
]`
    }]);

    let concepts;
    try {
      concepts = JSON.parse(cleanJSON(pass2));
    } catch(e) {
      throw new Error("Concepts failed: " + pass2.slice(0, 200));
    }

    return Response.json({ success: true, concepts, analysis });
  } catch (err) {
    console.error("Error:", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
