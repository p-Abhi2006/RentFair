import React, { useState, useEffect, useRef } from 'react';
import {
  GitCompare,
  Search,
  Plus,
  X,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Info,
  CheckCircle2,
  Check,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  LocationComparisonRequest,
  LocationComparisonResponse,
} from '../types/rental';
import { rentalService } from '../services/rentalService';
import { FeedbackWidget } from '../components/common/FeedbackWidget';
import { MOCK_MARKET_COMPARISON } from '../data/mockRentalData';
import { isValidRent } from '../utils/formatters';

const POPULAR_LOCALITIES = [
  'Whitefield',
  'Koramangala',
  'HSR Layout',
  'Indiranagar',
  'Bellandur',
  'Marathahalli',
  'Electronic City',
  'Sarjapur Road',
  'Jayanagar',
  'JP Nagar',
  'Hebbal',
  'Banashankari',
];

export const MarketComparePage: React.FC = () => {
  // Location selection: default to the 4 target locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'Whitefield',
    'Koramangala',
    'HSR Layout',
    'Indiranagar',
  ]);

  const [locationInput, setLocationInput] = useState<string>('');
  const [bhk, setBhk] = useState<string>('2');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [furnishing, setFurnishing] = useState<string>('all');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');

  // Comparison API state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<LocationComparisonResponse | null>(null);

  // Search input dropdown suggestions & duplicate warning
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSuggestions = POPULAR_LOCALITIES.filter(
    (loc) =>
      loc.toLowerCase().includes(locationInput.trim().toLowerCase()) &&
      !selectedLocations.some((s) => s.toLowerCase() === loc.toLowerCase())
  );

  const handleAddLocation = (loc: string) => {
    const trimmed = loc.trim();
    if (!trimmed) return;

    // Duplicate check case-insensitively without altering the entered locality
    const duplicate = selectedLocations.find(
      (existing) => existing.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setDuplicateNotice(`"${duplicate}" is already selected for comparison.`);
      setTimeout(() => setDuplicateNotice(null), 3500);
      return;
    }

    if (selectedLocations.length >= 5) {
      return;
    }

    setDuplicateNotice(null);
    setSelectedLocations((prev) => [...prev, trimmed]);
    setLocationInput('');
    setShowSuggestions(false);
  };

  const handleRemoveLocation = (loc: string) => {
    setSelectedLocations((prev) => prev.filter((item) => item.toLowerCase() !== loc.toLowerCase()));
    setDuplicateNotice(null);
  };

  const runComparison = async () => {
    if (selectedLocations.length < 2) {
      setError('Please select at least 2 locations (maximum 5) to compare rental markets.');
      return;
    }
    if (selectedLocations.length > 5) {
      setError('Please select a maximum of 5 locations for comparison.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const request: LocationComparisonRequest = {
      locations: selectedLocations,
      bhk: bhk === 'all' ? null : parseInt(bhk, 10),
      propertyType: propertyType !== 'all' ? propertyType : undefined,
      furnishing: furnishing !== 'all' ? furnishing : undefined,
      minArea: minArea ? parseInt(minArea, 10) : undefined,
      maxArea: maxArea ? parseInt(maxArea, 10) : undefined,
    };

    try {
      const response = await rentalService.compareMarkets(request);
      setComparisonData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute cross-locality market comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemoComparison = () => {
    setError(null);
    setComparisonData(MOCK_MARKET_COMPARISON);
    setSelectedLocations(['Whitefield', 'Koramangala', 'HSR Layout', 'Indiranagar']);
  };

  // Run initial comparison on mount
  useEffect(() => {
    runComparison();
  }, []);

  // Format timestamp helper
  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return isoString;
    }
  };

  // Helpers for chart visualization scales
  const localities = comparisonData?.localities || [];
  const validRentLocalities = localities.filter((l) => l.medianRent !== null && l.medianRent > 0);
  const maxMedianRent = validRentLocalities.length > 0
    ? Math.max(...validRentLocalities.map((l) => l.medianRent || 0))
    : 0;

  const minMedianRent = validRentLocalities.length > 0
    ? Math.min(...validRentLocalities.map((l) => l.medianRent || 0))
    : 0;

  const validPpsLocalities = localities.filter(
    (l) => l.medianPricePerSqft !== null && l.medianPricePerSqft > 0
  );
  const maxPps = validPpsLocalities.length > 0
    ? Math.max(...validPpsLocalities.map((l) => l.medianPricePerSqft || 0))
    : 0;

  const maxSampleSize = localities.length > 0
    ? Math.max(...localities.map((l) => l.totalListingCount || 1))
    : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Compare Rental Markets Across Locations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-3xl">
            Evaluate macro rental distributions, median asking rates, price density per sq ft, and sample reliability across 2 to 5 localities. Analysis is strictly market-aggregate and objective.
          </p>
        </div>

        {/* Live SerpApi status badge */}
        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-lg bg-rf-surface border border-rf-border text-xs font-mono text-rf-text-muted">
          <span className="w-2 h-2 rounded-full bg-rf-teal animate-pulse"></span>
          <span>Live SerpApi Pipeline</span>
        </div>
      </div>

      {/* Control Panel: Locations, BHK, and Optional Filters */}
      <div className="rounded-2xl border border-rf-border bg-rf-surface p-5 sm:p-6 shadow-panel space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rf-text-muted">
            <Building2 className="w-3.5 h-3.5 text-rf-teal" />
            <span>Market Comparison Parameters</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {selectedLocations.length >= 5
              ? '5 of 5 selected · Remove a location to add another'
              : `${selectedLocations.length} of 5 selected · Compare up to 5 locations`}
          </span>
        </div>

        {/* Duplicate Notice Banner */}
        {duplicateNotice && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-xl px-3 py-2 animate-in fade-in">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{duplicateNotice}</span>
          </div>
        )}

        {/* Selected Location Chips & Manual Input */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedLocations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-100 shadow-sm hover:border-teal-500/50 transition-colors"
            >
              <span>{loc}</span>
              <button
                type="button"
                onClick={() => handleRemoveLocation(loc)}
                aria-label={`Remove ${loc} from comparison`}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                title={`Remove ${loc}`}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}

          {selectedLocations.length < 5 ? (
            <div ref={suggestionContainerRef} className="relative inline-block">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-400 shadow-inner">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search or enter a locality..."
                  value={locationInput}
                  aria-label="Search or enter a locality to add to comparison"
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation(locationInput);
                    }
                  }}
                  className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-44 sm:w-56"
                />
                {locationInput.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddLocation(locationInput)}
                    aria-label={`Add ${locationInput.trim()} to comparison`}
                    className="p-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                    title={`Add "${locationInput.trim()}"`}
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown & Manual enter hint */}
              {showSuggestions && (
                <div className="absolute left-0 mt-1.5 w-64 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-30 py-1 divide-y divide-slate-800">
                  {locationInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddLocation(locationInput)}
                      className="w-full text-left px-3 py-2 text-xs text-teal-300 hover:bg-teal-950/50 flex items-center justify-between transition-colors font-medium"
                    >
                      <span className="truncate">Add "{locationInput.trim()}"</span>
                      <span className="text-[10px] font-mono text-teal-400/90 bg-teal-950/90 border border-teal-800/70 px-1.5 py-0.5 rounded shrink-0">Enter ↵</span>
                    </button>
                  )}

                  {filteredSuggestions.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Suggested Localities
                      </div>
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddLocation(suggestion)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredSuggestions.length === 0 && !locationInput.trim() && (
                    <div className="px-3 py-2 text-xs text-slate-500 italic">
                      Type any locality name and press Enter to add.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic self-center">
              5 of 5 selected · Remove a location to add another
            </span>
          )}
        </div>

        {/* Filter Rows: BHK, Property Type, Furnishing, Area Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 border-t border-slate-800/80">
          {/* BHK Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Configuration (BHK)
            </label>
            <div className="relative">
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 appearance-none cursor-pointer shadow-inner"
              >
                <option value="all" className="bg-slate-900 text-slate-100">All BHKs</option>
                <option value="1" className="bg-slate-900 text-slate-100">1 BHK</option>
                <option value="2" className="bg-slate-900 text-slate-100">2 BHK</option>
                <option value="3" className="bg-slate-900 text-slate-100">3 BHK</option>
                <option value="4" className="bg-slate-900 text-slate-100">4+ BHK</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Property Type (Optional)
            </label>
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 appearance-none cursor-pointer shadow-inner"
              >
                <option value="all" className="bg-slate-900 text-slate-100">All Types</option>
                <option value="APARTMENT" className="bg-slate-900 text-slate-100">Apartment</option>
                <option value="GATED_COMMUNITY" className="bg-slate-900 text-slate-100">Gated Community</option>
                <option value="INDEPENDENT_HOUSE" className="bg-slate-900 text-slate-100">Independent House</option>
                <option value="VILLA" className="bg-slate-900 text-slate-100">Villa</option>
                <option value="STUDIO" className="bg-slate-900 text-slate-100">Studio</option>
                <option value="BUILDER_FLOOR" className="bg-slate-900 text-slate-100">Builder Floor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Furnishing Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Furnishing (Optional)
            </label>
            <div className="relative">
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 appearance-none cursor-pointer shadow-inner"
              >
                <option value="all" className="bg-slate-900 text-slate-100">All Furnishing</option>
                <option value="SEMI_FURNISHED" className="bg-slate-900 text-slate-100">Semi Furnished</option>
                <option value="FULLY_FURNISHED" className="bg-slate-900 text-slate-100">Fully Furnished</option>
                <option value="UNFURNISHED" className="bg-slate-900 text-slate-100">Unfurnished</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Area Range Filter (Optional) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Area Sq Ft (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-mono shadow-inner"
              />
              <span className="text-slate-500 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-1/2 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Execute Comparison Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={runComparison}
              disabled={isLoading || selectedLocations.length < 2 || selectedLocations.length > 5}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rf-teal hover:bg-rf-teal-bright disabled:bg-rf-surface-elevated disabled:text-rf-text-muted text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing Markets...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Run Market Comparison</span>
                </>
              )}
            </button>
          </div>
        </div>

        {selectedLocations.length < 2 && (
          <p className="text-[11px] text-amber-400 flex items-center gap-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Select at least 2 locations to run cross-locality comparative analytics.</span>
          </p>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-panel">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Unable to complete live market comparison</p>
              <p className="text-slate-300">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadDemoComparison}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shrink-0"
          >
            Load Sample Comparison
          </button>
        </div>
      )}

      {/* Active Results Display */}
      {comparisonData && (
        <div className="space-y-8">
          {/* Timestamp and Subtitle Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>
                Live SerpApi data — retrieved at{' '}
                <strong className="text-slate-200">
                  {formatTimestamp(comparisonData.generatedAt)}
                </strong>
              </span>
            </div>
            <div>
              <span>Configuration: </span>
              <strong className="text-teal-300">
                {bhk === 'all' ? 'All BHKs' : `${bhk} BHK`}
              </strong>
            </div>
          </div>

          {/* Comparative Observations Summary */}
          {comparisonData.comparisonSummary?.observations &&
            comparisonData.comparisonSummary.observations.length > 0 && (
              <div className="rounded-xl border border-teal-500/20 bg-teal-950/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Observed Market Differences</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {comparisonData.comparisonSummary.observations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Visualizations Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Comparative Visualizations</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Median Monthly Rent by Locality */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    1. Median Monthly Rent
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">INR / month</span>
                </div>

                <div className="space-y-3 pt-2">
                  {localities.map((loc) => {
                    const hasRent = isValidRent(loc.medianRent);
                    const pct = hasRent && maxMedianRent > 0
                      ? Math.round((loc.medianRent! / maxMedianRent) * 100)
                      : 0;

                    const isLowest = hasRent && loc.medianRent === minMedianRent && validRentLocalities.length > 1;
                    const isHighest = hasRent && loc.medianRent === maxMedianRent && validRentLocalities.length > 1;

                    return (
                      <div key={loc.locality} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200 truncate">{loc.locality}</span>
                          <span className="font-mono text-slate-300 whitespace-nowrap tabular-nums">
                            {hasRent ? `₹${loc.medianRent?.toLocaleString('en-IN')}/mo` : (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-sans text-xs">
                                <X className="w-3 h-3 text-rose-400 shrink-0" aria-hidden="true" />
                                <span>Insufficient live data</span>
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                          {hasRent ? (
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLowest
                                  ? 'bg-teal-500'
                                  : isHighest
                                  ? 'bg-sky-500'
                                  : 'bg-slate-600'
                              }`}
                              style={{ width: `${Math.max(8, pct)}%` }}
                              role="progressbar"
                              aria-valuenow={loc.medianRent || 0}
                              aria-valuemin={0}
                              aria-valuemax={maxMedianRent}
                              aria-label={`${loc.locality} median rent ₹${loc.medianRent?.toLocaleString('en-IN')}`}
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-800/40 border-dashed border-slate-700" />
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>Based on {loc.validPricedListingCount} valid priced listings</span>
                          {isLowest && <span className="text-teal-400">Lower median</span>}
                          {isHighest && <span className="text-sky-400">Higher median</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Median Rent / Sqft by Locality */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    2. Median Rent / Sq Ft
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">INR / sqft</span>
                </div>

                <div className="space-y-3 pt-2">
                  {localities.map((loc) => {
                    const hasPps = loc.medianPricePerSqft !== null && loc.medianPricePerSqft > 0;
                    const pct = hasPps && maxPps > 0
                      ? Math.round((loc.medianPricePerSqft! / maxPps) * 100)
                      : 0;

                    return (
                      <div key={loc.locality} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200 truncate">{loc.locality}</span>
                          <span className="font-mono text-slate-300 whitespace-nowrap tabular-nums">
                            {hasPps ? `₹${loc.medianPricePerSqft?.toFixed(1)}/sqft` : (
                              <span className="text-slate-500 italic">Insufficient live data</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                          {hasPps ? (
                            <div
                              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                              style={{ width: `${Math.max(8, pct)}%` }}
                              role="progressbar"
                              aria-valuenow={Math.round(loc.medianPricePerSqft || 0)}
                              aria-valuemin={0}
                              aria-valuemax={Math.round(maxPps)}
                              aria-label={`${loc.locality} median rent per sqft ₹${loc.medianPricePerSqft?.toFixed(1)}`}
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-800/40 border-dashed border-slate-700" />
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>{loc.listingsWithAreaCount} listings with area</span>
                          {!hasPps && <span className="text-slate-500">Area not disclosed</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Sample Size by Locality */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    3. Sample Size & Reliability
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Listing Count</span>
                </div>

                <div className="space-y-3 pt-2">
                  {localities.map((loc) => {
                    const pct = maxSampleSize > 0
                      ? Math.round((loc.totalListingCount / maxSampleSize) * 100)
                      : 0;

                    return (
                      <div key={loc.locality} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200 truncate">{loc.locality}</span>
                          <span className="font-mono text-slate-300 whitespace-nowrap tabular-nums">
                            {loc.validPricedListingCount} priced / {loc.totalListingCount} total
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                            role="progressbar"
                            aria-valuenow={loc.totalListingCount}
                            aria-valuemin={0}
                            aria-valuemax={maxSampleSize}
                            aria-label={`${loc.locality} sample size ${loc.totalListingCount} listings`}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400">{loc.dataQualityDescription}</span>
                          {loc.validPricedListingCount >= 5 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                              <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" aria-hidden="true" />
                              <span>Sufficient live data</span>
                            </span>
                          ) : loc.validPricedListingCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-amber-950/40 border border-amber-800/40 text-amber-300">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" aria-hidden="true" />
                              <span>Limited sample</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-rose-950/40 border border-rose-900/40 text-rose-300">
                              <X className="w-2.5 h-2.5 text-rose-400 shrink-0" aria-hidden="true" />
                              <span>Insufficient live data</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Granular Metric Breakdown Cards for Every Locality */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Detailed Statistical Metrics by Location</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {localities.map((loc) => {
                const hasRent = isValidRent(loc.medianRent);
                const isLowest = hasRent && loc.medianRent === minMedianRent && validRentLocalities.length > 1;
                const isHighest = hasRent && loc.medianRent === maxMedianRent && validRentLocalities.length > 1;

                return (
                  <div
                    key={loc.locality}
                    className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Locality Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-white">{loc.locality}</h4>
                          {loc.city && loc.city.trim().toLowerCase() !== loc.locality.trim().toLowerCase() && (
                            <span className="text-[11px] font-mono text-slate-400">{loc.city}</span>
                          )}
                        </div>
                        {loc.validPricedListingCount >= 5 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium font-sans px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                            <span>Sufficient live data</span>
                          </span>
                        ) : loc.validPricedListingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium font-sans px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300" title={`Based on ${loc.validPricedListingCount} valid priced listings`}>
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
                            <span>Limited sample</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium font-sans px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-300">
                            <X className="w-3 h-3 text-rose-400 shrink-0" aria-hidden="true" />
                            <span>Insufficient live data</span>
                          </span>
                        )}
                      </div>

                      {/* Primary Median Rent Callout */}
                      <div className="pt-3 pb-2 font-sans">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                          Median Monthly Rent
                        </div>
                        <div className="text-2xl font-bold text-white mt-0.5 tabular-nums whitespace-nowrap">
                          {hasRent ? (
                            `₹${loc.medianRent?.toLocaleString('en-IN')}/mo`
                          ) : (
                            <span className="text-sm font-normal text-slate-500 italic">
                              Insufficient live data
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-sans">
                          Based on {loc.validPricedListingCount} valid priced listings ({loc.sourceListingCount ?? loc.totalListingCount} source, {loc.listingsWithAreaCount} area, sample n={loc.statisticalSampleSize ?? loc.sampleSize})
                        </div>
                        {loc.dataTimestamp && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-sans">
                            Retrieved: {(() => {
                              try {
                                const d = new Date(loc.dataTimestamp);
                                return isNaN(d.getTime()) ? loc.dataTimestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              } catch {
                                return loc.dataTimestamp;
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Statistical Distribution Grid */}
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80 text-xs font-sans">
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">Average Rent</span>
                          <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                            {loc.averageRent ? `₹${loc.averageRent.toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">Rent / Sq Ft</span>
                          <span className="font-semibold text-teal-300 tabular-nums whitespace-nowrap">
                            {loc.medianPricePerSqft ? `₹${loc.medianPricePerSqft.toFixed(1)}/sqft` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">Q1 (25th %)</span>
                          <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                            {loc.q1 ? `₹${loc.q1.toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">Q3 (75th %)</span>
                          <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                            {loc.q3 ? `₹${loc.q3.toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">IQR Spread</span>
                          <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                            {loc.iqr ? `₹${loc.iqr.toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block font-medium">With Area</span>
                          <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                            {loc.listingsWithAreaCount} listings
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Relative Market Status Badge */}
                    <div className="pt-4 border-t border-slate-800">
                      {isLowest && (
                        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lower median in this comparison</span>
                        </div>
                      )}
                      {isHighest && (
                        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Higher median in this comparison</span>
                        </div>
                      )}
                      {!isLowest && !isHighest && hasRent && (
                        <div className="text-xs text-slate-400 font-mono">
                          Median asking rent
                        </div>
                      )}
                      {!hasRent && (
                        <div className="inline-flex items-center gap-1 text-xs text-rose-400 font-sans">
                          <X className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                          <span>Insufficient live data</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Market Comparison Intelligence Feedback */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <FeedbackWidget
                title="Was this market comparison useful?"
                storageKey={`rentfair_feedback_market_compare_${selectedLocations.slice().sort().join('_')}`}
                improvementOptions={[
                  'Market comparison depth',
                  'Locality coverage',
                  'Rate per sqft clarity',
                  'Sample reliability metrics',
                  'Something else',
                ]}
                className="max-w-xl mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
