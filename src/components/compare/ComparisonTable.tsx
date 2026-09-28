import React from 'react';
import { RentalListing, MarketBaseline } from '../../types/rental';
import { formatCurrency, formatPricePerSqft, formatArea } from '../../utils/formatters';
import { FairnessBadge } from '../common/FairnessBadge';
import {
  Scale,
  Trash2,
  MapPin,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

interface ComparisonTableProps {
  listings: RentalListing[];
  baseline: MarketBaseline;
  onRemove: (id: string) => void;
  onInspect: (listing: RentalListing) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  listings,
  baseline,
  onRemove,
  onInspect,
}) => {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-rf-border bg-rf-surface/90 p-8 sm:p-12 text-center text-rf-text-muted max-w-lg mx-auto my-8 shadow-subtle">
        <div className="w-12 h-12 rounded-xl bg-rf-card flex items-center justify-center text-slate-500 mx-auto mb-3">
          <Scale className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No properties in comparison tray</h3>
        <p className="text-xs text-rf-text-muted mt-1 leading-relaxed">
          Click the compare balance icon on any listing card in Explore Rentals or Overview to compare them side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rf-border bg-rf-surface/90 shadow-panel overflow-hidden">
      {/* Mobile Horizontal Scroll Hint */}
      <div className="flex sm:hidden items-center justify-between px-4 py-2 border-b border-rf-border bg-rf-bg-primary/95 text-[11px] font-mono text-rf-text-muted">
        <span>← Scroll horizontally to compare →</span>
        <span className="text-teal-400 font-semibold">{listings.length} properties</span>
      </div>

      <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
        <table className="w-full text-left text-xs border-collapse min-w-[640px]">
          <caption className="sr-only">Side by side rental property comparison</caption>
          <thead>
            <tr className="border-b border-rf-border bg-rf-bg-primary/95">
              {/* Sticky Metrics & Specs Column Header */}
              <th
                scope="col"
                className="p-4 font-semibold text-rf-text-secondary uppercase tracking-wider w-44 min-w-[176px] sticky left-0 z-20 bg-rf-bg-primary/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border"
              >
                Metrics & Specs
              </th>

              {/* Market Baseline Reference Column */}
              <th scope="col" className="p-4 bg-teal-950/40 border-r border-teal-900/50 min-w-[220px] w-64">
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase text-teal-400 font-bold text-[11px] whitespace-nowrap">
                    Locality Baseline
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 whitespace-nowrap">
                    Reference
                  </span>
                </div>
                <div className="text-slate-300 font-sans mt-0.5 font-normal whitespace-nowrap">
                  {baseline.locality} ({baseline.bhk ? `${baseline.bhk} BHK` : 'All BHK'})
                </div>
              </th>

              {/* Selected Property Columns */}
              {listings.map((item) => (
                <th scope="col" key={item.id} className="p-4 border-r border-slate-800/80 min-w-[240px] max-w-[280px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white truncate block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.locality}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.title} from comparison`}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 shrink-0"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono">
            {/* Monthly Asking Rent */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Asking Rent
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-teal-300 font-bold tabular-nums whitespace-nowrap">
                {formatCurrency(baseline.medianRent)} <span className="text-[10px] text-teal-500 font-sans">(median)</span>
              </td>
              {listings.map((item) => {
                const diff = (item.rentAmount != null && baseline?.medianRent != null)
                  ? item.rentAmount - baseline.medianRent
                  : null;
                return (
                  <td key={item.id} className="p-4 border-r border-slate-800/80 whitespace-nowrap">
                    <div className="font-bold text-white text-sm tabular-nums">
                      {formatCurrency(item.rentAmount)}
                    </div>
                    {diff != null && (
                      <div
                        className={`text-[11px] font-sans flex items-center gap-1 mt-0.5 whitespace-nowrap ${
                          diff > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {diff > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="tabular-nums">+{formatCurrency(diff)} above median</span>
                          </>
                        ) : diff < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="tabular-nums">-{formatCurrency(Math.abs(diff))} below median</span>
                          </>
                        ) : (
                          <span>At exact median baseline</span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Fairness Score & Category */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Fairness Verdict
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-teal-400 font-sans whitespace-nowrap">
                Locality Benchmark Baseline
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 whitespace-nowrap">
                  <FairnessBadge
                    category={item.fairnessCategory}
                    variancePercentage={item.variancePercentage}
                    fairnessScore={item.fairnessScore}
                    size="sm"
                  />
                </td>
              ))}
            </tr>

            {/* Rate Per Sqft */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Rate / sq.ft
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-slate-200 tabular-nums whitespace-nowrap">
                {formatPricePerSqft(baseline.medianPricePerSqft)}
              </td>
              {listings.map((item) => {
                const isRentAvailable = item.rentAmount != null && !isNaN(item.rentAmount) && item.rentAmount > 0;
                const isAreaAvailable = item.carpetAreaSqft != null && !isNaN(item.carpetAreaSqft) && item.carpetAreaSqft > 0;
                return (
                  <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-200 tabular-nums whitespace-nowrap">
                    {isRentAvailable ? (isAreaAvailable ? formatPricePerSqft(item.pricePerSqft) : '₹/sqft unavailable') : '—'}
                  </td>
                );
              })}
            </tr>

            {/* Carpet Area */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Carpet Area
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-slate-400 font-sans whitespace-nowrap">
                Varies by unit
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-200 tabular-nums whitespace-nowrap">
                  {formatArea(item.carpetAreaSqft)}
                </td>
              ))}
            </tr>

            {/* Configuration */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Configuration
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-teal-300 whitespace-nowrap">
                {baseline.bhk ? `${baseline.bhk} BHK` : 'All'}
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-200 whitespace-nowrap">
                  {item.bhk != null ? `${item.bhk} BHK` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Furnishing */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Furnishing
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-slate-400 font-sans whitespace-nowrap">
                Market Distribution
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-200 uppercase text-[10px] whitespace-nowrap">
                  {item.furnishing ? item.furnishing.replace(/_/g, ' ') : 'Unspecified'}
                </td>
              ))}
            </tr>

            {/* Security Deposit */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Deposit
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-slate-400 font-sans whitespace-nowrap">
                Typically 2-6 months
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-200 tabular-nums whitespace-nowrap">
                  {formatCurrency(item.depositAmount)}
                </td>
              ))}
            </tr>

            {/* Source Platform */}
            <tr className="hover:bg-slate-850/40 transition-colors group">
              <th
                scope="row"
                className="p-4 text-slate-300 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850"
              >
                Source Platform
              </th>
              <td className="p-4 bg-teal-950/20 border-r border-teal-900/30 text-slate-400 font-sans whitespace-nowrap">
                Live SerpApi Aggregation
              </td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{item.sourcePlatform || 'Search Portal'}</span>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                        title="View original listing"
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Inspect Action */}
            <tr className="bg-slate-950/40 group">
              <th
                scope="row"
                className="p-4 text-slate-400 font-sans font-medium w-44 min-w-[176px] sticky left-0 z-10 bg-slate-950/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap"
              >
                Deep Dive
              </th>
              <td className="p-4 bg-teal-950/30 border-r border-teal-900/40"></td>
              {listings.map((item) => (
                <td key={item.id} className="p-4 border-r border-slate-800/80 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onInspect(item)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Inspect Analysis</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
