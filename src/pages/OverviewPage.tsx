import React, { useRef } from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { SearchPanel } from '../components/search/SearchPanel';
import { PipelineBanner } from '../components/common/PipelineBanner';
import { StatCard } from '../components/common/StatCard';
import { PriceDistributionChart } from '../components/common/PriceDistributionChart';
import { RentalCard } from '../components/listings/RentalCard';
import { ListingModal } from '../components/listings/ListingModal';
import { LoadingPipeline } from '../components/common/LoadingPipeline';
import { EmptyState } from '../components/common/EmptyState';
import { RentalListing, MarketBaseline, SearchFilterParams } from '../types/rental';
import { formatCurrency, formatPricePerSqft } from '../utils/formatters';
import {
  Layers,
  IndianRupee,
  Scale,
  ArrowRight,
  Building,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { NavTab } from '../components/layout/Navbar';

interface OverviewPageProps {
  listings: RentalListing[];
  baseline: MarketBaseline;
  onSearch: (params: SearchFilterParams) => void;
  isSearching: boolean;
  onInspect: (listing: RentalListing) => void;
  selectedListing: RentalListing | null;
  onCloseInspect: () => void;
  onToggleCompare: (listing: RentalListing) => void;
  compareListings: RentalListing[];
  onToggleSave: (listing: RentalListing) => void;
  savedIds: string[];
  onNavigateTab: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  listings,
  baseline,
  onSearch,
  isSearching,
  onInspect,
  selectedListing,
  onCloseInspect,
  onToggleCompare,
  compareListings,
  onToggleSave,
  savedIds,
  onNavigateTab,
}) => {
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeClick = () => {
    onNavigateTab('explore');
  };

  const handleExploreExampleClick = () => {
    onSearch({
      location: 'Whitefield, Bangalore',
      bhk: '2',
      propertyType: 'GATED_COMMUNITY',
      maxRent: 75000,
      furnishing: 'all',
      sortBy: 'fairness',
    });
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const comparedIds = compareListings.map((c) => c.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Hero Section */}
      <HeroSection
        onAnalyzeClick={handleAnalyzeClick}
        onCompareMarketsClick={() => onNavigateTab('market-compare')}
        onExploreExampleClick={handleExploreExampleClick}
        baseline={baseline}
      />

      {/* Search Interface Panel */}
      <div ref={searchSectionRef} className="pt-6 pb-8 sm:pt-8 sm:pb-10 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" aria-hidden="true"></span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Rental Market Search
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Target Locality: <strong className="text-slate-200">{baseline.locality}</strong>
          </span>
        </div>

        <SearchPanel
          onSearch={onSearch}
          isSearching={isSearching}
          initialParams={{
            location: `${baseline.locality}, ${baseline.city || 'Bangalore'}`,
            bhk: baseline.bhk ? String(baseline.bhk) : 'all',
          }}
        />
      </div>

      {/* Loading Pipeline State when live query is in-flight */}
      {isSearching && (
        <LoadingPipeline
          location={baseline.locality}
          isSimulated={false}
        />
      )}

      {/* Data Transparency Banner */}
      <PipelineBanner isPrototype={baseline.isPrototypeBaseline} />

      {/* Dashboard Statistical Baseline */}
      <section className="mb-12" aria-labelledby="baseline-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="baseline-heading" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
                Locality Market Baseline — {baseline.locality} ({baseline.bhk ? `${baseline.bhk} BHK` : 'All Configurations'})
              </h3>
              {/* Market Baseline Status (Section 10 Specification) */}
              {(baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) >= 5 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium font-sans">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Sufficient live data</span>
                </span>
              ) : (baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 font-medium font-sans">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Limited sample</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-[11px] text-rose-300 font-medium font-sans">
                  <X className="w-3 h-3 text-rose-400 shrink-0" aria-hidden="true" />
                  <span>Insufficient live data</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
              <span>Source: <strong className="text-slate-300">{baseline.sourceListingCount ?? baseline.sampleSize}</strong> listings</span>
              <span className="text-slate-600" aria-hidden="true">•</span>
              <span>Valid Priced: <strong className="text-slate-300">{baseline.validPricedListingCount ?? baseline.sampleSize}</strong></span>
              <span className="text-slate-600" aria-hidden="true">•</span>
              <span>With Usable Area: <strong className="text-slate-300">{baseline.listingsWithAreaCount ?? 0}</strong></span>
              <span className="text-slate-600" aria-hidden="true">•</span>
              <span>Sample: <strong className="text-slate-300">n={baseline.statisticalSampleSize ?? baseline.sampleSize}</strong></span>
              {baseline.generatedAt && (
                <>
                  <span className="text-slate-600" aria-hidden="true">•</span>
                  <span>Generated: <strong className="text-slate-300">{(() => {
                    try {
                      const d = new Date(baseline.generatedAt);
                      return isNaN(d.getTime()) ? baseline.generatedAt : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch {
                      return baseline.generatedAt;
                    }
                  })()}</strong></span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('insights')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
          >
            <span>View Methodology & IQR Formula</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Core Analytical SaaS Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Live Search Results"
            value={listings.length.toString()}
            secondaryValue={`of ${baseline.sourceListingCount ?? listings.length} indexed`}
            description={`${listings.filter(l => l.carpetAreaSqft != null && l.carpetAreaSqft > 0).length} with usable area for parity`}
            icon={Layers}
            badgeText={baseline.isPrototypeBaseline ? 'Prototype' : (listings.length > 0 ? 'Live Search' : undefined)}
            trend={{ direction: 'neutral', text: `Locality: ${baseline.locality}` }}
          />

          <StatCard
            title="Valid Priced Listings"
            value={(baseline.validPricedListingCount ?? listings.filter(l => l.rentAmount != null && l.rentAmount > 0).length).toString()}
            secondaryValue={listings.length > 0 ? `${Math.round(((baseline.validPricedListingCount ?? listings.filter(l => l.rentAmount != null && l.rentAmount > 0).length) / listings.length) * 100)}% priced` : undefined}
            description="Explicitly listed monthly rental rates"
            icon={IndianRupee}
            badgeText={baseline.isPrototypeBaseline ? 'Prototype' : (baseline.sampleSize > 0 ? 'Priced' : undefined)}
            trend={{ direction: 'neutral', text: baseline.averageRent ? `Mean: ${formatCurrency(baseline.averageRent)}` : 'Sample pending' }}
          />

          <StatCard
            title="Comparable Listings"
            value={(baseline.statisticalSampleSize ?? baseline.sampleSize).toString()}
            secondaryValue={`n=${baseline.statisticalSampleSize ?? baseline.sampleSize}`}
            description="Normalized units in benchmark pool"
            icon={Scale}
            badgeText={baseline.isPrototypeBaseline ? 'Prototype' : (baseline.sampleSize > 0 ? 'Benchmark Pool' : undefined)}
            trend={{ direction: 'neutral', text: 'Tukey IQR filtered' }}
          />

          <StatCard
            title="Localities Analyzed"
            value="1 Locality"
            secondaryValue={baseline.locality}
            description="Active locality benchmark scope"
            icon={Building}
            badgeText={baseline.locality}
            trend={{ direction: 'neutral', text: baseline.bhk ? `${baseline.bhk} BHK Target` : 'All BHKs' }}
          />
        </div>

        {/* MARKET INTELLIGENCE Asymmetric Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-rf-teal" aria-hidden="true" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rf-text-primary font-mono">
              Market Intelligence & Price Spread
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Price Distribution Visualization */}
            <div className="lg:col-span-8">
              <PriceDistributionChart baseline={baseline} />
            </div>

            {/* Right: Market Snapshot Card */}
            <div className="lg:col-span-4 rounded-xl bg-rf-surface border border-rf-border p-5 shadow-panel space-y-4">
              <div className="flex items-center justify-between border-b border-rf-border pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Building className="w-4 h-4 text-rf-teal shrink-0" aria-hidden="true" />
                  <h4 className="text-sm font-bold text-rf-text-primary font-mono truncate">
                    {baseline.locality}
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-950/80 text-rf-teal border border-teal-800 font-semibold shrink-0">
                  Market Snapshot
                </span>
              </div>

              {/* Market Baseline Status (Section 10 Specification) */}
              {(baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) >= 5 ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300 font-medium font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Sufficient live data</span>
                </div>
              ) : (baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 flex flex-col gap-0.5 text-xs text-amber-300 font-medium font-sans">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>Limited sample</span>
                  </div>
                  <span className="text-[11px] text-amber-400/90 font-normal">
                    Based on {baseline.validPricedListingCount ?? baseline.sampleSize} valid priced listings
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/40 flex items-center gap-2 text-xs text-rose-300 font-medium font-sans">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                  <span>Insufficient live data</span>
                </div>
              )}

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                  <span className="text-rf-text-muted">Median Rent</span>
                  <span className="text-base font-bold text-rf-text-primary tabular-nums">
                    {baseline.medianRent ? formatCurrency(baseline.medianRent) : 'Unassessed'}
                    {baseline.medianRent && <span className="text-[10px] text-rf-text-muted font-sans font-normal ml-0.5">/mo</span>}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                  <span className="text-rf-text-muted">Median Rate</span>
                  <span className="text-base font-bold text-rf-teal-bright tabular-nums">
                    {baseline.medianPricePerSqft ? formatPricePerSqft(baseline.medianPricePerSqft) : '₹/sqft unavailable'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                  <span className="text-rf-text-muted">Sample Size</span>
                  <span className="text-sm font-semibold text-rf-text-secondary">
                    n={baseline.statisticalSampleSize ?? baseline.sampleSize} units
                  </span>
                </div>

                {/* Quartiles */}
                <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-rf-text-muted">
                    <span>Quartile Distribution</span>
                    <span>Tukey IQR</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center pt-1">
                    <div className="p-1.5 rounded bg-rf-surface border border-rf-border">
                      <span className="text-[9px] text-rf-text-muted block">Q1</span>
                      <span className="font-bold text-rf-text-primary text-[10px] truncate block">
                        {baseline.rentIqr?.q1 ? formatCurrency(baseline.rentIqr.q1) : '—'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-rf-surface border border-teal-800/80">
                      <span className="text-[9px] text-rf-teal block">Median</span>
                      <span className="font-bold text-rf-teal-bright text-[10px] truncate block">
                        {baseline.medianRent ? formatCurrency(baseline.medianRent) : '—'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-rf-surface border border-rf-border">
                      <span className="text-[9px] text-rf-text-muted block">Q3</span>
                      <span className="font-bold text-rf-text-primary text-[10px] truncate block">
                        {baseline.rentIqr?.q3 ? formatCurrency(baseline.rentIqr.q3) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('explore')}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rf-surface-elevated hover:bg-rf-surface hover:text-rf-teal text-rf-text-secondary text-xs font-semibold border border-rf-border transition-colors"
                >
                  <span>Explore All Listings in {baseline.locality}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rental Listing Cards */}
      <section className="mb-14" aria-labelledby="featured-listings-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" aria-hidden="true"></span>
              <h3 id="featured-listings-heading" className="text-base font-bold text-white tracking-tight">
                Analyzed Rental Listings in {baseline.locality}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current listings evaluated against the local market baseline.
            </p>
          </div>

          {listings.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('explore')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-teal-300 border border-slate-750 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <span>Explore All {listings.length} Listings</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Cards Grid or Empty State */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.slice(0, 6).map((item) => (
              <RentalCard
                key={item.id}
                listing={item}
                onInspect={onInspect}
                onToggleCompare={onToggleCompare}
                isCompared={comparedIds.includes(item.id)}
                onToggleSave={onToggleSave}
                isSaved={savedIds.includes(item.id)}
              />
            ))}
          </div>
        ) : !isSearching ? (
          <EmptyState
            title="— No live search results found"
            reason={`Our search engine did not find active listings in "${baseline.locality}" matching the current filter parameters.`}
            suggestion="Try selecting 'All BHK', increasing the rent ceiling, or searching an adjacent area like Whitefield, HSR Layout, or Koramangala."
            onReset={handleExploreExampleClick}
            resetLabel="Load Whitefield Example"
          />
        ) : null}
      </section>

      {/* Inspection Modal */}
      <ListingModal
        listing={selectedListing}
        baseline={baseline}
        onClose={onCloseInspect}
        onToggleCompare={onToggleCompare}
        isCompared={selectedListing ? comparedIds.includes(selectedListing.id) : false}
        onToggleSave={onToggleSave}
        isSaved={selectedListing ? savedIds.includes(selectedListing.id) : false}
      />
    </div>
  );
};
