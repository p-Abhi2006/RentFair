import React from 'react';
import { Database, Sparkles, ShieldCheck, Activity } from 'lucide-react';

interface PipelineBannerProps {
  compact?: boolean;
  isPrototype?: boolean;
}

export const PipelineBanner: React.FC<PipelineBannerProps> = ({
  compact = false,
  isPrototype = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
        <span className={`w-2 h-2 rounded-full ${isPrototype ? 'bg-amber-400 animate-pulse' : 'bg-teal-400 animate-pulse'}`}></span>
        <span className="text-slate-300 font-medium">Pipeline:</span>
        <span className={isPrototype ? 'text-amber-400' : 'text-teal-400'}>
          {isPrototype ? 'Development Prototype' : 'Live SerpApi Data'}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">Spring Boot Active</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800/90 p-4 shadow-subtle mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-950/70 border border-teal-800/60 text-teal-400 shrink-0 mt-0.5 sm:mt-0">
            {isPrototype ? <Database className="w-4 h-4 text-amber-400" /> : <Activity className="w-4 h-4 text-teal-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 font-mono">
                {isPrototype ? 'Data Transparency Notice' : 'Live Rental Pipeline'}
              </span>
              <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                isPrototype
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : 'bg-teal-950/60 text-teal-300 border-teal-800/60'
              }`}>
                {isPrototype ? 'Development Prototype' : 'Live Search Results'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPrototype ? (
                <>The metrics below represent an <strong className="text-slate-200">indicative baseline model</strong> while live data is loading.</>
              ) : (
                <>Metrics and listing evaluations are dynamically calculated from <strong className="text-slate-200">live SerpApi search results</strong> and evaluated via our Spring Boot statistical engine.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Deterministic Calculations
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            IQR Outlier Detection Active
          </span>
        </div>
      </div>
    </div>
  );
};
