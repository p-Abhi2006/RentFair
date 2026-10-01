export type FairnessCategory = 
  | 'SIGNIFICANTLY_BELOW_TYPICAL'
  | 'BELOW_TYPICAL'
  | 'FAIR'
  | 'ABOVE_TYPICAL'
  | 'SIGNIFICANTLY_ABOVE_TYPICAL'
  // Legacy compatibility aliases
  | 'HIGHLY_COMPETITIVE'
  | 'SLIGHTLY_HIGH'
  | 'OVERPRICED'
  | 'EXTREME_OUTLIER';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export type PropertyType = 
  | 'APARTMENT' 
  | 'GATED_COMMUNITY' 
  | 'INDEPENDENT_HOUSE' 
  | 'VILLA' 
  | 'STUDIO' 
  | 'BUILDER_FLOOR';

export interface RentalListing {
  id: string;
  title: string;
  locality: string;
  subLocality?: string;
  city?: string | null;
  rentAmount: number | null; // in INR / local currency. Null if unavailable. Never 0.
  depositAmount: number | null;
  bhk: number | null; // 1, 2, 3, 4
  propertyType: PropertyType | null;
  carpetAreaSqft: number | null;
  furnishing: FurnishingStatus | null;
  bathrooms: number | null;
  pricePerSqft: number | null; // rentAmount / carpetAreaSqft
  fairnessScore: number | null; // 0 to 100 index (100 = optimal market value)
  fairnessCategory: FairnessCategory | null;
  variancePercentage: number | null; // e.g. +12.5% or -8.2% relative to market median
  confidenceScore: number | null; // 0.0 - 1.0 based on evidence quality
  comparableCount: number | null;
  fairnessExplanation?: string;
  isStatisticalOutlier?: boolean;
  features: string[];
  sourcePlatform: '99acres' | 'MagicBricks' | 'Housing.com' | 'NoBroker' | 'Aggregated SerpApi' | string;
  sourceUrl?: string;
  imageUrl?: string;
  scrapedAt: string;
  retrievalTimestamp?: string;
  extractionStatus?: 'COMPLETE' | 'PARTIAL' | 'MINIMAL' | string;
  priceExplicitlyExtracted?: boolean;
  areaExplicitlyExtracted?: boolean;
  fairnessAnalysisPerformed?: boolean;
  isPlaceholder?: boolean;
  snippet?: string;
}

export interface MarketBaseline {
  locality: string;
  city?: string | null;
  bhk: number;
  propertyType?: PropertyType;
  sampleSize: number;
  sourceListingCount?: number;
  validPricedListingCount?: number;
  listingsWithAreaCount?: number;
  statisticalSampleSize?: number;
  medianRent: number | null;
  averageRent: number | null;
  medianPricePerSqft: number | null;
  rentIqr: {
    q1: number;       // 25th percentile
    q3: number;       // 75th percentile
    minTypical: number; // Q1 - 1.5*IQR bound
    maxTypical: number; // Q3 + 1.5*IQR bound
  } | null;
  priceDistribution: {
    bracket: string;
    count: number;
    percentage: number;
  }[];
  generatedAt: string;
  isPrototypeBaseline: boolean;
}

export interface SearchFilterParams {
  location: string;
  bhk: string; // 'all' | '1' | '2' | '3' | '4+'
  propertyType: string; // 'all' | PropertyType
  minRent?: number;
  maxRent?: number;
  minArea?: number;
  maxArea?: number;
  furnishing: string; // 'all' | FurnishingStatus
  sortBy: 'fairness' | 'price_low' | 'price_high' | 'area_desc' | 'variance_asc';
}

export interface FairnessAnalysisSummary {
  propertyId?: string;
  targetPrice: number;
  targetPricePerSqft: number;
  localityMedian: number;
  localityMedianPerSqft: number;
  variancePercentage: number;
  assessment: FairnessCategory;
  explanation: string;
  comparablesSampled: number;
  methodologyNotes: string[];
}

// ----------------------------------------------------------------------
// Multi-Locality Market Comparison Types
// ----------------------------------------------------------------------

export interface LocationComparisonRequest {
  locations: string[];
  bhk?: number | null;
  propertyType?: string;
  furnishing?: string;
  minArea?: number | null;
  maxArea?: number | null;
}

export interface LocalityMarketStats {
  locality: string;
  city?: string | null;
  totalListingCount: number;
  sourceListingCount?: number;
  validPricedListingCount: number;
  listingsWithAreaCount: number;
  sampleSize: number;
  statisticalSampleSize?: number;
  medianRent: number | null;
  averageRent: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  minTypical: number | null;
  maxTypical: number | null;
  medianPricePerSqft: number | null;
  dataTimestamp: string;
  dataQuality: 'ROBUST' | 'MODERATE' | 'INDICATIVE' | 'LIMITED' | 'INSUFFICIENT' | string;
  dataQualityDescription: string;
  sampleListings?: RentalListing[];
}

export interface MetricLeader {
  locality: string;
  metricName: string;
  metricValue: string;
  numericValue: number | null;
}

export interface MarketComparisonSummary {
  lowestMedianRent?: MetricLeader;
  highestMedianRent?: MetricLeader;
  rentSpread?: number;
  rentSpreadDescription?: string;
  lowestPricePerSqft?: MetricLeader;
  highestPricePerSqft?: MetricLeader;
  pricePerSqftSpread?: number;
  pricePerSqftSpreadDescription?: string;
  observations: string[];
}

export interface LocationComparisonResponse {
  bhk: number | null;
  propertyType?: string;
  furnishing?: string;
  minArea?: number | null;
  maxArea?: number | null;
  generatedAt: string;
  localities: LocalityMarketStats[];
  comparisonSummary: MarketComparisonSummary | null;
}

