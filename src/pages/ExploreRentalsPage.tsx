import React, { useState } from 'react';
import { RentalListing, MarketBaseline, SearchFilterParams } from '../types/rental';
import { RentalCard } from '../components/listings/RentalCard';
import { ListingModal } from '../components/listings/ListingModal';
import { SearchPanel } from '../components/search/SearchPanel';
import { PipelineBanner } from '../components/common/PipelineBanner';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Navbar';
import {
  Compass,
  ArrowUpDown,
  Filter,
  Building,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency, formatPricePerSqft, isValidRent } from '../utils/formatters';

interface ExploreRentalsPageProps {
  listings: RentalListing[];
  baseline: MarketBaseline;
  onSearch: (params: SearchFilterParams) => void;
  isSearching?: boolean;
  onInspect: (listing: RentalListing) => void;
  selectedListing: RentalListing | null;
  onCloseInspect: () => void;
  onToggleCompare: (listing: RentalListing) => void;
  compareListings: RentalListing[];
  onToggleSave: (listing: RentalListing) => void;
  savedIds: string[];
  onNavigateTab: (tab: NavTab) => void;
  currentParams: SearchFilterParams;
}

export const ExploreRentalsPage: React.FC<ExploreRentalsPageProps> = ({
  listings,
  baseline,
  onSearch,
  isSearching = false,
  onInspect,
  selectedListing,
  onCloseInspect,
  onToggleCompare,
  compareListings,
  onToggleSave,
  savedIds,
  onNavigateTab,
  currentParams,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SearchFilterParams['sortBy']>(currentParams.sortBy || 'fairness');

  const handleSortChange = (newSort: SearchFilterParams['sortBy']) => {
    setSortBy(newSort);
    onSearch({
      ...currentParams,
      sortBy: newSort,
    });
  };

  const filteredListings = listings.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'NEAR_TYPICAL') {
      return item.fairnessCategory === 'FAIR';
    }
    if (activeCategoryFilter === 'BELOW_TYPICAL') {
      return item.fairnessCategory === 'BELOW_TYPICAL' ||
             item.fairnessCategory === 'SIGNIFICANTLY_BELOW_TYPICAL' ||
             item.fairnessCategory === 'HIGHLY_COMPETITIVE';
    }
    if (activeCategoryFilter === 'ABOVE_TYPICAL') {
      return item.fairnessCategory === 'ABOVE_TYPICAL' || 
             item.fairnessCategory === 'SLIGHTLY_HIGH' || 
             item.fairnessCategory === 'OVERPRICED';
    }
    if (activeCategoryFilter === 'OUTLIER') {
      return item.isStatisticalOutlier === true || 
             item.fairnessCategory === 'SIGNIFICANTLY_ABOVE_TYPICAL' || 
             item.fairnessCategory === 'SIGNIFICANTLY_BELOW_TYPICAL' || 
             item.fairnessCategory === 'EXTREME_OUTLIER';
    }
    return true;
  });

  const comparedIds = compareListings.map((c) => c.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Explore Rental Listings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing live rental search results in <strong className="text-slate-200">{currentParams.location || baseline.locality || 'Target Locality'}</strong> against empirical market benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PipelineBanner isPrototype={baseline.isPrototypeBaseline} compact />
        </div>
      </div>

      {/* Prominent Real-Estate Search & Filter Panel */}
      <div className="mb-6">
        <SearchPanel
          onSearch={onSearch}
          initialParams={currentParams}
          isSearching={isSearching}
        />
      </div>

      {/* 2-Column Analytical Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg): Filter Controls + Rental Listing Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Live Results Bar & Neutral Category Filters */}
          <div className="rounded-2xl bg-rf-surface border border-rf-border p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Fairness quick category filter chips */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Fairness category filters">
              <span className="text-xs font-semibold text-rf-text-primary mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-rf-teal" aria-hidden="true" />
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal ${
                  activeCategoryFilter === 'all'
                    ? 'bg-rf-surface-elevated text-rf-text-primary border border-rf-border font-semibold shadow-sm'
                    : 'text-rf-text-muted hover:text-rf-text-primary hover:bg-rf-surface-elevated/50'
                }`}
              >
                Relevant Rental Results ({listings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('NEAR_TYPICAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  activeCategoryFilter === 'NEAR_TYPICAL'
                    ? 'bg-sky-950 text-sky-300 border border-sky-800 font-semibold shadow-sm'
                    : 'text-rf-text-muted hover:text-sky-300 hover:bg-rf-surface-elevated/50'
                }`}
              >
                Near Typical
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('BELOW_TYPICAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                  activeCategoryFilter === 'BELOW_TYPICAL'
                    ? 'bg-teal-950 text-teal-300 border border-teal-800 font-semibold shadow-sm'
                    : 'text-rf-text-muted hover:text-teal-300 hover:bg-rf-surface-elevated/50'
                }`}
              >
                Below Typical
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('ABOVE_TYPICAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  activeCategoryFilter === 'ABOVE_TYPICAL'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 font-semibold shadow-sm'
                    : 'text-rf-text-muted hover:text-amber-300 hover:bg-rf-surface-elevated/50'
                }`}
              >
                Above Typical
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('OUTLIER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  activeCategoryFilter === 'OUTLIER'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold shadow-sm'
                    : 'text-rf-text-muted hover:text-amber-300 hover:bg-rf-surface-elevated/50'
                }`}
              >
                Outliers
              </button>
            </div>

            {/* Sort dropdown selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="explore-sort-select" className="text-xs font-medium text-slate-400 flex items-center gap-1 font-mono">
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                Sort:
              </label>
              <div className="relative">
                <select
                  id="explore-sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SearchFilterParams['sortBy'])}
                  className="rounded-xl bg-slate-950 border border-slate-700/80 pl-3 pr-8 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-sans transition-colors appearance-none cursor-pointer shadow-inner"
                >
                  <option value="fairness" className="bg-slate-900 text-slate-100">Highest Fairness Score</option>
                  <option value="price_low" className="bg-slate-900 text-slate-100">Price: Low to High</option>
                  <option value="price_high" className="bg-slate-900 text-slate-100">Price: High to Low</option>
                  <option value="area_desc" className="bg-slate-900 text-slate-100">Carpet Area: Largest First</option>
                  <option value="variance_asc" className="bg-slate-900 text-slate-100">Lowest Variance (Below Median)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Status indicators: Search completion & Data availability */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {!isSearching && listings.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 font-medium font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Search completed</span>
                </span>
              )}
              {listings.some(l => l.carpetAreaSqft == null || l.carpetAreaSqft <= 0) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 font-medium font-sans" title="Some listings do not specify carpet area in their source data">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Some information is unavailable</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-sans">
              Showing <strong className="text-slate-200">{filteredListings.length}</strong> of {listings.length} relevant rental listings
            </span>
          </div>

          {/* Listings Grid or Empty State */}
          {filteredListings.length === 0 ? (
            listings.length === 0 ? (
              <EmptyState
                title="No relevant rental listings found"
                reason={`Live search results were returned for "${currentParams.location || 'this locality'}", but none met RentFair's rental-property relevance criteria.`}
                suggestion="Try searching for a specific locality with bedroom configuration (e.g. '2 BHK flat for rent in Whitefield')."
                onReset={() => onNavigateTab('overview')}
                resetLabel="Start New Search"
                onSecondaryAction={() => onNavigateTab('overview')}
                secondaryActionLabel="New Search Query"
              />
            ) : (
              <EmptyState
                title="— No matching listings in this category"
                reason={`There are currently no listings in "${currentParams.location || 'this locality'}" matching the "${activeCategoryFilter}" fairness filter.`}
                suggestion="Select 'Relevant Rental Results' to see all scanned units or adjust your query in the Overview tab."
                onReset={() => setActiveCategoryFilter('all')}
                resetLabel="Clear Fairness Filter"
                onSecondaryAction={() => onNavigateTab('overview')}
                secondaryActionLabel="New Search Query"
              />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredListings.map((item) => (
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
          )}
        </div>

        {/* Right Column (4 cols on lg): Sticky Market Snapshot Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="rounded-2xl bg-rf-surface border border-rf-border p-5 shadow-panel">
            <div className="flex items-center justify-between border-b border-rf-border pb-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="w-4 h-4 text-rf-teal shrink-0" aria-hidden="true" />
                <h2 className="text-sm font-bold text-rf-text-primary font-mono truncate">
                  {baseline.locality}
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-950/80 text-rf-teal border border-teal-800 shrink-0 font-semibold">
                Market Snapshot
              </span>
            </div>

            {/* Market Baseline Status (Section 10 Specification) */}
            <div className="mb-3.5">
              {(baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) >= 5 ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300 font-medium font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Sufficient live data</span>
                </div>
              ) : (baseline.validPricedListingCount ?? baseline.sampleSize ?? 0) > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 flex flex-col gap-1 text-xs text-amber-300 font-medium font-sans">
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
            </div>

            {/* Baseline metrics */}
            <div className="space-y-2.5 font-sans text-xs">
              <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                <span className="text-slate-400">Market Median</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {isValidRent(baseline.medianRent) ? (
                    <>
                      {formatCurrency(baseline.medianRent)}
                      <span className="text-xs text-slate-400 font-normal ml-0.5">/mo</span>
                    </>
                  ) : 'Unassessed'}
                </span>
              </div>

              {baseline.rentIqr && baseline.rentIqr.q1 != null && baseline.rentIqr.q3 != null && (
                <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                  <span className="text-slate-400">Typical Range</span>
                  <span className="text-xs font-semibold text-slate-200 tabular-nums">
                    {formatCurrency(baseline.rentIqr.q1)} – {formatCurrency(baseline.rentIqr.q3)}
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                <span className="text-slate-400">Valid Priced Listings</span>
                <span className="text-xs font-semibold text-slate-200 tabular-nums">
                  {baseline.validPricedListingCount ?? baseline.sampleSize}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                <span className="text-slate-400">Listings with Usable Area</span>
                <span className="text-xs font-semibold text-slate-200 tabular-nums">
                  {baseline.listingsWithAreaCount ?? listings.filter(l => l.carpetAreaSqft != null && l.carpetAreaSqft > 0).length}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between">
                <span className="text-slate-400">Median Rate / sq.ft</span>
                <span className="text-xs font-semibold text-teal-300 tabular-nums">
                  {baseline.medianPricePerSqft ? formatPricePerSqft(baseline.medianPricePerSqft) : '₹/sqft unavailable'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rf-bg-primary/80 border border-rf-border flex items-center justify-between text-slate-400 text-[11px]">
                <span>Retrieved</span>
                <span className="text-slate-300">
                  {baseline.generatedAt ? (() => {
                    try {
                      const d = new Date(baseline.generatedAt);
                      return isNaN(d.getTime()) ? 'Live Search' : `Today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    } catch {
                      return 'Live Search';
                    }
                  })() : 'Live Search Result'}
                </span>
              </div>
            </div>

            {/* Quick Action Button to Market Compare */}
            <div className="mt-4 pt-3 border-t border-rf-border">
              <button
                type="button"
                onClick={() => onNavigateTab('market-compare')}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rf-surface-elevated hover:bg-rf-surface hover:text-rf-teal text-rf-text-secondary text-xs font-semibold border border-rf-border transition-colors"
              >
                <span>Compare Against Other Localities</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inspector */}
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
