import React from 'react';
import { Check, X, AlertTriangle, Info, Minus } from 'lucide-react';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface StatusIndicatorProps {
  variant: StatusVariant;
  text: string;
  subtext?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant,
  text,
  subtext,
  size = 'sm',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          wrapper: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
          iconColor: 'text-emerald-400',
          Icon: Check,
        };
      case 'error':
        return {
          wrapper: 'bg-rose-950/40 text-rose-300 border-rose-900/40',
          iconColor: 'text-rose-400',
          Icon: X,
        };
      case 'warning':
        return {
          wrapper: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
          iconColor: 'text-amber-400',
          Icon: AlertTriangle,
        };
      case 'info':
        return {
          wrapper: 'bg-sky-950/40 text-sky-300 border-sky-800/40',
          iconColor: 'text-sky-400',
          Icon: Info,
        };
      case 'neutral':
      default:
        return {
          wrapper: 'bg-slate-900/60 text-slate-300 border-slate-800/60',
          iconColor: 'text-slate-400',
          Icon: Minus,
        };
    }
  };

  const { wrapper, iconColor, Icon } = getVariantStyles();

  const sizeClasses = {
    xs: {
      pill: 'px-2 py-0.5 text-[10px] gap-1',
      icon: 'w-3 h-3',
    },
    sm: {
      pill: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      pill: 'px-3 py-1.5 text-xs gap-2',
      icon: 'w-4 h-4',
    },
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium font-sans ${wrapper} ${sizeClasses[size].pill} ${className}`}
    >
      <Icon className={`${sizeClasses[size].icon} ${iconColor} shrink-0`} aria-hidden="true" />
      <span>{text}</span>
      {subtext && <span className="opacity-80 font-normal text-[11px] ml-0.5">{subtext}</span>}
    </span>
  );
};

export function getBaselineStatus(count: number): {
  variant: StatusVariant;
  text: string;
  subtext?: string;
} {
  if (count >= 5) {
    return {
      variant: 'success',
      text: 'Sufficient live data',
    };
  }
  if (count > 0) {
    return {
      variant: 'warning',
      text: 'Limited sample',
      subtext: `Based on ${count} valid priced listing${count === 1 ? '' : 's'}`,
    };
  }
  return {
    variant: 'error',
    text: 'Insufficient live data',
  };
}

export function getPriceExtractionStatus(isAvailable: boolean): {
  variant: StatusVariant;
  text: string;
} {
  return isAvailable
    ? { variant: 'success', text: 'Explicitly extracted' }
    : { variant: 'error', text: 'Not extracted' };
}

export function getAreaExtractionStatus(isAvailable: boolean): {
  variant: StatusVariant;
  text: string;
} {
  return isAvailable
    ? { variant: 'success', text: 'Explicitly extracted' }
    : { variant: 'error', text: 'Not extracted' };
}

export function getFairnessAnalysisStatus(isAssessed: boolean): {
  variant: StatusVariant;
  text: string;
} {
  return isAssessed
    ? { variant: 'success', text: 'Analysis performed' }
    : { variant: 'neutral', text: 'Not assessed' };
}
