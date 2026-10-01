import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash, WifiOff, HelpCircle, X, Sparkles } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onUseDemoData?: () => void;
  demoDataLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Search failed',
  message,
  onRetry,
  retryLabel = 'Retry Request',
  onUseDemoData,
  demoDataLabel = 'Explore Verified Demo Dataset',
}) => {
  const isConnectionError =
    message.toLowerCase().includes('connect') ||
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('8080');
  const isRateLimit = message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota');
  const isMissingKey = message.toLowerCase().includes('api_key') || message.toLowerCase().includes('missing');

  const getIcon = () => {
    if (isConnectionError) return WifiOff;
    if (isRateLimit || isMissingKey) return AlertTriangle;
    return ServerCrash;
  };

  const Icon = getIcon();

  const getNextSteps = () => {
    if (isConnectionError) {
      return 'Verify that the Java Spring Boot backend server is running on port 8080. You can also explore the platform right away using the verified Bangalore sample dataset below.';
    }
    if (isRateLimit) {
      return 'The SerpApi rate limit or monthly query allowance has been reached. You can continue testing the full evaluation UI using the demo baseline dataset.';
    }
    if (isMissingKey) {
      return 'SERPAPI_API_KEY is not configured on the backend. Add your key to .env or explore the verified prototype dataset below.';
    }
    return 'Check your search query format and verify your network connectivity. You can explore the platform right now using the verified demo dataset below.';
  };

  return (
    <div
      className="rounded-2xl border border-rose-900/60 bg-rose-950/25 p-6 sm:p-10 text-center max-w-xl mx-auto my-10 shadow-panel"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-sm">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      {/* 1. What Happened */}
      <h3 className="text-base sm:text-lg font-bold text-rose-100 tracking-tight flex items-center justify-center gap-2">
        <X className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
        <span>{title}</span>
      </h3>

      {/* 2. Why It Happened */}
      <p className="text-xs sm:text-sm text-rose-200/90 mt-2 font-mono leading-relaxed bg-rose-950/40 p-3 rounded-xl border border-rose-900/40 text-left">
        {message}
      </p>

      {/* 3. What To Do Next */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-300 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="leading-relaxed">
          <strong className="text-slate-100">Recommended Action:</strong> {getNextSteps()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{retryLabel}</span>
          </button>
        )}

        {onUseDemoData && (
          <button
            type="button"
            onClick={onUseDemoData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-slate-950 text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" aria-hidden="true" />
            <span>{demoDataLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
