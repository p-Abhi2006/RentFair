import React from 'react';
import { NavTab } from './Navbar';
import { ShieldCheck, Database, Server, GitBranch } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-rf-border bg-rf-bg-primary mt-auto text-xs text-rf-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-rf-text-primary">RentFair</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950/80 text-rf-teal border border-teal-800 font-semibold">
                Market Baseline Model
              </span>
            </div>
            <p className="text-rf-text-muted max-w-md leading-relaxed text-xs">
              RentFair provides rental price fairness intelligence by collecting live market listings via SerpApi, normalizing property attributes, establishing local IQR baselines, and detecting price anomalies.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-rf-text-muted">
              <span className="flex items-center gap-1.5 text-rf-text-secondary">
                <Database className="w-3.5 h-3.5 text-rf-teal" aria-hidden="true" />
                H2 (local development)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-rf-text-secondary">
                <Server className="w-3.5 h-3.5 text-rf-teal" aria-hidden="true" />
                Java + Spring Boot
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-rf-text-secondary">
                <GitBranch className="w-3.5 h-3.5 text-rf-teal" aria-hidden="true" />
                Live SerpApi Pipeline
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('overview')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Overview & Search
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('explore')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Explore Rentals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('compare')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Side-by-Side Compare
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('market-compare')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Market Comparison
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('saved')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Saved Watchlist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('insights')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Market Insights
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('about')}
                  className="hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                >
                  Pipeline Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Data Disclosures */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
              Integrity Notice
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              RentFair analyzes information returned by live search results. It does not independently verify property availability, ownership, rent, or listing accuracy.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-sans">
              All baseline models derived directly from live search results and deterministic statistical analysis.
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} RentFair Intelligence. Analytical Rental Valuation Platform.</span>
          <span className="font-mono">Tukey IQR Standard • Median Parity Indexing</span>
        </div>
      </div>
    </footer>
  );
};
