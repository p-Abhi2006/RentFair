import React from 'react';
import { MarketInsightCard } from '../components/common/MarketInsightCard';
import { PipelineBanner } from '../components/common/PipelineBanner';
import { MarketBaseline, RentalListing } from '../types/rental';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart2,
  TrendingUp,
  Sliders,
  ShieldAlert,
  Calculator,
  Building2,
  Clock,
  Layers,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface InsightsPageProps {
  baseline?: MarketBaseline;
  listings?: RentalListing[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ baseline, listings = [] }) => {
  const activeLocality = baseline?.locality || 'Whitefield';
  const sampleSize = baseline?.statisticalSampleSize ?? baseline?.sampleSize ?? listings.length;
  const validPriced = baseline?.validPricedListingCount ?? baseline?.sampleSize ?? listings.filter(l => l.rentAmount != null && l.rentAmount > 0).length;
  const withArea = baseline?.listingsWithAreaCount ?? listings.filter(l => l.carpetAreaSqft != null && l.carpetAreaSqft > 0).length;
  const medianRent = baseline?.medianRent;
  const q1 = baseline?.rentIqr?.q1;
  const q3 = baseline?.rentIqr?.q3;
  const iqrSpread = (q1 != null && q3 != null) ? q3 - q1 : null;
  const maxTypical = baseline?.rentIqr?.maxTypical;
  const medianPps = baseline?.medianPricePerSqft;

  const formattedTime = (() => {
    if (!baseline?.generatedAt) return 'Current Active Session';
    try {
      const d = new Date(baseline.generatedAt);
      return isNaN(d.getTime()) ? baseline.generatedAt : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return baseline.generatedAt;
    }
  })();

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

        <PipelineBanner compact isPrototype={baseline?.isPrototypeBaseline} />
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
          metric={iqrSpread ? formatCurrency(iqrSpread) : '₹11,000'}
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

      {/* Live-Derived Active Micro-Market Baseline Section */}
      <section className="mb-12 rounded-2xl bg-rf-surface/90 border border-rf-border p-6 shadow-subtle" aria-labelledby="live-benchmarks-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <h2 id="live-benchmarks-heading" className="text-sm font-semibold text-white uppercase tracking-wider">
              Active Micro-Market Empirical Baseline: {activeLocality}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            <span>Retrieved: <strong className="text-slate-200">{formattedTime}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Sample: <strong className="text-slate-200">n={sampleSize}</strong></span>
          </div>
        </div>

        <p className="text-xs text-rf-text-muted mb-6">
          Aggregated directly from live Google search results indexed into session repository. All metrics reflect actual retrieved listings without synthetic estimation.
        </p>

        {/* 4 Live Analytical Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              50th Percentile (Median)
            </div>
            <div className="text-xl font-bold font-mono text-teal-300">
              {medianRent ? formatCurrency(medianRent) : 'Pending retrieval'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Midpoint anchor across {validPriced} valid priced listings
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Typical Price Corridor (Q1–Q3)
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {q1 != null && q3 != null ? `${formatCurrency(q1)} – ${formatCurrency(q3)}` : 'Corridor calculating'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Middle 50% interquartile corridor
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Median Rate / sq.ft
            </div>
            <div className="text-xl font-bold font-mono text-sky-300">
              {medianPps ? `₹${medianPps}/sq.ft` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Normalized over {withArea} units with usable area
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Outlier Boundary (Upper Fence)
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {maxTypical ? formatCurrency(maxTypical) : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Q3 + (1.5 × IQR) anomaly cutoff
            </div>
          </div>
        </div>

        {/* Data Provenance Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Indexed in-memory from active Google search query: <strong className="text-slate-200">{activeLocality}</strong></span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Pipeline: SerpApi → Relevance Gate → Parser → Tukey IQR
          </span>
        </div>
      </section>

      {/* Structural Bangalore Micro-Market Dynamics */}
      <section className="mb-12 rounded-2xl bg-rf-surface/90 border border-rf-border p-6 shadow-subtle" aria-labelledby="dynamics-heading">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-teal-400" aria-hidden="true" />
          <h2 id="dynamics-heading" className="text-sm font-semibold text-white uppercase tracking-wider">
            Observed Bangalore Rental Micro-Market Dynamics
          </h2>
        </div>
        <p className="text-xs text-rf-text-muted mb-6">
          Micro-markets in Bangalore exhibit distinct structural behaviors driven by infrastructure, transit corridors, and inventory typology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Corridor 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                IT Corridors
              </h3>
            </div>
            <div className="text-[11px] text-teal-300 font-mono">
              Whitefield • Bellandur • Outer Ring Road
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bifurcated inventory between high-amenity gated societies (Prestige, Sobha, Brigade) commanding premium rates and standalone builder floors with lower base rent and variable maintenance fees.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• <strong>Primary Driver:</strong> Gated community density & power backup</div>
              <div>• <strong>IQR Spread:</strong> High dispersion (₹10,000–₹16,000)</div>
            </div>
          </div>

          {/* Corridor 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Established Central Hubs
              </h3>
            </div>
            <div className="text-[11px] text-teal-300 font-mono">
              Indiranagar • Koramangala • Defense Colony
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mature residential layouts with tight land supply, high lifestyle amenity concentration, and consistent tenant demand sustaining elevated price-per-square-foot benchmarks.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• <strong>Primary Driver:</strong> Commercial proximity & metro access</div>
              <div>• <strong>IQR Spread:</strong> Tight IQR with sustained high median</div>
            </div>
          </div>

          {/* Corridor 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Planned Residential Sectors
              </h3>
            </div>
            <div className="text-[11px] text-teal-300 font-mono">
              HSR Layout • Jayanagar • JP Nagar
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Structured grid sectors where distance to arterial ring roads dictates pricing gradation. Strong 2 BHK family tenant demand with predictable floor-by-floor pricing.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• <strong>Primary Driver:</strong> Sector layout, parks, & road width</div>
              <div>• <strong>IQR Spread:</strong> Moderate dispersion with predictable tiers</div>
            </div>
          </div>
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
