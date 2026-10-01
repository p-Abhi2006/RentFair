import React, { useState } from 'react';
import {
  Scale,
  Compass,
  Bookmark,
  BarChart2,
  Info,
  Menu,
  X,
  Layers,
  ChevronRight,
  GitCompare,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'overview' | 'explore' | 'compare' | 'market-compare' | 'saved' | 'insights' | 'about';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  compareCount: number;
  savedCount: number;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  compareCount,
  savedCount,
  isDemoMode = false,
  onToggleDemoMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Layers },
    { id: 'explore' as NavTab, label: 'Explore Rentals', icon: Compass },
    { id: 'compare' as NavTab, label: 'Compare', icon: Scale, count: compareCount },
    { id: 'market-compare' as NavTab, label: 'Market Compare', icon: GitCompare },
    { id: 'saved' as NavTab, label: 'Saved', icon: Bookmark, count: savedCount },
    { id: 'insights' as NavTab, label: 'Insights', icon: BarChart2 },
    { id: 'about' as NavTab, label: 'About', icon: Info },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rf-border bg-rf-bg-primary/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Platform Title */}
          <div
            onClick={() => handleNavClick('overview')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick('overview'); }}
            aria-label="RentFair Intelligence - Navigate to overview"
            className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal rounded-xl p-1 -ml-1 transition-all"
          >
            {/* Precision Geometric Balance Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rf-teal to-teal-800 p-0.5 shadow-subtle group-hover:from-rf-teal-bright group-hover:to-rf-teal transition-all">
              <div className="w-full h-full bg-rf-bg-primary rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-rf-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v18" />
                  <path d="M5 8l7-2 7 2" />
                  <path d="M3 14l2-6 2 6a2 2 0 0 1-4 0z" />
                  <path d="M17 14l2-6 2 6a2 2 0 0 1-4 0z" />
                  <circle cx="12" cy="20" r="1" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-rf-text-primary font-sans">
                  RentFair
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-teal-950/80 text-rf-teal border border-teal-800/70 font-semibold tracking-wider">
                  Intelligence
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-rf-text-muted font-mono tracking-tight">
                Rental Price Fairness Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal ${
                    isActive
                      ? 'bg-rf-surface-elevated text-rf-text-primary font-semibold shadow-subtle border border-rf-border'
                      : 'text-rf-text-muted hover:text-rf-text-primary hover:bg-rf-surface'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rf-teal' : 'text-rf-text-muted'}`} aria-hidden="true" />
                  <span>{item.label}</span>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`ml-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-rf-teal text-slate-950'
                          : 'bg-rf-surface text-rf-text-secondary border border-rf-border'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Badges: Pipeline Status & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {onToggleDemoMode ? (
              <button
                type="button"
                onClick={onToggleDemoMode}
                title={isDemoMode ? "Click to switch to live SerpApi engine" : "Click to switch to verified demo dataset"}
                className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                  isDemoMode
                    ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-950/70'
                    : 'bg-rf-surface border-rf-border text-rf-text-secondary hover:border-rf-teal/50 hover:text-teal-300'
                }`}
              >
                {isDemoMode ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-rf-teal animate-pulse" aria-hidden="true"></span>
                )}
                <span>{isDemoMode ? 'Demo Dataset' : 'Live SerpApi'}</span>
                <span className="text-[10px] text-rf-text-muted">⇄</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rf-surface border border-rf-border text-[11px] font-mono text-rf-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-rf-teal animate-pulse" aria-hidden="true"></span>
                <span className="text-rf-text-secondary">Live SerpApi Data</span>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-rf-surface border border-rf-border text-rf-text-muted hover:text-rf-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rf-border bg-rf-bg-primary px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rf-text-muted px-3 py-1 font-semibold">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rf-teal ${
                  isActive
                    ? 'bg-rf-surface-elevated text-rf-teal font-semibold border border-rf-border'
                    : 'text-rf-text-secondary hover:bg-rf-surface hover:text-rf-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rf-teal' : 'text-rf-text-muted'}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-950 text-rf-teal-bright border border-teal-800">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600" aria-hidden="true" />
                </div>
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-rf-border px-3 flex items-center justify-between text-xs text-rf-text-muted font-mono">
            <span>Data Engine:</span>
            {onToggleDemoMode ? (
              <button
                type="button"
                onClick={onToggleDemoMode}
                className="text-rf-teal underline flex items-center gap-1"
              >
                <span>{isDemoMode ? 'Demo Dataset (Switch to Live)' : 'Live SerpApi (Switch to Demo)'}</span>
              </button>
            ) : (
              <span className="text-rf-teal">Live SerpApi Pipeline</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
