
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const travelInTime = async (
  base64Image: string,
  years: number,
  direction: 'past' | 'future'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean up base64 string if it contains prefix
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const prompt = direction === 'future' 
    ? `Predict and visualize how this person will look in exactly ${years} years. Focus on realistic aging signs like skin texture, hair color changes, and subtle structural facial shifts while strictly preserving their unique identity and facial features. Background should remain consistent but can be slightly aged.`
    : `Predict and visualize how this person looked exactly ${Math.abs(years)} years ago. Focus on de-aging characteristics like smoother skin, more youthful facial fullness, and hair color restoration while strictly preserving their unique identity.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response generated from the model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Could not find image in model response.");
  } catch (error: any) {
    console.error("Time travel error:", error);
    throw new Error(error.message || "An error occurred during aging simulation.");
  }
};
