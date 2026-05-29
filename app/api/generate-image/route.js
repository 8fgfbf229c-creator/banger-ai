import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imagePrompt, photoBase64, photoMime } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const fullPrompt = photoBase64
      ? `You are an image editor. Take this photo and modify the scene exactly as described. Keep the main subject (the person) exactly as they are. Only add or change what is described. Scene to create: ${imagePrompt}`
      : `Create a photorealistic image: ${imagePrompt}. Cinematic lighting, high quality, realistic people.`;

    const contents = photoBase64
      ? [
          {
            role: "user",
            parts: [
              { text: fullPrompt },
              { inlineData: { mimeType: photoMime || "image/jpeg", data: photoBase64 } },
            ],
          },
        ]
      : [{ role: "user", parts: [{ text: fullPrompt }] }];

    const result = await model.generateContent(
  photoBase64
    ? [fullPrompt, { inlineData: { mimeType: photoMime || "image/jpeg", data: photoBase64 } }]
    : [fullPrompt],
  { generationConfig: { responseModalities: ["image", "text"] } }
);


    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return Response.json({ success: true, imageUrl });
      }
    }

    throw new Error("No image returned from Gemini");
  } catch (err) {
    console.error("Image generation error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
