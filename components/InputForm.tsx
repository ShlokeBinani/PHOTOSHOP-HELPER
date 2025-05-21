
import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import type { PsdAssistanceRequest } from '../types';

interface InputFormProps {
  onSubmit: (options: PsdAssistanceRequest) => void;
  isLoading: boolean;
  apiKeyMissing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, apiKeyMissing }) => {
  const [psdFile, setPsdFile] = useState<File | null>(null);
  const [psdFileName, setPsdFileName] = useState<string | null>(null);
  const [changeDescription, setChangeDescription] = useState<string>('');
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>('');

  const handlePsdFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.psd')) {
        setPsdFile(file);
        setPsdFileName(file.name);
      } else {
        alert("Please upload a valid .psd file.");
        event.target.value = ''; // Reset file input
        setPsdFile(null);
        setPsdFileName(null);
      }
    } else {
      setPsdFile(null);
      setPsdFileName(null);
    }
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (apiKeyMissing || !changeDescription.trim()) return;

    onSubmit({
      psdFile,
      psdFileName,
      changeDescription,
      imageGenerationPrompt,
    });
  }, [psdFile, psdFileName, changeDescription, imageGenerationPrompt, onSubmit, apiKeyMissing]);

  const commonInputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-slate-400 text-slate-100 transition-colors duration-200";
  const commonLabelClass = "block mb-2 text-sm font-medium text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
      <div>
        <label htmlFor="psdFile" className={commonLabelClass}>
          📎 Upload your .PSD File (Optional)
        </label>
        <input
          type="file"
          id="psdFile"
          accept=".psd"
          onChange={handlePsdFileChange}
          className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors duration-200"
        />
        {psdFileName && <p className="text-xs text-slate-400 mt-2">Selected: {psdFileName}</p>}
         <p className="text-xs text-slate-500 mt-1">This app does not modify your PSD. It's used for context only.</p>
      </div>

      <div>
        <label htmlFor="changeDescription" className={commonLabelClass}>
          ✍️ Describe the changes you want for your PSD
        </label>
        <textarea
          id="changeDescription"
          value={changeDescription}
          onChange={(e) => setChangeDescription(e.target.value)}
          placeholder="e.g., Change the headline to 'Summer Sale', replace the logo with a new one, add a contact email."
          rows={4}
          className={commonInputClass}
          required
        />
        <p className="text-xs text-slate-500 mt-1">Be specific! The AI will use this to generate instructions and any requested text.</p>
      </div>

      <div>
        <label htmlFor="imageGenerationPrompt" className={commonLabelClass}>
          🖼️ AI Image Generation (Optional)
        </label>
        <input
          type="text"
          id="imageGenerationPrompt"
          value={imageGenerationPrompt}
          onChange={(e) => setImageGenerationPrompt(e.target.value)}
          placeholder="e.g., 'A photo of a cute cat wearing a party hat', 'Abstract background with blue waves'"
          className={commonInputClass}
        />
        <p className="text-xs text-slate-500 mt-1">If you need a new image, describe it here. The AI will generate it for you to use.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading || apiKeyMissing || !changeDescription.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Getting Guidance...
          </>
        ) : (
          '🚀 Get AI Guidance'
        )}
      </button>
      {apiKeyMissing && <p className="text-center text-red-400 text-sm mt-2">API Key is missing. AI guidance is disabled.</p>}
      {!apiKeyMissing && !changeDescription.trim() && <p className="text-center text-amber-400 text-sm mt-2">Please describe the changes you want to make.</p>}
    </form>
  );
};