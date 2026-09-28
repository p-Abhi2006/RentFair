import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MarketInsightCardProps {
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  colorScheme?: 'teal' | 'amber' | 'slate';
}

export const MarketInsightCard: React.FC<MarketInsightCardProps> = ({
  title,
  subtitle,
  metric,
  metricLabel,
  description,
  icon: Icon,
  badge,
  colorScheme = 'teal',
}) => {
  const schemeStyles = {
    teal: {
      iconBg: 'bg-teal-950/70 border-teal-800/60 text-teal-400',
      metricText: 'text-teal-300',
      badgeBg: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
    },
    amber: {
      iconBg: 'bg-amber-950/70 border-amber-800/60 text-amber-400',
      metricText: 'text-amber-300',
      badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    },
    slate: {
      iconBg: 'bg-slate-800 border-slate-700 text-slate-300',
      metricText: 'text-slate-100',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    },
  }[colorScheme];

  return (
    <div className="rounded-xl bg-rf-surface/90 border border-rf-border p-5 shadow-subtle hover:border-teal-500/30 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`p-2 rounded-lg border ${schemeStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${schemeStyles.badgeBg}`}>
              {badge}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>

        <div className="my-4 py-2 border-y border-slate-800/60">
          <div className={`text-2xl font-bold font-mono ${schemeStyles.metricText}`}>
            {metric}
          </div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
            {metricLabel}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
