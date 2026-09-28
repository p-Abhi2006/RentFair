import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  description?: string;
  icon: LucideIcon;
  badgeText?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryValue,
  description,
  icon: Icon,
  badgeText,
  trend,
}) => {
  return (
    <div className="relative rounded-xl bg-rf-surface border border-rf-border p-5 shadow-subtle hover:border-rf-border-light hover:bg-rf-surface-elevated/60 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-rf-text-muted uppercase tracking-wider block font-sans">
              {title}
            </span>
            {badgeText && (
              <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rf-surface-elevated text-rf-text-secondary border border-rf-border">
                {badgeText}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-teal-950/70 text-rf-teal border border-teal-800/70 shrink-0">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold tracking-tight text-rf-text-primary font-mono tabular-nums">
            {value}
          </span>
          {secondaryValue && (
            <span className="text-xs font-mono text-rf-text-muted">
              {secondaryValue}
            </span>
          )}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 pt-3 border-t border-rf-border flex flex-wrap items-center justify-between gap-1 text-xs text-rf-text-muted">
          {description && <span className="text-[11px] leading-tight text-rf-text-muted">{description}</span>}
          {trend && (
            <span
              className={`font-mono text-[11px] font-medium shrink-0 ${
                trend.direction === 'up'
                  ? 'text-amber-400'
                  : trend.direction === 'down'
                  ? 'text-rf-teal'
                  : 'text-rf-text-muted'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
