
import React from 'react';
import type { PsdAssistanceResponse } from '../types';

interface GeneratedContentDisplayProps {
  content: PsdAssistanceResponse;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ content }) => {
  const downloadImage = () => {
    if (content.generatedImageBase64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${content.generatedImageBase64}`;
      link.download = 'ai_generated_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="mt-8 p-6 sm:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        ✨ AI Guidance Results
      </h2>

      {content.psdFileName && (
        <p className="mb-4 text-slate-300">
          These instructions are for your file: <strong className="text-purple-300">{content.psdFileName}</strong>
        </p>
      )}

      {content.generatedText && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3 text-slate-200">💡 AI Generated Text Suggestion:</h3>
          <div className="bg-slate-700 p-4 rounded-lg shadow-inner">
            <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-sans">{content.generatedText}</pre>
          </div>
          <p className="text-xs text-slate-400 mt-2">You can copy and use this text in your PSD as per the instructions below.</p>
        </div>
      )}

      {content.generatedImageBase64 && (
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3 text-slate-200">🖼️ AI Generated Image:</h3>
          <div className="flex flex-col items-center bg-slate-700 p-4 rounded-lg shadow-inner">
             <img 
                src={`data:image/png;base64,${content.generatedImageBase64}`} 
                alt="AI-generated image for PSD" 
                className="max-w-full max-h-96 rounded-md shadow-lg border border-slate-600"
              />
            <button
              onClick={downloadImage}
              className="mt-4 w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors duration-200"
              aria-label="Download AI generated image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              Download Image
            </button>
          </div>
           <p className="text-xs text-slate-400 mt-2">Use the instructions below to place this image into your PSD file.</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-medium mb-3 text-slate-200">📖 Step-by-Step Instructions:</h3>
        <div className="bg-slate-700 p-4 rounded-lg shadow-inner prose prose-sm prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-sans">{content.instructions}</pre>
        </div>
        <p className="text-xs text-slate-400 mt-3">
            Remember: These are general instructions for most layer-based image editors like Photoshop or GIMP.
            Specific layer names or exact steps might vary slightly based on your PSD's structure.
            Always save your work frequently!
        </p>
      </div>
    </div>
  );
};