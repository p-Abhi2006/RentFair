import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash, WifiOff, HelpCircle, X } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Search failed',
  message,
  onRetry,
  retryLabel = 'Retry Request',
}) => {
  const isConnectionError = message.toLowerCase().includes('connect') || message.toLowerCase().includes('network') || message.toLowerCase().includes('8080');
  const isRateLimit = message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota');

  const getIcon = () => {
    if (isConnectionError) return WifiOff;
    if (isRateLimit) return AlertTriangle;
    return ServerCrash;
  };

  const Icon = getIcon();

  const getNextSteps = () => {
    if (isConnectionError) {
      return 'Verify that the Java Spring Boot backend server is actively running on port 8080. If newly started, give it a moment to initialize before retrying.';
    }
    if (isRateLimit) {
      return 'The search engine rate limit or monthly query allowance has been reached. Please pause a moment before retrying, or verify your SerpApi quota.';
    }
    return 'Check your search query format and verify your network connectivity. If the problem persists, review the backend logs.';
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
          <strong className="text-slate-100">Next Action:</strong> {getNextSteps()}
        </span>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{retryLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
