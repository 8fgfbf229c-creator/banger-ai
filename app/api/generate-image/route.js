import * as fal from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(req) {
  try {
    const { imagePrompt, photoBase64, photoMime } = await req.json();

    // If user uploaded a photo, use image-to-image (edit the real photo)
    // Otherwise generate from scratch
    if (photoBase64) {
      // Use fal.ai flux-general with image input to add elements to the photo
      const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
        input: {
          prompt: imagePrompt,
          image_url: `data:${photoMime || "image/jpeg"};base64,${photoBase64}`,
          strength: 0.75, // how much to change (0 = keep original, 1 = ignore original)
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          image_size: "portrait_4_3",
        },
      });

      const imageUrl = result.data?.images?.[0]?.url;
      if (!imageUrl) throw new Error("No image returned from fal.ai");

      return Response.json({ success: true, imageUrl });
    } else {
      // Generate from scratch
      const result = await fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt: imagePrompt,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          image_size: "portrait_4_3",
        },
      });

      const imageUrl = result.data?.images?.[0]?.url;
      if (!imageUrl) throw new Error("No image returned from fal.ai");

      return Response.json({ success: true, imageUrl });
    }
  } catch (err) {
    console.error("Image generation error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
