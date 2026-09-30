import React from 'react';
import { RentalListing } from '../../types/rental';
import { formatCurrency, formatPricePerSqft, formatArea, formatVariance } from '../../utils/formatters';
import { MarketPositionScale } from '../common/MarketPositionScale';
import {
  Bookmark,
  Scale,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Building2,
  Check,
  X,
} from 'lucide-react';

interface RentalCardProps {
  listing: RentalListing;
  onInspect?: (listing: RentalListing) => void;
  onToggleCompare?: (listing: RentalListing) => void;
  isCompared?: boolean;
  onToggleSave?: (listing: RentalListing) => void;
  isSaved?: boolean;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  listing,
  onInspect,
  onToggleCompare,
  isCompared = false,
  onToggleSave,
  isSaved = false,
}) => {
  const variance = formatVariance(listing.variancePercentage);
  const isRentAvailable = listing.rentAmount != null && !isNaN(listing.rentAmount) && listing.rentAmount > 0;
  const isAreaAvailable = listing.carpetAreaSqft != null && !isNaN(listing.carpetAreaSqft) && listing.carpetAreaSqft > 0;

  // Semantic category color for integrated badge
  const getCategoryStyles = () => {
    if (!listing.fairnessCategory) {
      return {
        badgeBg: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
        label: 'Unassessed',
      };
    }
    switch (listing.fairnessCategory) {
      case 'SIGNIFICANTLY_BELOW_TYPICAL':
      case 'HIGHLY_COMPETITIVE':
      case 'BELOW_TYPICAL':
        return {
          badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-700/80',
          label: 'Below Typical',
        };
      case 'FAIR':
        return {
          badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700/80',
          label: 'Near Typical',
        };
      case 'ABOVE_TYPICAL':
      case 'SLIGHTLY_HIGH':
      case 'SIGNIFICANTLY_ABOVE_TYPICAL':
      case 'OVERPRICED':
      case 'EXTREME_OUTLIER':
        return {
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
          label: 'Above Typical',
        };
      default:
        return {
          badgeBg: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
          label: 'Unassessed',
        };
    }
  };

  const catStyles = getCategoryStyles();

  const [imageError, setImageError] = React.useState(false);

  return (
    <article
      className="group/card rounded-2xl bg-rf-surface border border-rf-border hover:border-teal-500/50 hover:bg-rf-surface-elevated/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-card flex flex-col overflow-hidden font-sans"
      aria-label={`Rental listing: ${listing.title} in ${listing.locality}`}
    >
      {/* 1. LARGE PROPERTY IMAGE / ARCHITECTURAL PREVIEW */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden border-b border-rf-border">
        {listing.imageUrl && !imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          /* Elegant architectural visual placeholder */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-rf-surface-elevated to-slate-950 relative overflow-hidden flex items-center justify-center">
            {/* Fine architectural drafting lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px]" />
            <svg
              className="w-full h-full absolute inset-0 opacity-20 text-teal-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 120"
              preserveAspectRatio="xMidYMid slice"
            >
              <line x1="20" y1="110" x2="280" y2="110" stroke="currentColor" strokeWidth="1.5" />
              <rect x="50" y="30" width="60" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="130" y="15" width="80" height="95" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="65" y="45" width="15" height="18" fill="currentColor" fillOpacity="0.3" />
              <rect x="90" y="45" width="15" height="18" fill="currentColor" fillOpacity="0.3" />
              <rect x="65" y="75" width="15" height="18" fill="currentColor" fillOpacity="0.3" />
              <rect x="90" y="75" width="15" height="18" fill="currentColor" fillOpacity="0.3" />
              <rect x="145" y="30" width="20" height="22" fill="currentColor" fillOpacity="0.3" />
              <rect x="175" y="30" width="20" height="22" fill="currentColor" fillOpacity="0.3" />
              <rect x="145" y="65" width="20" height="22" fill="currentColor" fillOpacity="0.3" />
              <rect x="175" y="65" width="20" height="22" fill="currentColor" fillOpacity="0.3" />
            </svg>
            <div className="relative text-center p-3 z-10">
              <Building2 className="w-7 h-7 text-teal-400/80 mx-auto mb-1" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-300">
                {listing.propertyType ? listing.propertyType.replace(/_/g, ' ') : 'Residential Rental'}
              </span>
            </div>
          </div>
        )}

        {/* Top Overlay: Locality Pill & Action Buttons */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-sm truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{listing.locality}</span>
            {listing.subLocality && (
              <span className="text-slate-400 text-xs truncate">· {listing.subLocality}</span>
            )}
          </div>

          {/* Quick Action Toggle Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleCompare && onToggleCompare(listing)}
              aria-label={isCompared ? `Remove ${listing.title} from comparison` : `Add ${listing.title} to comparison`}
              title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
              className={`p-2 rounded-xl border text-xs transition-all duration-150 active:scale-90 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isCompared
                  ? 'bg-teal-950/90 border-teal-600 text-teal-300 shadow-sm'
                  : 'bg-slate-950/70 border-white/10 text-slate-300 hover:text-white hover:border-white/25 hover:bg-slate-900/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onToggleSave && onToggleSave(listing)}
              aria-label={isSaved ? `Remove ${listing.title} from saved watchlist` : `Save ${listing.title} to watchlist`}
              title={isSaved ? 'Remove from Saved' : 'Save Property'}
              className={`p-2 rounded-xl border text-xs transition-all duration-150 active:scale-90 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isSaved
                  ? 'bg-amber-950/90 border-amber-600 text-amber-300 shadow-sm'
                  : 'bg-slate-950/70 border-white/10 text-slate-300 hover:text-white hover:border-white/25 hover:bg-slate-900/80'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bottom Overlay: Property Type & Outlier Tag */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
          {listing.propertyType && (
            <span className="px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] font-medium uppercase tracking-wide">
              {listing.propertyType.replace(/_/g, ' ')}
            </span>
          )}
          {listing.isStatisticalOutlier && (
            <span className="ml-auto px-2.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-700 text-amber-300 text-[11px] flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Statistical Outlier</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Property Title */}
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          {/* Asking Rent (The Visual Anchor) & Fairness Score Module */}
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight tabular-nums">
                  {formatCurrency(listing.rentAmount)}
                </span>
                {isRentAvailable && (
                  <span className="text-sm font-normal text-slate-400">/month</span>
                )}
              </div>

              {/* Status Indicator (Secondary - Color + Icon + Text) */}
              <div className="mt-1 flex items-center">
                {isRentAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Price explicitly extracted</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                    <X className="w-3 h-3 text-rose-400 shrink-0" aria-hidden="true" />
                    <span>Price not extracted</span>
                  </span>
                )}
              </div>

              {/* Rate per sqft / Deposit info */}
              {(isRentAvailable || listing.depositAmount != null) && (
                <div className="mt-1.5 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  {isRentAvailable && (
                    <span className="text-slate-300 font-medium">
                      {isAreaAvailable ? formatPricePerSqft(listing.pricePerSqft) : '₹/sqft unavailable'}
                    </span>
                  )}
                  {listing.depositAmount != null && (
                    <>
                      {isRentAvailable && <span className="text-slate-600" aria-hidden="true">•</span>}
                      <span>Deposit: {formatCurrency(listing.depositAmount)}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fairness Score & Category Indicator */}
            <div className="shrink-0 text-right">
              {listing.fairnessScore != null ? (
                <div className={`px-3 py-1.5 rounded-xl border text-right ${catStyles.badgeBg}`}>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-lg font-bold tabular-nums text-white">
                      {listing.fairnessScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[11px] font-semibold block leading-tight mt-0.5">
                    {catStyles.label}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium px-2.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/80 inline-block">
                  Unassessed
                </span>
              )}
            </div>
          </div>

          {/* Variance annotation */}
          {listing.variancePercentage != null && (
            <div className="mt-2 text-xs">
              <span className={variance.isPositive ? 'text-emerald-400 font-medium' : variance.isNeutral ? 'text-sky-400 font-medium' : 'text-amber-400 font-medium'}>
                {variance.text}
              </span>
            </div>
          )}

          {/* Signature Market Position Visualization Bar */}
          <div className="mt-3.5 pt-3 border-t border-rf-border/80">
            <MarketPositionScale
              variancePercentage={listing.variancePercentage}
              compact={true}
            />
          </div>

          {/* 3. PROPERTY SPECIFICATIONS (Clean inline fact line without heavy boxes) */}
          <div className="mt-4 pt-3 border-t border-rf-border/60 flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-white">
              {listing.bhk != null ? `${listing.bhk} BHK` : 'BHK N/A'}
            </span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className="text-slate-300">
              {formatArea(listing.carpetAreaSqft)}
            </span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className="text-slate-300">
              {listing.bathrooms != null ? `${listing.bathrooms} Bath` : 'Bath N/A'}
            </span>
          </div>
        </div>

        {/* 4. FOOTER: SOURCE PLATFORM, COMPS & ANALYSIS DETAIL ACTION */}
        <div className="pt-3.5 border-t border-rf-border flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            {listing.sourcePlatform && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[11px] font-medium border border-rf-border">
                {listing.sourcePlatform}
              </span>
            )}
            <span className="text-slate-400 text-xs truncate">
              {listing.comparableCount != null ? (
                <>
                  <strong className="text-slate-200">{listing.comparableCount}</strong> comps
                </>
              ) : (
                'Unassessed'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onInspect && onInspect(listing)}
            className="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30 hover:border-teal-400 text-xs font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>Analysis Detail</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
