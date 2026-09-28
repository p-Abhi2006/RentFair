import React from 'react';
import {
  ArrowRight,
  MapPin,
  TrendingDown,
  Building2,
  Search,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { MarketBaseline } from '../../types/rental';
import { MarketPositionScale } from '../common/MarketPositionScale';

interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onExploreExampleClick?: () => void;
  onCompareMarketsClick?: () => void;
  baseline?: MarketBaseline;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeClick,
  onExploreExampleClick,
  onCompareMarketsClick,
  baseline,
}) => {
  const displayLocality = baseline?.locality || 'Whitefield';
  const displayPricedCount = baseline?.validPricedListingCount ?? baseline?.sampleSize ?? 7;

  const handleSecondaryAction = () => {
    if (onCompareMarketsClick) {
      onCompareMarketsClick();
    } else if (onExploreExampleClick) {
      onExploreExampleClick();
    }
  };

  return (
    <div className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20 overflow-hidden font-sans">
      {/* Subtle atmospheric background depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-teal-500/10 via-sky-500/5 to-transparent blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(#24324A_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none -z-10" />

      {/* Asymmetric Editorial Hero Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* LEFT COLUMN: Editorial Typography & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold text-teal-300 tracking-wide">
              Rental Price Intelligence
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-full">
            Know where your rent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400">
              stands.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            Compare rental prices with live market evidence before you decide.
          </p>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-3.5">
            <button
              type="button"
              onClick={onAnalyzeClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 active:bg-teal-500 text-slate-950 font-bold text-sm transition-all shadow-subtle hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <span>Explore Rentals</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleSecondaryAction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <Scale className="w-4 h-4 text-teal-400" aria-hidden="true" />
              <span>Compare Markets</span>
            </button>
          </div>

          {/* Reassuring Proof Points */}
          <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              <span>Tukey IQR anomaly detection</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span>0–100 deterministic benchmark</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>Zero subjective assertions</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Large Premium Property Visual with Intelligence Overlay */}
        <div className="lg:col-span-5 relative">
          {/* Subtle glow behind preview */}
          <div className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-3xl -z-10" />

          {/* Main Floating Intelligence Card */}
          <div className="rounded-2xl bg-rf-surface border border-rf-border shadow-panel overflow-hidden transition-all hover:border-slate-700 relative">
            {/* Top architectural property preview banner */}
            <div className="relative h-44 w-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 overflow-hidden border-b border-rf-border">
              {/* Fine architectural backdrop drafting lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:20px_20px]" />
              <svg
                className="w-full h-full absolute inset-0 opacity-25 text-teal-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 140"
                preserveAspectRatio="xMidYMid slice"
              >
                <line x1="10" y1="130" x2="310" y2="130" stroke="currentColor" strokeWidth="1.5" />
                <rect x="40" y="30" width="80" height="100" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <rect x="140" y="15" width="120" height="115" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <rect x="55" y="45" width="20" height="25" fill="currentColor" fillOpacity="0.25" />
                <rect x="85" y="45" width="20" height="25" fill="currentColor" fillOpacity="0.25" />
                <rect x="55" y="85" width="20" height="25" fill="currentColor" fillOpacity="0.25" />
                <rect x="85" y="85" width="20" height="25" fill="currentColor" fillOpacity="0.25" />
                <rect x="160" y="35" width="30" height="30" fill="currentColor" fillOpacity="0.25" />
                <rect x="210" y="35" width="30" height="30" fill="currentColor" fillOpacity="0.25" />
                <rect x="160" y="80" width="30" height="30" fill="currentColor" fillOpacity="0.25" />
                <rect x="210" y="80" width="30" height="30" fill="currentColor" fillOpacity="0.25" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-rf-surface via-transparent to-black/40" />

              {/* Tag / Locality Badge over image */}
              <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 flex items-center justify-between gap-1.5 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-medium text-white shadow-sm truncate max-w-[45%]">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">Whitefield</span>
                </div>

                {/* Product Preview Label */}
                <div className="pointer-events-auto px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-900/90 border border-teal-500/40 text-teal-300 flex items-center gap-1.5 shadow-sm shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" aria-hidden="true" />
                  <span className="sm:hidden">Preview</span>
                  <span className="hidden sm:inline">Illustrative Intelligence Preview</span>
                </div>
              </div>

              {/* Property specs headline over image bottom */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                <span className="text-white font-medium">
                  2 BHK Apartment · 1,150 sq.ft
                </span>
                <span className="text-teal-300 text-xs font-medium">
                  Gated Society
                </span>
              </div>
            </div>

            {/* Card Body: Rental Intelligence Preview */}
            <div className="p-5 space-y-4">
              {/* Rent & Fairness Score Row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
                    Asking Rent
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
                      ₹32,000
                    </span>
                    <span className="text-sm font-normal text-slate-400">/month</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-teal-300 font-medium">
                    <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
                    <span>14.3% Below Typical</span>
                  </div>
                </div>

                {/* Integrated Compact Intelligent Fairness Gauge Module */}
                <div className="flex flex-col items-end">
                  <div className="px-3.5 py-2 rounded-xl bg-teal-950/80 border border-teal-800 text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xl font-bold text-white tabular-nums">71</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <span className="text-xs font-semibold text-teal-300 block mt-0.5">
                      Below Typical
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Market Position Visualization */}
              <div className="pt-2 border-t border-rf-border/80">
                <MarketPositionScale
                  variancePercentage={-14.3}
                  compact={true}
                />
              </div>

              {/* Context Footer */}
              <div className="pt-2 border-t border-rf-border/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{displayLocality} · 2 BHK</span>
                <span className="text-slate-400">Based on {displayPricedCount} valid priced listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RentFair Intelligence Architecture Section */}
      <div id="architecture-section" className="mt-14 sm:mt-16 pt-10 border-t border-rf-border">
        <div className="text-xs uppercase tracking-widest text-slate-400 mb-6 font-semibold text-center sm:text-left">
          RentFair Intelligence Architecture
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Step 1: Search */}
          <div className="p-4 rounded-xl bg-rf-surface border border-rf-border hover:border-teal-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center text-xs font-bold border border-rf-border">
                01
              </span>
              <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Search Listings</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ingest live rental listings across real estate portals via live SerpApi integration.
            </p>
          </div>

          {/* Step 2: Extract & Normalize */}
          <div className="p-4 rounded-xl bg-rf-surface border border-rf-border hover:border-teal-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center text-xs font-bold border border-rf-border">
                02
              </span>
              <Building2 className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Normalize Attributes</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Standardize carpet sq.ft, configuration, furnishing tiers, and security deposits.
            </p>
          </div>

          {/* Step 3: Statistical Baseline */}
          <div className="p-4 rounded-xl bg-rf-surface border border-rf-border hover:border-teal-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center text-xs font-bold border border-rf-border">
                03
              </span>
              <Scale className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Market Baseline</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Calculate robust 50th percentile medians and Tukey interquartile range (IQR) corridors.
            </p>
          </div>

          {/* Step 4: Transparent Benchmark */}
          <div className="p-4 rounded-xl bg-rf-surface border border-rf-border hover:border-teal-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center text-xs font-bold border border-rf-border">
                04
              </span>
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Fairness Intelligence</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Expose empirical market position (0–100) and outlier flags without subjective bias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
