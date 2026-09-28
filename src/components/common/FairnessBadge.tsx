import React from 'react';
import { FairnessCategory } from '../../types/rental';
import { getFairnessColorDetails, formatVariance } from '../../utils/formatters';
import { Info, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface FairnessBadgeProps {
  category?: FairnessCategory | null;
  variancePercentage?: number | null;
  fairnessScore?: number | null;
  showExplanation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FairnessBadge: React.FC<FairnessBadgeProps> = ({
  category,
  variancePercentage,
  fairnessScore,
  showExplanation = false,
  size = 'md',
}) => {
  const details = getFairnessColorDetails(category);
  const variance = formatVariance(variancePercentage);

  const getCategoryIcon = () => {
    if (!category) return Minus;
    switch (category) {
      case 'SIGNIFICANTLY_BELOW_TYPICAL':
      case 'HIGHLY_COMPETITIVE':
      case 'BELOW_TYPICAL':
        return TrendingDown;
      case 'FAIR':
        return Minus;
      case 'ABOVE_TYPICAL':
      case 'SLIGHTLY_HIGH':
      case 'SIGNIFICANTLY_ABOVE_TYPICAL':
      case 'OVERPRICED':
      case 'EXTREME_OUTLIER':
        return TrendingUp;
      default:
        return Minus;
    }
  };

  const IconComponent = getCategoryIcon();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center rounded-md font-medium border transition-colors ${details.badgeBg} ${details.badgeText} ${details.badgeBorder} ${sizeClasses[size]}`}
      >
        <IconComponent className="w-3 h-3 shrink-0 opacity-90" aria-hidden="true" />
        <span className="font-semibold">{details.shortLabel}</span>
        {variancePercentage != null && (
          <>
            <span className="text-slate-500 font-mono text-[10px]">|</span>
            <span className="font-mono tabular-nums">{variance.text}</span>
          </>
        )}
        
        {fairnessScore != null && (
          <span className="ml-1 pl-1.5 border-l border-slate-700/60 font-mono text-[10px] text-slate-400">
            {fairnessScore}/100
          </span>
        )}
      </div>

      {showExplanation && (
        <div className="flex items-start gap-1.5 text-[11px] text-slate-400 mt-1 max-w-sm">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>{details.recommendation}</span>
        </div>
      )}
    </div>
  );
};
