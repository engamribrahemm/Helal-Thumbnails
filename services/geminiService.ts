import { GoogleGenAI } from "@google/genai";
import { ThumbnailConfig, ReferenceImage, ImageSize } from "../types";

// Helper to check for API key selection
export const checkAndRequestApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      const opened = await (window as any).aistudio.openSelectKey();
      return opened; // Attempted to open
    }
    return true;
  }
  return false; // Not in an environment supporting this or fallback
};

export const generateThumbnails = async (
  config: ThumbnailConfig,
  referenceImages: ReferenceImage[]
): Promise<{ size: ImageSize; base64: string }[]> => {
  
  // Ensure we have an API key selected
  await checkAndRequestApiKey();

  // Initialize client with key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const results: { size: ImageSize; base64: string }[] = [];

  // Construct the prompt
  const basePrompt = `
    ROLE: Expert YouTube Thumbnail Designer.
    
    PRIMARY OBJECTIVE:
    Generate a photorealistic image of the **SPECIFIC PERSON** shown in the attached reference images. 
    
    CRITICAL IDENTITY LOCK (DO NOT IGNORE):
    1. **FACE ID**: The generated face MUST BE AN EXACT MATCH to the reference images. Use the same eye shape, nose structure, jawline, and skin tone.
    2. **NO GENERIC FACES**: Do not replace the person with a generic model. It must be recognizable as the person in the reference.
    3. **DETAILS**: Preserve moles, scars, facial hair patterns, and unique features from the reference.
    
    EXPRESSION & ACTION (MORPHING):
    1. **Target Emotion**: ${config.emotion}.
       - Apply this emotion to the reference face *without* changing the person's identity. 
       - If the emotion requires an open mouth (e.g., Shocked, Excited), ensure **REALISTIC TEETH** and natural mouth interior are visible.
    2. **Target Pose**: ${config.pose}.
    
    SCENE SPECIFICATIONS:
    - **Composition**: Subject is CENTERED in the frame. Upper body / Portrait shot.
    - **Style**: ${config.style}.
    - **Background**: ${config.background}.
    - **Lighting**: ${config.lighting}.
    - **Camera Angle**: ${config.cameraAngle}.

    QUALITY STANDARDS:
    - 8k UHD, Hyper-realistic, High Texture.
    - **NO PLASTIC SKIN**: Keep natural skin pores and texture.
    - **Sharp Focus**: Eyes must be perfectly sharp and detailed.
  `;

  // Number of variations to generate
  const VARIATIONS = 4;
  const size = config.selectedSize;
  const aspectRatio = size === ImageSize.YOUTUBE ? "16:9" : "9:16";
  
  // Prepare content parts
  const parts: any[] = referenceImages.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data
    }
  }));

  parts.push({ text: basePrompt });

  // Create array of promises to run in parallel
  const generationPromises = Array(VARIATIONS).fill(null).map(() => 
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    }).catch(e => {
      console.error("Generation failed for one variation", e);
      return null;
    })
  );

  try {
    const responses = await Promise.all(generationPromises);

    // Extract images from all responses
    for (const response of responses) {
      if (response && response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            results.push({
              size: size,
              base64: part.inlineData.data,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error generating batch`, error);
    throw error;
  }

  return results;
};