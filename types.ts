
export interface PsdAssistanceRequest {
  psdFile: File | null;
  psdFileName: string | null;
  changeDescription: string;
  imageGenerationPrompt: string; // Prompt for AI to generate a new image asset
}

export interface PsdAssistanceResponse {
  psdFileName: string | null;
  generatedText: string | null; // e.g., a new headline or slogan AI generated
  generatedImageBase64: string | null; // If AI was asked to generate a new image asset
  instructions: string; // Step-by-step guide from AI
}

export interface ApiError {
  message: string;
}

// For Gemini API responses (simplified) - can be kept for future use if needed
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}