import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { ExploreRentalsPage } from './pages/ExploreRentalsPage';
import { ComparePage } from './pages/ComparePage';
import { MarketComparePage } from './pages/MarketComparePage';
import { SavedPage } from './pages/SavedPage';
import { InsightsPage } from './pages/InsightsPage';
import { AboutPage } from './pages/AboutPage';
import { ErrorState } from './components/common/ErrorState';
import { rentalService } from './services/rentalService';
import { RentalListing, MarketBaseline, SearchFilterParams } from './types/rental';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const createEmptyBaseline = (location: string = 'Whitefield', bhk?: string | number | null): MarketBaseline => {
  const parts = location.split(',');
  const cleanLocality = parts[0]?.trim() || 'Whitefield';
  const cleanCity = parts.length > 1 ? parts[parts.length - 1].trim() : 'Bangalore';
  const numericBhk = bhk && bhk !== 'all' && !isNaN(Number(bhk)) ? Number(bhk) : 2;

  return {
    locality: cleanLocality,
    city: cleanCity,
    bhk: numericBhk,
    sampleSize: 0,
    medianRent: null,
    averageRent: null,
    medianPricePerSqft: null,
    rentIqr: null,
    priceDistribution: [],
    generatedAt: '',
    isPrototypeBaseline: false,
  };
};

