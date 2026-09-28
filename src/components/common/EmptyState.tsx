import React from 'react';
import { SearchX, RotateCcw, HelpCircle, Compass } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  reason?: string;
  suggestion?: string;
  onReset?: () => void;
  resetLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '— No live search results found',
  reason = 'The current search parameters did not match any active listings in our search index.',
  suggestion = 'Try adjusting your maximum rent ceiling, selecting another BHK tier, or broadening to adjacent Bangalore micro-markets.',
  onReset,
  resetLabel = 'Reset Filters',
  onSecondaryAction,
  secondaryActionLabel,
  icon: Icon = SearchX,
}) => {
  return (
    <div
      className="relative rounded-2xl border border-rf-border bg-rf-surface/90 p-8 sm:p-12 text-center max-w-xl mx-auto my-10 shadow-subtle overflow-hidden font-sans"
      role="status"
      aria-live="polite"
    >
      {/* Subtle architectural drafting background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-rf-border flex items-center justify-center text-teal-400 mx-auto mb-5 shadow-sm relative z-10">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      {/* 1. What Happened */}
      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight relative z-10">
        {title}
      </h3>

      {/* 2. Why It Happened */}
      <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal leading-relaxed relative z-10">
        {reason}
      </p>

      {/* 3. What To Do Next */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-rf-border text-left text-xs text-slate-400 flex items-start gap-2.5 relative z-10">
        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="leading-relaxed">
          <strong className="text-slate-200">Recommended Next Steps:</strong> {suggestion}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-10">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 active:bg-teal-500 text-slate-950 text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{resetLabel}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rf-surface-elevated hover:bg-rf-surface text-slate-200 border border-rf-border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
