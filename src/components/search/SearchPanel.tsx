import React, { useState, useEffect } from 'react';
import { SearchFilterParams } from '../../types/rental';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Home,
  IndianRupee,
  Maximize2,
  Sparkles,
  RotateCcw,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface SearchPanelProps {
  onSearch: (params: SearchFilterParams) => void;
  initialParams?: Partial<SearchFilterParams>;
  isSearching?: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onSearch,
  initialParams,
  isSearching = false,
}) => {
  const [location, setLocation] = useState(initialParams?.location || 'Whitefield, Bangalore');
  const [bhk, setBhk] = useState<string>(initialParams?.bhk || '2');
  const [propertyType, setPropertyType] = useState<string>(initialParams?.propertyType || 'all');
  const [maxRent, setMaxRent] = useState<number>(initialParams?.maxRent || 75000);
  const [minArea, setMinArea] = useState<number | undefined>(initialParams?.minArea || undefined);
  const [maxArea, setMaxArea] = useState<number | undefined>(initialParams?.maxArea || undefined);
  const [furnishing, setFurnishing] = useState<string>(initialParams?.furnishing || 'all');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (initialParams) {
      if (initialParams.location !== undefined) setLocation(initialParams.location);
      if (initialParams.bhk !== undefined) setBhk(initialParams.bhk);
      if (initialParams.propertyType !== undefined) setPropertyType(initialParams.propertyType);
      if (initialParams.maxRent !== undefined) setMaxRent(initialParams.maxRent);
      if (initialParams.minArea !== undefined) setMinArea(initialParams.minArea);
      if (initialParams.maxArea !== undefined) setMaxArea(initialParams.maxArea);
      if (initialParams.furnishing !== undefined) setFurnishing(initialParams.furnishing);
    }
  }, [
    initialParams?.location,
    initialParams?.bhk,
    initialParams?.propertyType,
    initialParams?.maxRent,
    initialParams?.minArea,
    initialParams?.maxArea,
    initialParams?.furnishing,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      bhk,
      propertyType,
      maxRent,
      minArea,
      maxArea,
      furnishing,
      sortBy: initialParams?.sortBy || 'fairness',
    });
  };

  const handleReset = () => {
    setLocation('Whitefield, Bangalore');
    setBhk('all');
    setPropertyType('all');
    setMaxRent(80000);
    setMinArea(undefined);
    setMaxArea(undefined);
    setFurnishing('all');
    onSearch({
      location: 'Whitefield, Bangalore',
      bhk: 'all',
      propertyType: 'all',
      maxRent: 80000,
      furnishing: 'all',
      sortBy: 'fairness',
    });
  };

  const handleApplyPreset = (loc: string, presetBhk: string) => {
    setLocation(loc);
    setBhk(presetBhk);
    onSearch({
      location: loc,
      bhk: presetBhk,
      propertyType,
      maxRent,
      minArea,
      maxArea,
      furnishing,
      sortBy: 'fairness',
    });
  };

  return (
    <div className="rounded-2xl bg-rf-surface border border-rf-border shadow-panel p-5 sm:p-6 lg:p-7 relative transition-all">
      <form onSubmit={handleSubmit} role="search" aria-label="Rental property search form">
        {/* Main Grid: Location & BHK */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-end">
          {/* Location Field */}
          <div className="md:col-span-6 lg:col-span-5">
            <label
              htmlFor="search-location-input"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
              <span>Locality / Area</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                id="search-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Whitefield, Bangalore"
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-sans transition-all"
                required
              />
            </div>
          </div>

          {/* BHK Selector */}
          <div className="md:col-span-6 lg:col-span-4">
            <span
              id="bhk-selector-label"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
              <span>Configuration (BHK)</span>
            </span>
            <div
              role="radiogroup"
              aria-labelledby="bhk-selector-label"
              className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700/80"
            >
              {['all', '1', '2', '3', '4+'].map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={bhk === option}
                  onClick={() => setBhk(option)}
                  className={`min-h-[40px] py-2 text-xs font-medium rounded-lg transition-all font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    bhk === option
                      ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {option === 'all' ? 'All' : `${option} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Search Submit Button */}
          <div className="md:col-span-12 lg:col-span-3">
            <button
              type="submit"
              disabled={isSearching}
              aria-label={isSearching ? 'Analyzing market and scanning listings' : 'Analyze rental market'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400 hover:bg-teal-300 active:bg-teal-500 text-slate-950 font-bold px-6 py-3.5 text-sm transition-all shadow-subtle disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" aria-hidden="true" />
                  <span>Analyzing Market...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-slate-950" aria-hidden="true" />
                  <span>Analyze Market</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Row: Max Rent, Property Type, Furnishing */}
        <div className="mt-5 pt-5 border-t border-rf-border grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Max Rent Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="max-rent-slider" className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Max Monthly Rent</span>
              </label>
              <span className="font-sans text-xs font-semibold text-teal-300 tabular-nums">
                ₹{maxRent.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              id="max-rent-slider"
              type="range"
              min="10000"
              max="150000"
              step="2500"
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              aria-valuemin={10000}
              aria-valuemax={150000}
              aria-valuenow={maxRent}
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label htmlFor="property-type-select" className="block text-xs font-medium text-slate-300 mb-1.5">
              Property Type
            </label>
            <div className="relative">
              <select
                id="property-type-select"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-3.5 pr-9 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-100">All Property Types</option>
                <option value="APARTMENT" className="bg-slate-900 text-slate-100">Apartment</option>
                <option value="GATED_COMMUNITY" className="bg-slate-900 text-slate-100">Gated Community</option>
                <option value="BUILDER_FLOOR" className="bg-slate-900 text-slate-100">Builder Floor</option>
                <option value="INDEPENDENT_HOUSE" className="bg-slate-900 text-slate-100">Independent House</option>
                <option value="STUDIO" className="bg-slate-900 text-slate-100">Studio</option>
                <option value="VILLA" className="bg-slate-900 text-slate-100">Villa</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Furnishing Dropdown */}
          <div>
            <label htmlFor="furnishing-select" className="block text-xs font-medium text-slate-300 mb-1.5">
              Furnishing
            </label>
            <div className="relative">
              <select
                id="furnishing-select"
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-3.5 pr-9 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-100">Any Furnishing</option>
                <option value="FULLY_FURNISHED" className="bg-slate-900 text-slate-100">Fully Furnished</option>
                <option value="SEMI_FURNISHED" className="bg-slate-900 text-slate-100">Semi-Furnished</option>
                <option value="UNFURNISHED" className="bg-slate-900 text-slate-100">Unfurnished</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Optional Collapsible Advanced Area Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-rf-border grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
            <div>
              <label htmlFor="min-area-input" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Minimum Carpet Area (sq.ft)</span>
              </label>
              <input
                id="min-area-input"
                type="number"
                value={minArea || ''}
                onChange={(e) => setMinArea(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 500"
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-sans transition-colors"
              />
            </div>
            <div>
              <label htmlFor="max-area-input" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Maximum Carpet Area (sq.ft)</span>
              </label>
              <input
                id="max-area-input"
                type="number"
                value={maxArea || ''}
                onChange={(e) => setMaxArea(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 2000"
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 font-sans transition-colors"
              />
            </div>
          </div>
        )}

        {/* Footer controls: quick query presets and advanced toggle */}
        <div className="mt-5 pt-3.5 border-t border-rf-border flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Preset Queries */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-rf-text-muted flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-rf-teal" aria-hidden="true" />
              Quick Searches:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('Whitefield, Bangalore', '1')}
              className="px-2.5 py-1 rounded-lg bg-rf-surface-elevated hover:bg-rf-surface text-rf-text-secondary border border-rf-border transition-colors font-sans text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
            >
              Whitefield 1 BHK
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Whitefield, Bangalore', '2')}
              className="px-2.5 py-1 rounded-lg bg-rf-surface-elevated hover:bg-rf-surface text-rf-text-secondary border border-rf-border transition-colors font-sans text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
            >
              Whitefield 2 BHK
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('HSR Layout, Bangalore', '2')}
              className="px-2.5 py-1 rounded-lg bg-rf-surface-elevated hover:bg-rf-surface text-rf-text-secondary border border-rf-border transition-colors font-sans text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
            >
              HSR Layout 2 BHK
            </button>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className="text-rf-text-secondary hover:text-rf-teal-bright transition-colors flex items-center gap-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal rounded"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showAdvanced ? 'Hide Area Filters' : 'Area Filters'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-rf-text-muted hover:text-rf-text-primary transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-border-light rounded"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
