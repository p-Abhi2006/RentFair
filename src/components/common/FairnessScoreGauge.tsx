import React from 'react';
import { FairnessCategory } from '../../types/rental';
import { getFairnessColorDetails, formatVariance } from '../../utils/formatters';

interface FairnessScoreGaugeProps {
  score?: number | null;
  category?: FairnessCategory | null;
  variancePercentage?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showVariance?: boolean;
}

export const FairnessScoreGauge: React.FC<FairnessScoreGaugeProps> = ({
  score,
  category,
  variancePercentage,
  size = 'md',
  showLabel = true,
  showVariance = false,
}) => {
  const details = getFairnessColorDetails(category);
  const variance = formatVariance(variancePercentage);
  const hasScore = score != null && !isNaN(score);
  const validScore = hasScore ? Math.min(Math.max(score, 0), 100) : 0;

  // Gauge sizing parameters
  const dimensions = {
    sm: { width: 56, stroke: 4.5, radius: 23, fontSize: 'text-xs', labelSize: 'text-[9px]' },
    md: { width: 84, stroke: 6, radius: 36, fontSize: 'text-lg', labelSize: 'text-[11px]' },
    lg: { width: 124, stroke: 8, radius: 52, fontSize: 'text-2xl', labelSize: 'text-xs' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  // Arc calculation: 75% arc gauge (from 135deg to 405deg, leaving a 90deg gap at bottom)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = hasScore
    ? arcLength - (arcLength * validScore) / 100
    : arcLength;

  // Semantic arc stroke color (amber for above typical, cyan for near typical, teal for below typical)
  const getStrokeColor = () => {
    if (!hasScore) return '#64748b'; // slate-500
    if (validScore >= 70) return '#14b8a6'; // teal-500
    if (validScore >= 50) return '#38bdf8'; // sky-400
    return '#f59e0b'; // amber-500 (subtle amber accent, NOT error red)
  };

  // Smooth entrance counter animation (respecting prefers-reduced-motion)
  const [displayScore, setDisplayScore] = React.useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return validScore;
    }
    return 0;
  });

  React.useEffect(() => {
    if (!hasScore) {
      setDisplayScore(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayScore(validScore);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 650; // ms
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeProgress * validScore));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [validScore, hasScore]);

  return (
    <div
      className="inline-flex flex-col items-center justify-center text-center"
      role="meter"
      aria-valuenow={hasScore ? validScore : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Fairness Score: ${hasScore ? `${validScore} out of 100` : 'Unassessed'}, ${details.label}`}
    >
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.width}
          viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}
          className="transform -rotate-[135deg] overflow-visible"
        >
          {/* Background track arc */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            fill="none"
            stroke="#24324A"
            strokeWidth={dimensions.stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={dimensions.stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 select-none pointer-events-none">
          {hasScore ? (
            <div className="flex flex-col items-center leading-none">
              <span className={`font-mono font-bold text-white tabular-nums ${dimensions.fontSize}`}>
                {displayScore}
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">/100</span>
            </div>
          ) : (
            <span className="font-mono text-xs font-semibold text-slate-400">N/A</span>
          )}
        </div>
      </div>

      {/* Optional Label / Category */}
      {showLabel && (
        <div className="mt-1.5 flex flex-col items-center">
          <span
            className={`font-semibold tracking-wide ${details.badgeText} ${dimensions.labelSize}`}
          >
            {details.shortLabel}
          </span>
          {showVariance && variancePercentage != null && (
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              {variance.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
