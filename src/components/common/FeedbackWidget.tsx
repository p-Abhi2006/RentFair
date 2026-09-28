import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Check, Info, MessageSquare } from 'lucide-react';

export interface FeedbackWidgetProps {
  title?: string;
  contextNotice?: string;
  storageKey: string;
  improvementOptions?: string[];
  className?: string;
}

const DEFAULT_IMPROVEMENT_OPTIONS = [
  'Market comparison',
  'Listing information',
  'Fairness explanation',
  'Search results',
  'Something else',
];

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  title = 'Was this analysis useful?',
  contextNotice,
  storageKey,
  improvementOptions = DEFAULT_IMPROVEMENT_OPTIONS,
  className = '',
}) => {
  const [rating, setRating] = useState<'yes' | 'no' | null>(null);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Initialize from localStorage if already voted
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRating(parsed.rating || null);
        setIsSubmitted(true);
        if (parsed.categories) setSelectedOptions(parsed.categories);
        if (parsed.comment) setComment(parsed.comment);
      } else {
        setRating(null);
        setIsSubmitted(false);
        setIsImproving(false);
        setSelectedOptions([]);
        setComment('');
      }
    } catch {
      // Local storage fallback for restricted environments
    }
  }, [storageKey]);

  const handleSelectYes = () => {
    setRating('yes');
    setIsSubmitted(true);
    setIsImproving(false);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          rating: 'yes',
          timestamp: new Date().toISOString(),
          type: 'demo_local_feedback',
        })
      );
    } catch {
      // Silently handle storage limits
    }
  };

  const handleSelectNo = () => {
    setRating('no');
    setIsImproving(true);
  };

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSubmitImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setIsImproving(false);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          rating: 'no',
          categories: selectedOptions,
          comment: comment.trim(),
          timestamp: new Date().toISOString(),
          type: 'demo_local_feedback',
        })
      );
    } catch {
      // Silently handle storage limits
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIsImproving(false);
    setRating(null);
    setSelectedOptions([]);
    setComment('');
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className={`rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 transition-all shadow-subtle ${className}`}
      aria-label="User feedback section"
    >
      {/* Submitted Confirmation State */}
      {isSubmitted ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="font-medium text-emerald-300 font-sans">
              Thanks — that helps us improve RentFair.{rating ? ` (${rating === 'yes' ? 'Helpful' : 'Feedback noted'})` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-1.5 py-0.5"
            title="Change response"
          >
            Change response
          </button>
        </div>
      ) : isImproving ? (
        /* Extended "No" Feedback Form */
        <form onSubmit={handleSubmitImprovement} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wide">
              What could be improved?
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Optional</span>
          </div>

          {/* Improvement Checkbox Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {improvementOptions.map((option) => {
              const isChecked = selectedOptions.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-teal-950/40 border-teal-600/70 text-teal-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleOption(option)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-1 focus:ring-teal-400 accent-teal-500"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {/* Optional Textarea Input */}
          <div>
            <label htmlFor={`feedback-comment-${storageKey}`} className="sr-only">
              Tell us more
            </label>
            <textarea
              id={`feedback-comment-${storageKey}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition-colors resize-none shadow-inner"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                // If user skips filling details, record rating 'no' immediately
                handleSelectYes();
              }}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-2 py-1"
            >
              Skip
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              Submit feedback
            </button>
          </div>
        </form>
      ) : (
        /* Primary Two-Button Question */
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-200">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectYes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-teal-500/60 text-xs font-medium text-slate-200 hover:text-teal-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shadow-sm"
                aria-label="Yes, this analysis was useful"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                <span>Yes</span>
              </button>

              <button
                type="button"
                onClick={handleSelectNo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-rose-500/60 text-xs font-medium text-slate-200 hover:text-rose-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 shadow-sm"
                aria-label="No, this analysis was not useful"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Context Notice for Unassessed or Specific Scenarios */}
          {contextNotice && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans">
              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{contextNotice}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
