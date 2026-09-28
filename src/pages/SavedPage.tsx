import React from 'react';
import { RentalListing, MarketBaseline } from '../types/rental';
import { RentalCard } from '../components/listings/RentalCard';
import { ListingModal } from '../components/listings/ListingModal';
import { EmptyState } from '../components/common/EmptyState';
import { PipelineBanner } from '../components/common/PipelineBanner';
import { NavTab } from '../components/layout/Navbar';
import {
  Bookmark,
  Trash2,
  Compass,
} from 'lucide-react';

interface SavedPageProps {
  savedListings: RentalListing[];
  allListings: RentalListing[];
  baseline: MarketBaseline;
  onToggleSave: (listing: RentalListing) => void;
  onClearSaved: () => void;
  onInspect: (listing: RentalListing) => void;
  selectedListing: RentalListing | null;
  onCloseInspect: () => void;
  onToggleCompare: (listing: RentalListing) => void;
  compareListings: RentalListing[];
  onNavigateTab: (tab: NavTab) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  savedListings,
  baseline,
  onToggleSave,
  onClearSaved,
  onInspect,
  selectedListing,
  onCloseInspect,
  onToggleCompare,
  compareListings,
  onNavigateTab,
}) => {
  const comparedIds = compareListings.map((c) => c.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Saved Rental Watchlist
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track fairness metrics, price revisions, and comparable shifts for your shortlisted properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('explore')}
            className="px-3.5 py-1.5 rounded-xl bg-rf-surface hover:bg-rf-card text-teal-300 text-xs font-semibold border border-rf-border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Browse Rentals</span>
          </button>
          {savedListings.length > 0 && (
            <button
              type="button"
              onClick={onClearSaved}
              className="px-3.5 py-1.5 rounded-xl bg-rf-surface hover:bg-rf-card text-rf-text-muted hover:text-rose-400 text-xs font-medium border border-rf-border transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Watchlist</span>
            </button>
          )}
          <PipelineBanner compact />
        </div>
      </div>

      {/* Watchlist notice banner */}
      <div className="rounded-2xl bg-rf-surface/90 border border-rf-border p-4 mb-8 flex items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/80 shrink-0">
            <Bookmark className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white">
              Local Property Watchlist
            </h2>
            <p className="text-[11px] text-rf-text-muted mt-0.5">
              Saved properties are stored locally in your browser for quick comparison and analysis against current search baselines.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-teal-400 hidden sm:block">
          Storage: Local Browser
        </span>
      </div>

      {/* Content: Cards or Structured Empty State */}
      {savedListings.length === 0 ? (
        <EmptyState
          title="Saved rentals appear here."
          reason="Save properties while exploring to revisit and compare them later."
          suggestion="Browse rentals across active localities and click the bookmark icon on any listing to build your comparison watchlist."
          onReset={() => onNavigateTab('explore')}
          resetLabel="Explore Rentals"
          onSecondaryAction={() => onNavigateTab('overview')}
          secondaryActionLabel="Return to Overview"
          icon={Bookmark}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedListings.map((item) => (
            <RentalCard
              key={item.id}
              listing={item}
              onInspect={onInspect}
              onToggleCompare={onToggleCompare}
              isCompared={comparedIds.includes(item.id)}
              onToggleSave={onToggleSave}
              isSaved={true}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ListingModal
        listing={selectedListing}
        baseline={baseline}
        onClose={onCloseInspect}
        onToggleCompare={onToggleCompare}
        isCompared={selectedListing ? comparedIds.includes(selectedListing.id) : false}
        onToggleSave={onToggleSave}
        isSaved={true}
      />
    </div>
  );
};
