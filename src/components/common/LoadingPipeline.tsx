import React, { useEffect, useState } from 'react';
import { Search, Database, Scale, BarChart2, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingPipelineProps {
  location: string;
  onComplete?: () => void;
  isSimulated?: boolean;
}

const PIPELINE_STEPS = [
  {
    title: 'Query Aggregation',
    description: 'Dispatching location & BHK parameters to SerpApi crawler interface',
    icon: Search,
  },
  {
    title: 'Data Normalization',
    description: 'Standardizing carpet area, furnishing tiers, and security deposits',
    icon: Database,
  },
  {
    title: 'Comparable Clustering',
    description: 'Filtering comparable rental units within target locality and BHK',
    icon: Scale,
  },
  {
    title: 'Market Baseline Computation',
    description: 'Calculating locality median, Q1/Q3 interquartile range (IQR), and sqft rate',
    icon: BarChart2,
  },
  {
    title: 'Fairness Indexing & Outlier Flagging',
    description: 'Evaluating variance delta against statistical market baseline',
    icon: ShieldCheck,
  },
];

export const LoadingPipeline: React.FC<LoadingPipelineProps> = ({
  location,
  onComplete,
  isSimulated = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Gently advance through steps to provide visual feedback while request is in flight
    const stepDuration = isSimulated ? 450 : 600;
    const maxStep = isSimulated ? PIPELINE_STEPS.length - 1 : PIPELINE_STEPS.length - 2;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < maxStep) {
          return prev + 1;
        } else if (isSimulated && prev === PIPELINE_STEPS.length - 2) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 300);
          }
          return PIPELINE_STEPS.length - 1;
        }
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isSimulated, onComplete]);

  return (
    <div
      className="rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-6 shadow-panel max-w-2xl mx-auto my-8 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" aria-hidden="true" />
            Executing RentFair Intelligence Pipeline
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Locality: <span className="text-teal-300">{location || 'Bangalore'}</span>
          </p>
        </div>
        <span className="text-xs font-mono text-slate-300 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 tabular-nums">
          Step {Math.min(currentStep + 1, 5)} / 5
        </span>
      </div>

      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-slate-800/90 border-teal-500/60 shadow-subtle'
                  : isDone
                  ? 'bg-slate-950/50 border-slate-800/70 opacity-90'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isCurrent
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : isDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-teal-300' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800/60 animate-pulse">
                      In Flight
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
