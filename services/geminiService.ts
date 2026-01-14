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

  // Determine if we are in "Helal Reel" mode based on aspect ratio/config presence
  const isReelPro = config.selectedSize === ImageSize.REELS;

  // Icons section for the prompt - strictly 2 icons, one left, one right
  const iconsPrompt = config.icons ? `
    ICON CONFIGURATION (STANDARD):
    - Include exactly 2 high-detailed 3D icons: ${config.icons}.
    - PLACEMENT: Place one icon floating just above the left shoulder and the other floating just above the right shoulder.
    - VISUAL EFFECT: Apply a smooth, elegant radial blur (motion blur) to both icons to create a sense of depth and focus on the subject.
    - QUALITY: Hyper-realistic textures (glass, metal, high-end 3D render).
    - NO GLOW: NO artificial glowing outlines or halos around the icons.
  ` : '';

  const styleSpecifics = isReelPro ? `
    HELAL REEL SIGNATURE STYLE:
    - BACKGROUND: Deep midnight blue, dark carbon, or sleek tech-gray. Subtle technical patterns or clean bokeh.
    - LIGHTING: High-quality natural studio lighting. NO cyan/blue rim lights and NO artificial edge glows.
    - COMPOSITION: Subject is sharp and clear. NO outer glow, NO halos, NO white/blue aura.
    - ABSOLUTELY NO TEXT: CRITICAL RULE - Do not render any text, letters, numbers, watermarks, or typography anywhere in the image.
  ` : `
    GENERAL STYLE:
    - Style: ${config.style}.
    - Background: ${config.background}.
    - Lighting: ${config.lighting}.
  `;

  // Construct the prompt
  const basePrompt = `
    ROLE: Elite Visual Designer for Social Media.
    
    PRIMARY OBJECTIVE:
    Create a hyper-realistic image of the **SPECIFIC PERSON** from the reference images. 
    
    CRITICAL IDENTITY & EXPRESSION LOCK:
    1. **EXACT FACE MATCH**: Replicate the exact facial structure, eyes, nose, jawline, and skin texture of the person in the references.
    2. **EXACT EXPRESSION MATCH**: Mirror the facial expression from the reference images with 100% fidelity. Use the exact same micro-expressions (smile, shock, etc.) as the reference.
    3. **NO GENERIC FACES**: Do not substitute with a stock model face.
    
    SCENE SPECIFICATIONS:
    - **Composition**: Subject is centered, upper body / portrait shot.
    - **Camera Angle**: ${config.cameraAngle}.
    - **Pose**: ${config.pose}.
    ${styleSpecifics}
    ${iconsPrompt}

    QUALITY STANDARDS:
    - 8k UHD, Ultra-photorealistic, high-end cinematic render.
    - STRICTLY NO TEXT, NO LETTERS, NO NUMBERS.
    - NO GLOW OUTLINES, NO HALOS, NO ARTIFICIAL RIM LIGHTING.
    - Perfect rendering of hands and eyes.
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