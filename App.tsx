
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputForm } from './components/InputForm';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { getPsdAssistance } from './services/geminiService';
import type { PsdAssistanceRequest, PsdAssistanceResponse, ApiError } from './types';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [psdAssistanceOutput, setPsdAssistanceOutput] = useState<PsdAssistanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('');

  React.useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyStatus("API Key is missing. Please ensure the API_KEY environment variable is set for the AI features to work.");
      setError({ message: "Configuration error: API_KEY is not set. The application's AI capabilities are disabled." });
    } else {
      setApiKeyStatus("API Key detected. AI features should be operational.");
    }
  }, []);

  const handleGetGuidanceSubmit = useCallback(async (options: PsdAssistanceRequest) => {
    if (!process.env.API_KEY) {
      setError({ message: "API Key is missing. Cannot get AI guidance." });
      return;
    }
    setIsLoading(true);
    setError(null);
    setPsdAssistanceOutput(null);

    try {
      const guidance = await getPsdAssistance(options);
      setPsdAssistanceOutput(guidance);
    } catch (err) {
      console.error("Error getting AI guidance:", err);
      if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: 'An unknown error occurred while fetching AI guidance.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <Header title={APP_TITLE} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        {apiKeyStatus && (
            <div className={`p-3 mb-6 text-sm rounded-lg ${!process.env.API_KEY ? 'bg-red-800 text-red-100 border border-red-700' : 'bg-green-800 text-green-100 border border-green-700'}`} role="status" aria-live="polite">
                 {apiKeyStatus}
            </div>
        )}
        
        <p className="text-center text-slate-300 mb-6 max-w-2xl">
          Welcome to the PSD AI Assistant! Upload your PSD (optional, for context), describe the changes you want, and optionally ask the AI to generate an image. 
          The AI will then provide step-by-step instructions to help you make those edits in your favorite image editor. 
          <strong className="text-amber-300 block mt-1">This app does not directly modify your PSD files.</strong>
        </p>


        <div className="w-full max-w-4xl space-y-8">
          <InputForm onSubmit={handleGetGuidanceSubmit} isLoading={isLoading} apiKeyMissing={!process.env.API_KEY} />
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorDisplay message={error.message} />}
          {psdAssistanceOutput && !isLoading && !error && (
            <GeneratedContentDisplay content={psdAssistanceOutput} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;