export const App: React.FC = () => {
  const getTabFromHash = (): NavTab => {
    if (typeof window === 'undefined') return 'overview';
    const clean = window.location.hash.replace(/^#\/?/, '') as NavTab;
    const validTabs: NavTab[] = ['overview', 'explore', 'compare', 'market-compare', 'saved', 'insights', 'about'];
    return validTabs.includes(clean) ? clean : 'overview';
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  const [listings, setListings] = useState<RentalListing[]>([]);
  const [baseline, setBaseline] = useState<MarketBaseline>(createEmptyBaseline('Whitefield, Bangalore', 2));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search sequence and abort tracking to prevent race conditions
  const searchSeqRef = React.useRef<number>(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Search parameters
  const [searchParams, setSearchParams] = useState<SearchFilterParams>({
    location: 'Whitefield, Bangalore',
    bhk: '2',
    propertyType: 'all',
    maxRent: 80000,
    furnishing: 'all',
    sortBy: 'fairness',
  });

  // Compare tray
  const [compareListings, setCompareListings] = useState<RentalListing[]>([]);

  // Saved / Bookmarked properties (persisted in localStorage)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rentfair_saved_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected listing for inspection modal
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);

  // Toast feedback state (Section 7 Specification)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2600);
  };

  // Sync savedIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rentfair_saved_ids', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // Load search data with race condition protection
  const loadData = async (params: Partial<SearchFilterParams> = {}) => {
    // 1. Abort previous in-flight search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentSeq = ++searchSeqRef.current;

    // 2. Immediately clear stale baseline so older location/BHK metrics don't persist
    const targetLocation = params.location || 'Whitefield, Bangalore';
    const targetBhk = params.bhk && params.bhk !== 'all' && !isNaN(Number(params.bhk))
      ? Number(params.bhk)
      : null;

    setBaseline(createEmptyBaseline(targetLocation, targetBhk));
    setIsLoading(true);
    setError(null);

    try {
      // Execute search and persist fresh listings in repository
      const fetchedListings = await rentalService.searchListings(params, {
        signal: abortController.signal,
      });

      // Discard if a newer search was initiated
      if (currentSeq !== searchSeqRef.current) return;

      // Fetch freshly computed baseline for the same locality & BHK
      const fetchedBaseline = await rentalService.getMarketBaseline(
        targetLocation,
        targetBhk,
        { signal: abortController.signal }
      );

      // Discard if a newer search was initiated
      if (currentSeq !== searchSeqRef.current) return;

      // Atomically commit matching listings and baseline
      setListings(fetchedListings);
      setBaseline(fetchedBaseline);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Ignored: aborted cleanly by a newer query
        return;
      }
      if (currentSeq === searchSeqRef.current) {
        setError(err.message || 'Failed to communicate with rental baseline engine');
      }
    } finally {
      if (currentSeq === searchSeqRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(searchParams);
  }, []);

  // Handlers
  const handleSearch = (newParams: SearchFilterParams) => {
    setSearchParams(newParams);
    loadData(newParams);
  };

  const handleToggleCompare = (listing: RentalListing) => {
    if (compareListings.some((item) => item.id === listing.id)) {
      setCompareListings((prev) => prev.filter((item) => item.id !== listing.id));
      showToast('Removed from Compare', 'success');
    } else {
      if (compareListings.length >= 4) {
        showToast('Unable to add to comparison (maximum 4 properties)', 'error');
        return;
      }
      setCompareListings((prev) => [...prev, listing]);
      showToast('Added to Compare', 'success');
    }
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from Compare', 'success');
  };

  const handleClearCompare = () => {
    setCompareListings([]);
    showToast('Removed from Compare', 'success');
  };

  const handleToggleSave = (listing: RentalListing) => {
    if (savedIds.includes(listing.id)) {
      setSavedIds((prev) => prev.filter((id) => id !== listing.id));
      showToast('Removed from Saved', 'success');
    } else {
      setSavedIds((prev) => [...prev, listing.id]);
      showToast('Added to Saved', 'success');
    }
  };

  const handleClearSaved = () => {
    setSavedIds([]);
    showToast('Removed from Saved', 'success');
  };

  const savedListings = listings.filter((item) => savedIds.includes(item.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#06090e] text-slate-100 selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          handleSelectTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        compareCount={compareListings.length}
        savedCount={savedIds.length}
      />

      {/* Toast Notification (Section 7 Specification) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-6 z-50 rounded-xl px-4 py-2.5 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 border ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/40 text-rose-300'
              : toast.type === 'warning'
              ? 'bg-slate-900/95 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/95 border-sky-500/40 text-sky-300'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : toast.type === 'error' ? (
            <X className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 animate-in fade-in duration-150">
        {error ? (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <ErrorState
              message={error}
              onRetry={() => loadData(searchParams)}
            />
          </div>
        ) : (
          <>
            {currentTab === 'overview' && (
              <OverviewPage
                listings={listings}
                baseline={baseline}
                onSearch={handleSearch}
                isSearching={isLoading}
                onInspect={(listing) => setSelectedListing(listing)}
                selectedListing={selectedListing}
                onCloseInspect={() => setSelectedListing(null)}
                onToggleCompare={handleToggleCompare}
                compareListings={compareListings}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
                onNavigateTab={handleSelectTab}
              />
            )}

            {currentTab === 'explore' && (
              <ExploreRentalsPage
                listings={listings}
                baseline={baseline}
                onSearch={handleSearch}
                isSearching={isLoading}
                onInspect={(listing) => setSelectedListing(listing)}
                selectedListing={selectedListing}
                onCloseInspect={() => setSelectedListing(null)}
                onToggleCompare={handleToggleCompare}
                compareListings={compareListings}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
                onNavigateTab={handleSelectTab}
                currentParams={searchParams}
              />
            )}

            {currentTab === 'compare' && (
              <ComparePage
                compareListings={compareListings}
                allListings={listings}
                baseline={baseline}
                onRemoveFromCompare={handleRemoveFromCompare}
                onAddToCompare={handleToggleCompare}
                onClearCompare={handleClearCompare}
                onInspect={(listing) => setSelectedListing(listing)}
                selectedListing={selectedListing}
                onCloseInspect={() => setSelectedListing(null)}
                onNavigateTab={handleSelectTab}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
              />
            )}

            {currentTab === 'market-compare' && <MarketComparePage />}

            {currentTab === 'saved' && (
              <SavedPage
                savedListings={savedListings}
                allListings={listings}
                baseline={baseline}
                onToggleSave={handleToggleSave}
                onClearSaved={handleClearSaved}
                onInspect={(listing) => setSelectedListing(listing)}
                selectedListing={selectedListing}
                onCloseInspect={() => setSelectedListing(null)}
                onToggleCompare={handleToggleCompare}
                compareListings={compareListings}
                onNavigateTab={handleSelectTab}
              />
            )}

            {currentTab === 'insights' && <InsightsPage />}

            {currentTab === 'about' && <AboutPage />}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
};

export default App;
