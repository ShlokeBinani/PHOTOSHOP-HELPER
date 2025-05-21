
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { PsdAssistanceRequest, PsdAssistanceResponse } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY is not configured. Please set the environment variable.");
  }
  return apiKey;
};

export const getPsdAssistance = async (
  options: PsdAssistanceRequest
): Promise<PsdAssistanceResponse> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const { psdFileName, changeDescription, imageGenerationPrompt } = options;

  let generatedTextFromInstructions: string | null = null;
  let instructions: string = "Failed to generate instructions.";

  // --- Instruction and Text Generation ---
  const instructionPrompt = `You are an AI assistant helping a user make changes to a PSD file, likely named "${psdFileName || 'their PSD file'}", using an image editor like Adobe Photoshop or GIMP.
The user is likely a beginner.
The user wants to make the following changes: "${changeDescription}".

Your primary goal is to provide clear, step-by-step instructions on how to achieve these changes.
If the user's request explicitly asks you to "generate text for X" or "create a slogan for Y", or "write a headline saying Z", then generate that specific text creative and present it clearly within your response, labelled as a suggestion. For example:
"Okay, here's a suggested tagline for your coffee shop: 'Your Daily Grind, Perfected.'"
Then, continue with instructions on how to add this text to their PSD.
If the user simply states "change the title to 'My New Title'", the new text is 'My New Title', and you should instruct them to type that. Do not say "Suggested text: My New Title" in this case, just guide them to make the change.

Structure your response:
1.  Acknowledge the task, mentioning the PSD file name if available.
2.  If you've generated creative text based on an explicit request (like "generate a slogan"), present that text clearly.
3.  Provide numbered, step-by-step instructions. Be very specific about tools (e.g., "Select the Text Tool (often represented by a 'T' icon)"), panels (e.g., "Look at your Layers panel"), and actions (e.g., "Click on the text layer to select it," "Drag the new image from your computer onto the Photoshop canvas.").
4.  If the user mentioned replacing an image or adding a new one, and they might use an AI-generated image (you'll know if they provided a separate image prompt), instruct them on how to place an image file into their PSD (e.g., "File > Place Embedded" or drag-and-drop).

Example of good instruction tone:
"To change the headline in your PSD ('${psdFileName || 'your file'}'), follow these steps:
1. Open your PSD file in Photoshop.
2. Look for the text layer that contains the current headline. It might be named 'Main Title' or something similar in your Layers panel.
3. Select the Text Tool from the toolbar (it usually looks like a 'T').
4. Click directly on the headline text on your canvas. This should make the text editable.
5. Delete the old text and type in your new headline: '[the new headline text user specified]'.
6. Click the checkmark in the options bar at the top (or press Enter on the numpad) to confirm the change."

Make the instructions easy to understand for someone who isn't a design expert.
Conclude with a friendly reminder that layer names and exact layouts can vary.
Do not generate image prompts or image data in this response. Image generation is handled separately if requested by the user.
Focus on providing helpful, actionable guidance for their image editor.`;


  try {
    const instructionResponse: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: instructionPrompt,
      config: {
        temperature: 0.7, // Balanced for factual instructions with some creativity for text
        topP: 0.95,
        topK: 64,
      }
    });
    instructions = instructionResponse.text;

    // Attempt to extract any AI-generated creative text from the instructions if clearly marked.
    // This is a simple heuristic. More robust would be structured JSON output from the LLM.
    const textSuggestionPattern = /suggested tagline for.*?:\s*['"](.*?)['"]/i;
    const textSuggestionPattern2 = /suggested headline for.*?:\s*['"](.*?)['"]/i;
    const textSuggestionPattern3 = /here's a suggested.*?:\s*['"](.*?)['"]/i;
    
    let match = instructions.match(textSuggestionPattern);
    if (!match) match = instructions.match(textSuggestionPattern2);
    if (!match) match = instructions.match(textSuggestionPattern3);

    if (match && match[1]) {
        generatedTextFromInstructions = match[1].trim();
        // Optionally, you could try to remove this specific sentence from the main instructions if it's redundant.
        // For now, we'll keep it simple and let it be part of both.
    }

  } catch (error) {
    console.error("Error during instruction generation:", error);
    if (error instanceof Error) {
      instructions = `Instruction generation failed: ${error.message}`;
    }
  }

  // --- Image Generation (if requested) ---
  let generatedImageBase64: string | undefined = undefined;
  if (imageGenerationPrompt && imageGenerationPrompt.trim() !== '') {
    try {
      const imageResponse = await ai.models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: imageGenerationPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png'
        },
      });

      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        generatedImageBase64 = imageResponse.generatedImages[0].image.imageBytes;
      } else {
        console.warn("Image generation returned no images for prompt:", imageGenerationPrompt);
        instructions += "\n\nNote: AI image generation was requested, but no image was produced. Please check your image prompt or try again.";
      }
    } catch (error) {
      console.error("Error during AI image generation:", error);
      if (error instanceof Error) {
        instructions += `\n\nAI Image generation failed: ${error.message}`;
      }
    }
  }

  return {
    psdFileName,
    generatedText: generatedTextFromInstructions,
    generatedImageBase64,
    instructions,
  };
};