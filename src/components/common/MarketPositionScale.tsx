import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface MarketPositionScaleProps {
  variancePercentage?: number | null;
  q1?: number | null;
  median?: number | null;
  q3?: number | null;
  targetRent?: number | null;
  compact?: boolean;
}

export const MarketPositionScale: React.FC<MarketPositionScaleProps> = ({
  variancePercentage,
  q1,
  median,
  q3,
  targetRent,
  compact = false,
}) => {
  const hasVariance = variancePercentage != null && !isNaN(variancePercentage);
  
  // Pin position along scale: 50% is Median (0% variance)
  // Maps -25% variance to ~15%, 0% to 50%, +25% to ~85%
  const pinPosition = hasVariance
    ? Math.min(Math.max(50 + variancePercentage * 1.4, 8), 92)
    : 50;

  const isBelow = hasVariance && variancePercentage < -3;
  const isAbove = hasVariance && variancePercentage > 3;
  
  const statusColor = isBelow
    ? 'text-teal-400'
    : isAbove
    ? 'text-amber-400'
    : 'text-sky-400';

  const dotBg = isBelow
    ? 'bg-teal-400 border-teal-200 shadow-[0_0_8px_rgba(45,212,191,0.6)]'
    : isAbove
    ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
    : 'bg-sky-400 border-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.6)]';

  if (compact) {
    return (
      <div className="w-full font-sans select-none" aria-label="Market Position Scale">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
          <span>Q1</span>
          <span className="text-slate-300 font-semibold">Median</span>
          <span>Q3</span>
        </div>
        
        {/* Track Line with Pin */}
        <div className="relative h-3 w-full flex items-center">
          {/* Continuous calm gradient track */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full relative overflow-hidden flex">
            <div className="w-1/3 bg-emerald-500/25 border-r border-slate-900/60" />
            <div className="w-1/3 bg-teal-500/25 border-r border-slate-900/60" />
            <div className="w-1/3 bg-amber-500/25" />
          </div>

          {/* Median center tick */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-400/80 rounded-full" />

          {/* Target Listing Indicator Pin */}
          {hasVariance ? (
            <div
              className="absolute -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-500 ease-out"
              style={{ left: `${pinPosition}%` }}
              title={`Market Position: ${variancePercentage > 0 ? `+${variancePercentage.toFixed(1)}%` : `${variancePercentage.toFixed(1)}%`} vs Median`}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${dotBg}`} />
            </div>
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500" title="Unassessed" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Expanded Version (for Modals and Detailed Overviews)
  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-rf-bg-primary/90 border border-rf-border font-sans select-none">
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
          Market Position Scale
        </span>
        {hasVariance ? (
          <span className={`text-xs font-semibold ${statusColor} tabular-nums`}>
            {targetRent != null && <span className="text-white mr-1.5 font-bold">{formatCurrency(targetRent)}</span>}
            ({variancePercentage > 0 ? `+${variancePercentage.toFixed(1)}%` : `${variancePercentage.toFixed(1)}%`} vs Median)
          </span>
        ) : (
          <span className="text-xs text-slate-400">Benchmark Pending</span>
        )}
      </div>

      {/* Main Track Bar with Segments */}
      <div className="relative pt-3 pb-6">
        <div className="h-3.5 w-full rounded-full bg-slate-900 overflow-hidden border border-rf-border flex">
          <div className="w-1/3 bg-emerald-500/20 border-r border-slate-800" title="Below Typical Region (< Q1)" />
          <div className="w-1/3 bg-teal-500/20 border-r border-slate-800" title="Near Typical Region (Q1 – Q3)" />
          <div className="w-1/3 bg-amber-500/20" title="Above Typical Region (> Q3)" />
        </div>

        {/* Center Median Divider */}
        <div className="absolute top-2.5 bottom-6 left-1/2 w-0.5 bg-teal-400/80 -translate-x-1/2 pointer-events-none" />

        {/* Position Pin Marker */}
        {hasVariance && (
          <div
            className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 ease-out z-10"
            style={{ left: `${pinPosition}%` }}
          >
            <div className={`w-4 h-4 rounded-full border-2 ${dotBg}`} />
            <span className="text-[10px] font-semibold text-white mt-1 px-2 py-0.5 rounded-md bg-slate-900 border border-rf-border shadow-md whitespace-nowrap">
              This Property
            </span>
          </div>
        )}

        {/* Axis Labels */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
          <div className="text-left">
            <span className="text-emerald-400 font-semibold block text-[11px]">Q1 (25th %ile)</span>
            <span className="tabular-nums text-slate-300">{q1 ? formatCurrency(q1) : 'Lower Range'}</span>
          </div>

          <div className="text-center">
            <span className="text-teal-400 font-bold block text-[11px]">MEDIAN (50th %ile)</span>
            <span className="text-white font-semibold tabular-nums">{median ? formatCurrency(median) : 'Market Median'}</span>
          </div>

          <div className="text-right">
            <span className="text-amber-400 font-semibold block text-[11px]">Q3 (75th %ile)</span>
            <span className="tabular-nums text-slate-300">{q3 ? formatCurrency(q3) : 'Upper Range'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
