import React from 'react';
import { MarketInsightCard } from '../components/common/MarketInsightCard';
import { PipelineBanner } from '../components/common/PipelineBanner';
import {
  BarChart2,
  TrendingUp,
  Sliders,
  ShieldAlert,
  Calculator,
  Building2,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Rental Market Intelligence & Methodology
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical insights into Bangalore rental micro-markets and the mathematical principles governing RentFair evaluations.
          </p>
        </div>

        <PipelineBanner compact />
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <MarketInsightCard
          title="Furnishing Attribute Tracking"
          subtitle="Secondary Quality Attribute"
          metric="Tier Signal"
          metricLabel="Quality & Completeness Indicator"
          description="Furnished units command premium rental rates. RentFair tracks furnishing status to weight evaluation confidence and refine comparable candidate grouping."
          icon={Sliders}
          badge="Confidence Factor"
          colorScheme="teal"
        />

        <MarketInsightCard
          title="Micro-Market Dispersion (IQR Spread)"
          subtitle="Typical Rent Spread in Locality"
          metric="₹11,000"
          metricLabel="Interquartile Range (Q3 - Q1)"
          description="A wide IQR indicates significant variance between gated society inventory and standalone builder floors. Clustering prevents false outlier flags."
          icon={TrendingUp}
          badge="Distribution Spread"
          colorScheme="slate"
        />

        <MarketInsightCard
          title="Outlier Detection Threshold"
          subtitle="Statistical Anomaly Boundary"
          metric="> 1.5 × IQR"
          metricLabel="Tukey Standard Anomaly Filter"
          description="Listings asking greater than Q3 + (1.5 × IQR) are flagged as severe outliers. This alerts renters to speculative pricing."
          icon={ShieldAlert}
          badge="Outlier Formula"
          colorScheme="amber"
        />
      </div>

      {/* Deep-Dive: Locality Micro-Market Price Benchmarks */}
      <section className="mb-12 rounded-2xl bg-rf-surface/90 border border-rf-border p-6 shadow-subtle" aria-labelledby="benchmarks-heading">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <h2 id="benchmarks-heading" className="text-sm font-semibold text-white uppercase tracking-wider">
            Bangalore Rental Micro-Market Indicative Benchmarks
          </h2>
        </div>
        <p className="text-xs text-rf-text-muted mb-6">
          Illustrative baseline reference numbers across key residential hubs in Bangalore.
        </p>

        {/* Mobile Horizontal Scroll Hint */}
        <div className="flex sm:hidden items-center justify-between px-3 py-1.5 border border-rf-border rounded-t-xl bg-rf-bg-primary/95 text-[11px] font-mono text-rf-text-muted">
          <span>← Scroll horizontally to view all configurations →</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-rf-border overscroll-x-contain touch-pan-x">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[700px]">
            <caption className="sr-only">Bangalore rental micro-market benchmarks by locality and bedroom configuration</caption>
            <thead>
              <tr className="border-b border-rf-border bg-rf-bg-primary/95 text-rf-text-secondary uppercase text-[11px]">
                <th scope="col" className="py-3.5 px-4 font-semibold font-sans sticky left-0 z-20 bg-rf-bg-primary shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap">
                  Locality Hub
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold whitespace-nowrap">1 BHK Median</th>
                <th scope="col" className="py-3.5 px-4 font-semibold whitespace-nowrap">2 BHK Median</th>
                <th scope="col" className="py-3.5 px-4 font-semibold whitespace-nowrap">3 BHK Median</th>
                <th scope="col" className="py-3.5 px-4 font-semibold whitespace-nowrap">Rate / sq.ft</th>
                <th scope="col" className="py-3.5 px-4 font-semibold font-sans whitespace-nowrap">Price Volatility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rf-border-subtle text-slate-200">
              <tr className="hover:bg-rf-card/50 transition-colors group">
                <th scope="row" className="py-3 px-4 font-sans font-medium text-white sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850">
                  Whitefield (ITPL / Borewell Rd)
                </th>
                <td className="py-3 px-4 text-teal-300 tabular-nums whitespace-nowrap">₹21,000</td>
                <td className="py-3 px-4 font-bold text-white tabular-nums whitespace-nowrap">₹39,500</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums whitespace-nowrap">₹64,000</td>
                <td className="py-3 px-4 tabular-nums whitespace-nowrap">₹33.50/sqft</td>
                <td className="py-3 px-4 font-sans text-amber-400 whitespace-nowrap">Moderate (+8.2% YoY)</td>
              </tr>
              <tr className="hover:bg-rf-card/50 transition-colors group">
                <th scope="row" className="py-3 px-4 font-sans font-medium text-white sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850">
                  HSR Layout (Sectors 1-7)
                </th>
                <td className="py-3 px-4 text-teal-300 tabular-nums whitespace-nowrap">₹24,500</td>
                <td className="py-3 px-4 font-bold text-white tabular-nums whitespace-nowrap">₹43,000</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums whitespace-nowrap">₹72,000</td>
                <td className="py-3 px-4 tabular-nums whitespace-nowrap">₹38.20/sqft</td>
                <td className="py-3 px-4 font-sans text-amber-400 whitespace-nowrap">High Demand (+12.4% YoY)</td>
              </tr>
              <tr className="hover:bg-rf-card/50 transition-colors group">
                <th scope="row" className="py-3 px-4 font-sans font-medium text-white sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850">
                  Indiranagar (Defense Colony / 100ft)
                </th>
                <td className="py-3 px-4 text-teal-300 tabular-nums whitespace-nowrap">₹28,000</td>
                <td className="py-3 px-4 font-bold text-white tabular-nums whitespace-nowrap">₹52,000</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums whitespace-nowrap">₹88,000</td>
                <td className="py-3 px-4 tabular-nums whitespace-nowrap">₹46.50/sqft</td>
                <td className="py-3 px-4 font-sans text-amber-400 whitespace-nowrap">Premium Stable</td>
              </tr>
              <tr className="hover:bg-rf-card/50 transition-colors group">
                <th scope="row" className="py-3 px-4 font-sans font-medium text-white sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850">
                  Koramangala (Blocks 3, 4, 6)
                </th>
                <td className="py-3 px-4 text-teal-300 tabular-nums whitespace-nowrap">₹27,000</td>
                <td className="py-3 px-4 font-bold text-white tabular-nums whitespace-nowrap">₹48,000</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums whitespace-nowrap">₹80,000</td>
                <td className="py-3 px-4 tabular-nums whitespace-nowrap">₹42.80/sqft</td>
                <td className="py-3 px-4 font-sans text-amber-400 whitespace-nowrap">High (+10.1% YoY)</td>
              </tr>
              <tr className="hover:bg-rf-card/50 transition-colors group">
                <th scope="row" className="py-3 px-4 font-sans font-medium text-white sticky left-0 z-10 bg-rf-surface/95 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.5)] border-r border-rf-border whitespace-nowrap group-hover:bg-slate-850">
                  Bellandur / Outer Ring Road
                </th>
                <td className="py-3 px-4 text-teal-300 tabular-nums whitespace-nowrap">₹22,500</td>
                <td className="py-3 px-4 font-bold text-white tabular-nums whitespace-nowrap">₹41,000</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums whitespace-nowrap">₹68,000</td>
                <td className="py-3 px-4 tabular-nums whitespace-nowrap">₹35.00/sqft</td>
                <td className="py-3 px-4 font-sans text-teal-400 whitespace-nowrap">Normal Range</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Methodology Section: The Math Behind RentFair */}
      <section className="rounded-2xl bg-rf-surface/90 border border-rf-border p-6 shadow-subtle" aria-labelledby="methodology-heading">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <h2 id="methodology-heading" className="text-sm font-semibold text-white uppercase tracking-wider">
            Mathematical Fairness Assessment Formula
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true"></span>
                1. Attribute Normalization
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Raw rental prices are uninformative without standardization. RentFair evaluates carpet area (price per sq.ft) and groups properties by compatible configuration and tiers to establish comparable parity.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true"></span>
                2. Median Instead of Arithmetic Mean
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Real estate averages are easily distorted by ultra-luxury penthouses. RentFair calculates the <strong>50th percentile (Median)</strong> to anchor the true market midpoint resistant to skew.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true"></span>
                3. Interquartile Range (IQR) Boundaries
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed font-mono">
                IQR = Q3 (75th percentile) - Q1 (25th percentile)<br />
                Upper Fence = Q3 + (1.5 × IQR)<br />
                Lower Fence = Q1 - (1.5 × IQR)
              </p>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Any listing exceeding the Upper Fence is categorized as a statistical outlier, indicating artificial price inflation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true"></span>
                4. Confidence Scoring
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Confidence scales based on comparable sample size (logarithmic scaling up to n=15), match tier specificity, and property data completeness.
              </p>
            </div>
          </div>
        </div>

        {/* Data Provenance & Methodology Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
          <p className="text-slate-300">
            RentFair analyzes information returned by live search results. It does not independently verify property availability, ownership, rent, or listing accuracy.
          </p>
        </div>
      </section>
    </div>
  );
};
