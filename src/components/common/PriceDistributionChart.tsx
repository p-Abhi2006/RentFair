import React from 'react';
import { MarketBaseline } from '../../types/rental';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3, AlertCircle, Info } from 'lucide-react';

interface PriceDistributionChartProps {
  baseline: MarketBaseline;
  highlightPrice?: number;
}

export const PriceDistributionChart: React.FC<PriceDistributionChartProps> = ({
  baseline,
  highlightPrice,
}) => {
  const hasDistribution = baseline.priceDistribution && baseline.priceDistribution.length > 0;
  const maxPercentage = hasDistribution
    ? Math.max(...baseline.priceDistribution.map((b) => b.percentage), 1)
    : 1;

  return (
    <div className="rounded-xl bg-rf-surface border border-rf-border p-5 sm:p-6 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rf-teal" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-rf-text-primary uppercase tracking-wider">
              Price Distribution & Market Concentration
            </h3>
          </div>
          <p className="text-xs text-rf-text-muted mt-1">
            Empirical frequency distribution for {baseline.bhk ? `${baseline.bhk} BHK` : 'rental'} listings in {baseline.locality}.
          </p>
        </div>

        {/* Legend */}
        {hasDistribution && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rf-teal" aria-hidden="true"></span>
              <span className="text-rf-text-secondary">Cluster Density</span>
            </div>
            {baseline.medianRent != null && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-400 rounded-sm" aria-hidden="true"></span>
                <span className="text-rf-text-secondary">Median ({formatCurrency(baseline.medianRent)})</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Distribution Bars */}
      {hasDistribution ? (
        <div className="space-y-3.5 my-4" role="region" aria-label="Rental price distribution brackets">
          {baseline.priceDistribution.map((bucket, idx) => {
            const barWidth = `${Math.round((bucket.percentage / maxPercentage) * 100)}%`;
            const isDominant = bucket.percentage === maxPercentage;

            return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-rf-text-primary font-medium group-hover:text-rf-teal-bright transition-colors">
                    {bucket.bracket}
                  </span>
                  <span className="text-rf-text-muted">
                    <strong className="text-rf-text-primary font-semibold">{bucket.count}</strong> listings ({bucket.percentage}%)
                  </span>
                </div>
                <div className="h-4 w-full bg-rf-bg-primary rounded-md overflow-hidden p-0.5 border border-rf-border flex items-center">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ease-out ${
                      isDominant
                        ? 'bg-gradient-to-r from-teal-600 to-rf-teal shadow-sm'
                        : 'bg-rf-surface-elevated group-hover:bg-teal-600/80'
                    }`}
                    style={{ width: barWidth }}
                    role="progressbar"
                    aria-valuenow={bucket.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bucket.bracket}: ${bucket.count} listings, ${bucket.percentage} percent of market`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center rounded-xl bg-rf-bg-primary/50 border border-rf-border my-2">
          <Info className="w-6 h-6 text-rf-text-muted mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-rf-text-muted font-mono">
            Insufficient live sample in {baseline.locality} to plot statistical histogram.
          </p>
          <p className="text-[11px] text-rf-text-muted mt-1">
            A minimum cohort of valid priced listings is required for distribution grouping.
          </p>
        </div>
      )}

      {/* IQR Interquartile Statistical Range Info */}
      <div className="mt-6 pt-5 border-t border-rf-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
          <span className="text-rf-text-muted block text-[10px] uppercase font-sans tracking-wider">
            Q1 (25th Percentile)
          </span>
          <span className="text-rf-text-primary font-bold mt-1 block tabular-nums text-sm">
            {formatCurrency(baseline.rentIqr?.q1)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-teal-800/60">
          <span className="text-rf-teal block text-[10px] uppercase font-sans font-bold tracking-wider">
            Median (50th Percentile)
          </span>
          <span className="text-rf-teal-bright font-bold mt-1 block tabular-nums text-sm">
            {formatCurrency(baseline.medianRent)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
          <span className="text-rf-text-muted block text-[10px] uppercase font-sans tracking-wider">
            Q3 (75th Percentile)
          </span>
          <span className="text-rf-text-primary font-bold mt-1 block tabular-nums text-sm">
            {formatCurrency(baseline.rentIqr?.q3)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
          <span className="text-rf-text-muted block text-[10px] uppercase font-sans tracking-wider">
            IQR Spread
          </span>
          <span className="text-rf-text-primary font-bold mt-1 block tabular-nums text-sm">
            {baseline.rentIqr && baseline.rentIqr.q1 != null && baseline.rentIqr.q3 != null
              ? formatCurrency(baseline.rentIqr.q3 - baseline.rentIqr.q1)
              : 'Unavailable'}
          </span>
        </div>
      </div>

      {highlightPrice && baseline.medianRent && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rf-surface-elevated border border-rf-border text-xs text-rf-text-secondary">
          <AlertCircle className="w-4 h-4 text-rf-teal shrink-0" aria-hidden="true" />
          <span>
            Selected property price:{' '}
            <strong className="text-rf-text-primary font-mono">{formatCurrency(highlightPrice)}</strong>
            {' '}({highlightPrice > baseline.medianRent ? 'Above' : 'Below'} locality median).
          </span>
        </div>
      )}
    </div>
  );
};
