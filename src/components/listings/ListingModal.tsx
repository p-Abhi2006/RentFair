import React, { useEffect } from 'react';
import { RentalListing, MarketBaseline } from '../../types/rental';
import { formatCurrency, formatPricePerSqft, formatArea, isValidRent } from '../../utils/formatters';
import { FairnessScoreGauge } from '../common/FairnessScoreGauge';
import { MarketPositionScale } from '../common/MarketPositionScale';
import { FeedbackWidget } from '../common/FeedbackWidget';
import {
  X,
  MapPin,
  Info,
  Scale,
  Bookmark,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Home,
  Building,
  Check,
  Minus,
} from 'lucide-react';

interface ListingModalProps {
  listing: RentalListing | null;
  baseline: MarketBaseline | null;
  onClose: () => void;
  onToggleCompare?: (listing: RentalListing) => void;
  isCompared?: boolean;
  onToggleSave?: (listing: RentalListing) => void;
  isSaved?: boolean;
}

export const ListingModal: React.FC<ListingModalProps> = ({
  listing,
  baseline,
  onClose,
  onToggleCompare,
  isCompared = false,
  onToggleSave,
  isSaved = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (listing) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [listing, onClose]);

  const [imageError, setImageError] = React.useState(false);

  if (!listing) return null;

  const isRentAvailable = isValidRent(listing.rentAmount);
  const isAreaAvailable = listing.carpetAreaSqft != null && !isNaN(listing.carpetAreaSqft) && listing.carpetAreaSqft > 0;
  const medianRent = baseline?.medianRent ?? null;
  const medianPricePerSqft = baseline?.medianPricePerSqft ?? null;
  const priceDiff = (isRentAvailable && isValidRent(medianRent)) ? listing.rentAmount! - medianRent! : null;
  const isHigher = priceDiff != null && priceDiff > 0;
  const isUnassessed = listing.fairnessCategory == null || !isRentAvailable;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-listing-title"
    >
      {/* Backdrop click handler */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-rf-surface border border-rf-border shadow-2xl p-5 sm:p-7 lg:p-8 z-10 focus:outline-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close property analysis modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-rf-surface-elevated hover:bg-rf-surface text-rf-text-muted hover:text-rf-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal z-20"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* 1. TOP PROPERTY BANNER & HEADER */}
        <div className="relative h-44 -mx-5 sm:-mx-7 lg:-mx-8 -mt-5 sm:-mt-7 lg:-mt-8 mb-6 bg-slate-950 overflow-hidden border-b border-rf-border">
          {listing.imageUrl && !imageError ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-rf-surface-elevated to-slate-950 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38BDF8_1px,transparent_1px),linear-gradient(to_bottom,#38BDF8_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="relative text-center">
                <Building className="w-10 h-10 text-slate-600/70 mx-auto mb-1" />
                <span className="text-xs font-mono text-slate-500">
                  {listing.propertyType ? listing.propertyType.replace(/_/g, ' ') : 'Property Valuation Dossier'}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-rf-surface via-rf-surface/40 to-transparent" />

          {/* Locality badge on image */}
          <div className="absolute bottom-3 left-5 sm:left-7 lg:left-8 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <MapPin className="w-3.5 h-3.5 text-rf-teal" />
              <span>
                {listing.locality}
                {listing.city && listing.city.trim().toLowerCase() !== listing.locality.trim().toLowerCase()
                  ? `, ${listing.city}`
                  : ''}
              </span>
              {listing.subLocality && <span className="text-slate-400">· {listing.subLocality}</span>}
            </span>
            {listing.sourcePlatform && (
              <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase text-slate-300">
                {listing.sourcePlatform}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="pr-10">
          <h2 id="modal-listing-title" className="text-xl sm:text-2xl font-bold text-rf-text-primary leading-snug">
            {listing.title}
          </h2>
        </div>

        {/* 2. PRIMARY HERO FOCUS: ASKING RENT & FAIRNESS SCORE */}
        <div className="mt-6 p-5 rounded-2xl bg-rf-bg-primary/80 border border-rf-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-sans">
          <div className="flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Asking Monthly Rent
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold font-sans text-white tracking-tight tabular-nums">
                {formatCurrency(listing.rentAmount)}
              </span>
              {isRentAvailable && (
                <span className="text-sm text-slate-400 font-sans">/month</span>
              )}
            </div>

            {(isRentAvailable || listing.depositAmount != null) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans">
                {isRentAvailable && (
                  <span className="text-slate-200 font-semibold">
                    {isAreaAvailable ? formatPricePerSqft(listing.pricePerSqft) : '₹/sqft unavailable'}
                  </span>
                )}
                {listing.depositAmount != null && (
                  <>
                    {isRentAvailable && <span className="text-slate-600" aria-hidden="true">•</span>}
                    <span>Security Deposit: {formatCurrency(listing.depositAmount)}</span>
                  </>
                )}
                {isAreaAvailable && (
                  <>
                    <span className="text-slate-600" aria-hidden="true">•</span>
                    <span>Carpet: {formatArea(listing.carpetAreaSqft)}</span>
                  </>
                )}
              </div>
            )}

            {/* Outlier Alert if flagged */}
            {listing.isStatisticalOutlier && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800 text-xs text-amber-300 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>Statistical Price Outlier (exceeds Tukey IQR threshold)</span>
              </div>
            )}
          </div>

          {/* Focal Fairness Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-rf-surface border border-rf-border sm:self-center shrink-0">
            <FairnessScoreGauge
              score={listing.fairnessScore}
              category={listing.fairnessCategory}
              variancePercentage={listing.variancePercentage}
              size="lg"
              showLabel={true}
              showVariance={true}
            />
          </div>
        </div>

        {/* 3. SIGNATURE MARKET POSITION SCALE */}
        <div className="mt-6">
          <MarketPositionScale
            variancePercentage={listing.variancePercentage}
            q1={baseline?.rentIqr?.q1}
            median={baseline?.medianRent}
            q3={baseline?.rentIqr?.q3}
            targetRent={listing.rentAmount}
            compact={false}
          />
        </div>

        {/* 4. MARKET BASELINE VARIANCE AUDIT */}
        <div className="mt-6 font-sans">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" aria-hidden="true" />
            Market Baseline Variance Audit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Property Rate */}
            <div className="p-4 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Property Rate</span>
              <span className="text-lg font-bold text-white mt-1 block tabular-nums">
                {isRentAvailable ? (isAreaAvailable ? formatPricePerSqft(listing.pricePerSqft) : '₹/sqft unavailable') : 'Price on request'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {isAreaAvailable ? `Based on ${formatArea(listing.carpetAreaSqft)}` : 'Area not specified'}
              </span>
            </div>

            {/* Locality Median Rate */}
            <div className="p-4 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Locality Median Rate</span>
              <span className="text-lg font-bold text-teal-300 mt-1 block tabular-nums">
                {formatPricePerSqft(medianPricePerSqft)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {listing.locality} {listing.bhk != null ? `${listing.bhk} BHK` : ''} benchmark
              </span>
            </div>

            {/* Calculated Variance */}
            <div className="p-4 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Median Difference</span>
              {priceDiff != null ? (
                <>
                  <span
                    className={`text-lg font-bold mt-1 flex items-center gap-1 tabular-nums ${
                      isHigher ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isHigher ? <TrendingUp className="w-4 h-4" aria-hidden="true" /> : <TrendingDown className="w-4 h-4" aria-hidden="true" />}
                    {formatCurrency(Math.abs(priceDiff))}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {isHigher ? 'Above median asking rent' : 'Below median asking rent'}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-slate-400 mt-1 block">
                  Baseline Not Applicable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 5. PROPERTY SPECIFICATIONS & EXTRACTED ATTRIBUTES */}
        <div className="mt-6 font-sans">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Home className="w-4 h-4 text-teal-400" aria-hidden="true" />
            Property Specifications & Attributes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">BHK</span>
              <span className="font-bold text-white mt-0.5 block">{listing.bhk != null ? `${listing.bhk} BHK` : 'BHK N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Carpet Area</span>
              <span className="font-bold text-white mt-0.5 block">{formatArea(listing.carpetAreaSqft)}</span>
            </div>
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Bathrooms</span>
              <span className="font-bold text-white mt-0.5 block">{listing.bathrooms != null ? `${listing.bathrooms} Bath` : 'Bath N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Property Type</span>
              <span className="font-bold text-white mt-0.5 block truncate">{listing.propertyType ? listing.propertyType.replace(/_/g, ' ') : 'Not Specified'}</span>
            </div>
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Furnishing</span>
              <span className="font-bold text-white mt-0.5 block truncate">{listing.furnishing ? listing.furnishing.replace(/_/g, ' ') : 'Not Specified'}</span>
            </div>
            <div className="p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Deposit</span>
              <span className="font-bold text-white mt-0.5 block truncate">{listing.depositAmount != null ? formatCurrency(listing.depositAmount) : 'Not Disclosed'}</span>
            </div>
          </div>
        </div>

        {/* 6. COMPARABLE CLUSTERING & METHODOLOGY EXPLANATION */}
        <div className="mt-6 p-4 rounded-xl bg-rf-bg-primary/60 border border-rf-border text-xs">
          <span className="text-rf-text-muted block text-[11px] font-mono uppercase tracking-wider mb-2">
            Comparable Clustering & Transparency
          </span>
          <p className="text-rf-text-secondary leading-relaxed font-sans">
            {listing.fairnessExplanation || (
              <>
                Evaluated against <strong className="text-rf-text-primary">{listing.comparableCount ?? baseline?.sampleSize ?? 0} comparable listings</strong> in {listing.locality}.
                The fairness assessment normalizes carpet area, bedroom count, and furnishing level against empirical locality medians using interquartile range (IQR) boundaries.
              </>
            )}
          </p>
        </div>

        {/* 7. DATA QUALITY / PROVENANCE (Section 9 Specification) */}
        <div className="mt-6 pt-5 border-t border-rf-border font-sans">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            Data Quality / Provenance
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            {/* Price extraction */}
            <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Price</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold">
                {isRentAvailable ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Explicitly extracted</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Not extracted</span>
                  </span>
                )}
              </div>
            </div>

            {/* Area extraction */}
            <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Area</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold">
                {isAreaAvailable ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Explicitly extracted</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Not extracted</span>
                  </span>
                )}
              </div>
            </div>

            {/* Fairness analysis */}
            <div className="col-span-2 sm:col-span-2 p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Fairness analysis</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold">
                {listing.fairnessScore != null ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Performed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Minus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Not assessed</span>
                  </span>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Source</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">Live search result</span>
                </span>
              </div>
            </div>

            {/* Retrieved */}
            <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-rf-bg-primary/70 border border-rf-border">
              <span className="text-slate-400 text-[10px] block uppercase font-medium">Retrieved</span>
              <div className="mt-1 text-slate-300 font-semibold truncate">
                {(() => {
                  try {
                    const rawDate = listing.retrievalTimestamp || listing.scrapedAt;
                    const d = new Date(rawDate);
                    return isNaN(d.getTime()) ? (rawDate || 'Current') : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } catch {
                    return 'Current';
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 8. LEGAL & METHODOLOGY NOTICE */}
        <div className="mt-6 p-3 rounded-lg bg-rf-bg-primary/40 border border-rf-border text-[11px] text-rf-text-muted leading-relaxed font-sans">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-rf-text-muted shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              RentFair analyzes information returned by live search results. It does not independently verify property availability, ownership, rent, or listing accuracy. All values are derived from mathematical modeling over the current comparable cohort.
            </span>
          </div>
        </div>

        {/* 9. USER INTELLIGENCE FEEDBACK */}
        <div className="mt-6">
          <FeedbackWidget
            title="Was this analysis useful?"
            contextNotice={
              isUnassessed
                ? "The listing price wasn't available in the source result, so RentFair could not assess its market position."
                : undefined
            }
            storageKey={`rentfair_feedback_listing_${listing.id}`}
            improvementOptions={[
              'Market comparison',
              'Listing information',
              'Fairness explanation',
              'Search results',
              'Something else',
            ]}
          />
        </div>

        {/* 10. STICKY MODAL BOTTOM ACTION BAR */}
        <div className="sticky -bottom-5 sm:-bottom-7 lg:-bottom-8 -mx-5 sm:-mx-7 lg:-mx-8 mt-6 p-4 bg-rf-surface/95 backdrop-blur-md border-t border-rf-border flex flex-wrap items-center justify-between gap-3 z-30">
          <div className="flex items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(listing)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal ${
                  isCompared
                    ? 'bg-teal-950 border-teal-700 text-rf-teal-bright shadow-sm'
                    : 'bg-rf-surface-elevated border-rf-border text-rf-text-secondary hover:text-rf-text-primary hover:border-rf-border-light'
                }`}
              >
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isCompared ? 'In Compare' : 'Add to Compare'}</span>
              </button>
            )}

            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(listing)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSaved
                    ? 'bg-amber-950/80 border-amber-700 text-amber-300 shadow-sm'
                    : 'bg-rf-surface-elevated border-rf-border text-rf-text-secondary hover:text-rf-text-primary hover:border-rf-border-light'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
                <span>{isSaved ? 'Saved' : 'Save Property'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {listing.sourceUrl && (
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rf-surface-elevated hover:bg-rf-surface text-rf-text-primary text-xs font-semibold border border-rf-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
              >
                <span>Visit Original Listing</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-rf-teal hover:bg-rf-teal-bright text-slate-950 font-bold text-xs transition-all shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
