import React from 'react';
import { RentalListing, MarketBaseline } from '../types/rental';
import { ComparisonTable } from '../components/compare/ComparisonTable';
import { ListingModal } from '../components/listings/ListingModal';
import { PipelineBanner } from '../components/common/PipelineBanner';
import { NavTab } from '../components/layout/Navbar';
import {
  Scale,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface ComparePageProps {
  compareListings: RentalListing[];
  allListings: RentalListing[];
  baseline: MarketBaseline;
  onRemoveFromCompare: (id: string) => void;
  onAddToCompare: (listing: RentalListing) => void;
  onClearCompare: () => void;
  onInspect: (listing: RentalListing) => void;
  selectedListing: RentalListing | null;
  onCloseInspect: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onToggleSave: (listing: RentalListing) => void;
  savedIds: string[];
}

export const ComparePage: React.FC<ComparePageProps> = ({
  compareListings,
  allListings,
  baseline,
  onRemoveFromCompare,
  onAddToCompare,
  onClearCompare,
  onInspect,
  selectedListing,
  onCloseInspect,
  onNavigateTab,
  onToggleSave,
  savedIds,
}) => {
  const availableToAdd = allListings.filter(
    (item) => !compareListings.some((c) => c.id === item.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Side-by-Side Rental Comparator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate rental asking prices side-by-side against the normalized <strong className="text-slate-200">{baseline.locality}</strong> statistical baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('explore')}
            className="px-3.5 py-2 rounded-xl bg-rf-surface hover:bg-rf-card text-teal-300 text-xs font-semibold border border-rf-border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>Explore Listings</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {compareListings.length > 0 && (
            <button
              type="button"
              onClick={onClearCompare}
              className="px-3.5 py-2 rounded-xl bg-rf-surface hover:bg-rf-card text-rf-text-muted hover:text-rose-400 text-xs font-medium border border-rf-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Clear Comparison
            </button>
          )}
          <PipelineBanner compact />
        </div>
      </div>

      {/* Quick Add Selector if fewer than 4 properties in compare */}
      {availableToAdd.length > 0 && compareListings.length < 4 && (
        <div className="mb-6 p-4 rounded-2xl bg-rf-surface/90 border border-rf-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Plus className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Add another listing to this comparison:</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="compare-add-select" className="sr-only">
              Select property to add to comparison
            </label>
            <div className="relative">
              <select
                id="compare-add-select"
                onChange={(e) => {
                  const target = availableToAdd.find((a) => a.id === e.target.value);
                  if (target) onAddToCompare(target);
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full sm:w-auto rounded-xl bg-slate-950 border border-slate-700/80 pl-3.5 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 appearance-none cursor-pointer transition-colors shadow-inner"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select property to add...</option>
                {availableToAdd.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                    {opt.title} — {opt.rentAmount != null ? `₹${opt.rentAmount.toLocaleString('en-IN')}/mo` : 'Price on request'} ({opt.bhk != null ? `${opt.bhk} BHK` : 'BHK N/A'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {/* Main Comparison Table */}
      <div className="mb-8">
        <ComparisonTable
          listings={compareListings}
          baseline={baseline}
          onRemove={onRemoveFromCompare}
          onInspect={onInspect}
        />
      </div>

      {/* Analytical Comparator Takeaways */}
      {compareListings.length > 0 && (
        <div className="rounded-2xl bg-rf-surface/90 border border-rf-border p-6 shadow-subtle mb-10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Fairness Comparator Intelligence Summary
            </h3>
          </div>
          <p className="text-xs text-rf-text-muted leading-relaxed max-w-3xl">
            When evaluating multiple properties in <strong className="text-slate-200">{baseline.locality}</strong>, RentFair calculates differences in carpet area and furnishing to determine true value parity. Properties flagged with higher fairness indices indicate lower rate-per-sqft relative to neighborhood cluster medians.
          </p>
        </div>
      )}

      {/* Modal */}
      <ListingModal
        listing={selectedListing}
        baseline={baseline}
        onClose={onCloseInspect}
        onToggleCompare={() => {}}
        isCompared={true}
        onToggleSave={onToggleSave}
        isSaved={selectedListing ? savedIds.includes(selectedListing.id) : false}
      />
    </div>
  );
};
