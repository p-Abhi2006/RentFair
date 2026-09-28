import React from 'react';
import { PipelineBanner } from '../components/common/PipelineBanner';
import {
  ShieldCheck,
  Server,
  Database,
  FileCheck2,
  Cpu,
  Layers,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              About RentFair
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rental price fairness intelligence designed to restore balance in tenant-landlord dynamics.
          </p>
        </div>

        <PipelineBanner compact />
      </div>

      {/* Mission & Purpose */}
      <div className="rounded-2xl bg-rf-surface/90 border border-rf-border p-6 sm:p-7 shadow-subtle mb-8">
        <h2 className="text-base font-bold text-white mb-2">The Product Concept</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl font-normal">
          In competitive metropolitan rental markets like Bangalore, asking prices fluctuate wildly with limited transparency. Prospective tenants frequently encounter substantial markups with no empirical benchmark to evaluate whether an asking rent is objectively fair or artificially inflated.
        </p>
        <p className="text-xs sm:text-sm text-rf-text-muted leading-relaxed max-w-4xl mt-3 font-normal">
          <strong className="text-slate-200">RentFair</strong> addresses this by aggregating live rental listings from Google Search via <strong className="text-slate-200">SerpApi</strong>, normalizing property attributes (carpet area, furnishing, security deposits), calculating local market baselines using robust statistical metrics (50th percentile Median and Tukey Interquartile Range), detecting price outliers, and explaining the evaluation with mathematical clarity.
        </p>
      </div>

      {/* The 6-Step Ingestion & Analysis Architecture */}
      <div className="rounded-2xl bg-rf-surface/90 border border-rf-border p-6 sm:p-7 shadow-subtle mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" aria-hidden="true" />
          The Core Ingestion & Analysis Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">01. Search Listings</span>
            <h3 className="font-semibold text-slate-200 text-sm">Query Target Locality</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Accepts renter search parameters (e.g. "Whitefield, Bangalore", 2 BHK) and retrieves indexed rental listings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">02. Collect Live Data</span>
            <h3 className="font-semibold text-slate-200 text-sm">SerpApi Ingestion</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Extracts real-time listing metadata across real estate platforms without fragile site-specific scrapers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">03. Normalize Information</span>
            <h3 className="font-semibold text-slate-200 text-sm">Attribute Standardization</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Extracts and standardizes carpet sqft, furnishing tier, and deposit amounts from unstructured listing text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">04. Identify Comparables</span>
            <h3 className="font-semibold text-slate-200 text-sm">Comparable Clustering</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Filters extracted comparable properties within matching locality and bedroom configurations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">05. Calculate Baseline</span>
            <h3 className="font-semibold text-slate-200 text-sm">Median & IQR Engine</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Computes locality 50th percentile median and 25th-75th quartile corridor to form an objective market baseline.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border hover:border-teal-500/40 transition-colors">
            <span className="font-mono text-teal-400 font-bold text-xs block mb-1">06. Outlier & Explanation</span>
            <h3 className="font-semibold text-slate-200 text-sm">Actionable Intelligence</h3>
            <p className="text-rf-text-muted mt-1 leading-relaxed">
              Detects price anomalies, flags statistical outliers via Tukey fences, and equips tenants with factual evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="rounded-2xl bg-rf-surface/90 border border-rf-border p-6 sm:p-7 shadow-subtle mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-400" aria-hidden="true" />
          Technical Stack
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs mb-2">
              <Cpu className="w-4 h-4" aria-hidden="true" />
              <span>Frontend Layer</span>
            </div>
            <ul className="text-xs text-rf-text-muted space-y-1.5 font-mono">
              <li>• React 18 + Vite</li>
              <li>• TypeScript strict mode</li>
              <li>• Tailwind CSS design system</li>
              <li>• Accessible SVG gauge visualizations</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs mb-2">
              <Server className="w-4 h-4" aria-hidden="true" />
              <span>Backend Core</span>
            </div>
            <ul className="text-xs text-rf-text-muted space-y-1.5 font-mono">
              <li>• Java 21 + Spring Boot 3.3.x</li>
              <li>• Spring Web REST Controllers</li>
              <li>• Deterministic statistical engine</li>
              <li>• Lightweight memory caching</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-rf-bg-primary/80 border border-rf-border">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs mb-2">
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>Data & Pipeline</span>
            </div>
            <ul className="text-xs text-rf-text-muted space-y-1.5 font-mono">
              <li>• H2 in-memory (local development)</li>
              <li>• SerpApi real-time Google search</li>
              <li>• Tukey IQR outlier boundaries</li>
              <li>• Zero synthetic data generation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Strict Anti-Synthetic-Data Commitment & Methodology Notice */}
      <div className="rounded-2xl border border-teal-900/50 bg-teal-950/20 p-5 flex items-start gap-3 shadow-subtle">
        <FileCheck2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-xs font-semibold text-teal-200">
            Commitment to Real Market Data & Provenance Transparency
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            RentFair analyzes information returned by live search results. It does not independently verify property availability, ownership, rent, or listing accuracy.
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            All evaluations and baseline metrics are derived directly from live, normalized web search listings processed through deterministic statistical analysis without external LLMs, mock records, or hallucinated numbers.
          </p>
        </div>
      </div>
    </div>
  );
};
