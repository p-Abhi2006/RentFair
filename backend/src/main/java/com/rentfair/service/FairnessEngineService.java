package com.rentfair.service;

import com.rentfair.dto.RentalListingDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FairnessEngineService {

    /**
     * Represents the calculated statistical baseline for a comparable listing set.
     */
    public static class BaselineStats {
        private final int sampleSize;
        private final Integer medianRent;
        private final Integer averageRent;
        private final Integer q1;
        private final Integer q3;
        private final Integer iqr;
        private final Integer minTypical;
        private final Integer maxTypical;
        private final Double medianPricePerSqft;
        private final int matchTier;

        public BaselineStats(int sampleSize, Integer medianRent, Integer averageRent,
                             Integer q1, Integer q3, Integer iqr,
                             Integer minTypical, Integer maxTypical,
                             Double medianPricePerSqft, int matchTier) {
            this.sampleSize = sampleSize;
            this.medianRent = medianRent;
            this.averageRent = averageRent;
            this.q1 = q1;
            this.q3 = q3;
            this.iqr = iqr;
            this.minTypical = minTypical;
            this.maxTypical = maxTypical;
            this.medianPricePerSqft = medianPricePerSqft;
            this.matchTier = matchTier;
        }

        public int getSampleSize() { return sampleSize; }
        public Integer getMedianRent() { return medianRent; }
        public Integer getAverageRent() { return averageRent; }
        public Integer getQ1() { return q1; }
        public Integer getQ3() { return q3; }
        public Integer getIqr() { return iqr; }
        public Integer getMinTypical() { return minTypical; }
        public Integer getMaxTypical() { return maxTypical; }
        public Double getMedianPricePerSqft() { return medianPricePerSqft; }
        public int getMatchTier() { return matchTier; }
    }

    private static class ComparableSelection {
        private final List<RentalListingDto> comparables;
        private final int tier;

        public ComparableSelection(List<RentalListingDto> comparables, int tier) {
            this.comparables = comparables;
            this.tier = tier;
        }
    }

    /**
     * Evaluates a full list of listings against each other, strictly excluding each
     * target listing from its own comparable evaluation set.
     */
    public List<RentalListingDto> evaluateAll(List<RentalListingDto> listings) {
        if (listings == null || listings.isEmpty()) {
            return Collections.emptyList();
        }

        for (RentalListingDto target : listings) {
            evaluateListing(target, listings);
        }

        return listings;
    }

    /**
     * Evaluates a single target listing against a candidate pool.
     * The target listing is explicitly and strictly excluded from its own comparable set.
     */
    public void evaluateListing(RentalListingDto target, List<RentalListingDto> candidates) {
        if (target == null) return;

        // 1. Missing or unparseable rent check
        if (target.getRentAmount() == null || target.getRentAmount() <= 0) {
            target.setPricePerSqft(null);
            target.setFairnessScore(null);
            target.setFairnessCategory(null);
            target.setVariancePercentage(null);
            target.setComparableCount(null);
            target.setConfidenceScore(null);
            target.setIsStatisticalOutlier(false);
            target.setFairnessExplanation("Pricing is unlisted or incomplete. Statistical market baseline requires explicitly listed monthly rent.");
            target.setFairnessAnalysisPerformed(false);
            return;
        }

        // Calculate rent/sqft for target strictly when both rent and area are valid
        if (target.getCarpetAreaSqft() != null && target.getCarpetAreaSqft() > 0) {
            double pps = (double) target.getRentAmount() / target.getCarpetAreaSqft();
            target.setPricePerSqft(Math.round(pps * 100.0) / 100.0);
        } else {
            target.setPricePerSqft(null);
        }

        // 2. Select genuine comparables with strict target exclusion
        ComparableSelection selection = selectComparablesWithTier(target, candidates);
        List<RentalListingDto> comparables = selection.comparables;
        int tier = selection.tier;

        if (comparables.isEmpty()) {
            target.setFairnessScore(null);
            target.setFairnessCategory(null);
            target.setVariancePercentage(null);
            target.setComparableCount(0);
            target.setConfidenceScore(calculateConfidence(0, 4, target));
            target.setIsStatisticalOutlier(false);
            target.setFairnessExplanation("No comparable priced listings found in this locality to establish a baseline.");
            target.setFairnessAnalysisPerformed(false);
            return;
        }

        // 3. Compute baseline statistics across selected comparables
        BaselineStats stats = computeBaselineStats(comparables, tier);
        target.setComparableCount(stats.getSampleSize());

        int targetRent = target.getRentAmount();
        int median = stats.getMedianRent();

        // 4. Calculate percentage variance from median: ((rent - median) / median) * 100
        double variance = ((double) (targetRent - median) / median) * 100.0;
        variance = Math.round(variance * 10.0) / 10.0;
        target.setVariancePercentage(variance);

        // 5. Deterministic fairness score formula: max(0, min(100, round(100 - |variance| * 2.0)))
        target.setFairnessScore(calculateFairnessScore(variance));

        // 6. Confidence score: quality & completeness of market comparison evidence
        target.setConfidenceScore(calculateConfidence(stats.getSampleSize(), stats.getMatchTier(), target));

        // 7. Statistical Outlier vs Market Position Separation
        // Outlier status: strictly based on IQR fences [minTypical, maxTypical] with sample sufficiency (N >= 3)
        boolean isOutlier = (stats.getSampleSize() >= 3) && (targetRent < stats.getMinTypical() || targetRent > stats.getMaxTypical());
        target.setIsStatisticalOutlier(isOutlier);

        // Deterministic classification with strict precedence:
        // Outlier fences take first precedence, variance bands categorize in-fence distribution
        String category = determineCategory(targetRent, stats, variance, isOutlier);
        target.setFairnessCategory(category);

        // 8. Deterministic evidence-based explanation
        String explanation = generateExplanation(target, stats, variance, isOutlier, category);
        target.setFairnessExplanation(explanation);
        target.setFairnessAnalysisPerformed(true);
    }

    /**
     * Robust target exclusion helper.
     * Ensures target listing never pollutes its own comparable set.
     * Handles:
     * - Object identity (a == b)
     * - Non-null database / deterministic ID matches
     * - Normalized canonical source URLs
     * - Duplicate records when IDs are null/differ (matching rent, BHK, locality, and title fingerprint)
     */
    public boolean isSameListing(RentalListingDto a, RentalListingDto b) {
        if (a == b) return true;
        if (a == null || b == null) return false;

        // 1. Compare database / deterministic IDs only when both IDs are non-null and non-empty
        boolean hasIdA = a.getId() != null && !a.getId().trim().isEmpty();
        boolean hasIdB = b.getId() != null && !b.getId().trim().isEmpty();
        if (hasIdA && hasIdB && a.getId().trim().equals(b.getId().trim())) {
            return true;
        }

        // 2. Compare canonical source URLs when available
        String normA = normalizeCanonicalUrl(a.getSourceUrl());
        String normB = normalizeCanonicalUrl(b.getSourceUrl());
        boolean hasUrlA = !normA.isEmpty();
        boolean hasUrlB = !normB.isEmpty();

        if (hasUrlA && hasUrlB) {
            if (normA.equalsIgnoreCase(normB)) {
                return true;
            }
            // If both listings have explicit IDs and explicit canonical URLs,
            // and neither IDs nor URLs matched, they are definitively distinct listings.
            if (hasIdA && hasIdB) {
                return false;
            }
        }

        // 3. Duplicate record detection when IDs or URLs are missing/unreliable:
        // When at least one listing has no ID, or at least one listing has no canonical URL:
        // A listing is a duplicate if it shares the same platform, locality, rent, BHK, and title fingerprint.
        if (a.getRentAmount() != null && b.getRentAmount() != null &&
                a.getRentAmount().equals(b.getRentAmount())) {

            boolean bhkMatch = (a.getBhk() == null && b.getBhk() == null) ||
                    (a.getBhk() != null && a.getBhk().equals(b.getBhk()));

            if (bhkMatch) {
                String locA = a.getLocality() != null ? a.getLocality().trim().toLowerCase() : "";
                String locB = b.getLocality() != null ? b.getLocality().trim().toLowerCase() : "";
                boolean locMatch = !locA.isEmpty() && (locA.equals(locB) || locA.contains(locB) || locB.contains(locA));

                if (locMatch) {
                    boolean platformMatch = true;
                    if (a.getSourcePlatform() != null && b.getSourcePlatform() != null &&
                            !a.getSourcePlatform().trim().isEmpty() && !b.getSourcePlatform().trim().isEmpty()) {
                        platformMatch = a.getSourcePlatform().trim().equalsIgnoreCase(b.getSourcePlatform().trim());
                    }

                    if (platformMatch) {
                        if (a.getTitle() != null && b.getTitle() != null &&
                                !a.getTitle().trim().isEmpty() &&
                                a.getTitle().trim().equalsIgnoreCase(b.getTitle().trim())) {
                            return true;
                        }

                        String fpA = generateTitleFingerprint(a.getTitle());
                        String fpB = generateTitleFingerprint(b.getTitle());
                        if (!fpA.isEmpty() && fpA.equals(fpB)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    public String generateTitleFingerprint(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("(?i)\\b(for\\s*rent|rent|for\\s*lease|apartment|flat|unit|property|in|at)\\b", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    public String normalizeCanonicalUrl(String url) {
        if (url == null || url.trim().isEmpty()) return "";
        String clean = url.trim().toLowerCase();
        clean = clean.replaceFirst("^https?://", "");
        clean = clean.replaceFirst("^www\\.", "");
        int qIdx = clean.indexOf('?');
        if (qIdx != -1) clean = clean.substring(0, qIdx);
        int hIdx = clean.indexOf('#');
        if (hIdx != -1) clean = clean.substring(0, hIdx);
        while (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        return clean;
    }

    /**
     * Selects comparable listings following the deterministic cascade:
     * Tier 1: Exact locality + Exact BHK + Compatible Property Type + Area within ±30%
     * Tier 2: Exact locality + Exact BHK + Compatible Property Type (Area relaxed)
     * Tier 3: Exact locality + Exact BHK (Property Type relaxed)
     * Tier 4: Exact locality (BHK relaxed)
     */
    public List<RentalListingDto> selectComparables(RentalListingDto target, List<RentalListingDto> candidates) {
        return selectComparablesWithTier(target, candidates).comparables;
    }

    private ComparableSelection selectComparablesWithTier(RentalListingDto target, List<RentalListingDto> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return new ComparableSelection(Collections.emptyList(), 4);
        }

        String targetLocality = target.getLocality() != null ? target.getLocality().trim().toLowerCase() : "";

        // Base candidate pool: strictly exclude target, require valid rent > 0, match locality
        List<RentalListingDto> pool = candidates.stream()
                .filter(c -> !isSameListing(target, c))
                .filter(c -> c.getRentAmount() != null && c.getRentAmount() > 0)
                .filter(c -> {
                    if (targetLocality.isEmpty()) return true;
                    String candLoc = c.getLocality() != null ? c.getLocality().trim().toLowerCase() : "";
                    return candLoc.equals(targetLocality) || candLoc.contains(targetLocality) || targetLocality.contains(candLoc);
                })
                .toList();

        if (pool.isEmpty()) {
            return new ComparableSelection(Collections.emptyList(), 4);
        }

        Integer targetBhk = target.getBhk();
        Integer targetArea = target.getCarpetAreaSqft();

        // Tier 1 (Strict): Exact BHK + Compatible Property Type + Area ±30%
        if (targetBhk != null) {
            List<RentalListingDto> tier1 = pool.stream()
                    .filter(c -> targetBhk.equals(c.getBhk()))
                    .filter(c -> isPropertyTypeCompatible(target.getPropertyType(), c.getPropertyType()))
                    .filter(c -> {
                        if (targetArea == null || targetArea <= 0) return true;
                        if (c.getCarpetAreaSqft() == null || c.getCarpetAreaSqft() <= 0) return false;
                        double ratio = (double) c.getCarpetAreaSqft() / targetArea;
                        return ratio >= 0.70 && ratio <= 1.30;
                    })
                    .toList();

            if (tier1.size() >= 3) {
                return new ComparableSelection(tier1, 1);
            }

            // Tier 2: Exact BHK + Compatible Property Type (Area relaxed)
            List<RentalListingDto> tier2 = pool.stream()
                    .filter(c -> targetBhk.equals(c.getBhk()))
                    .filter(c -> isPropertyTypeCompatible(target.getPropertyType(), c.getPropertyType()))
                    .toList();

            if (tier2.size() >= 3) {
                return new ComparableSelection(tier2, 2);
            }

            // Tier 3: Exact BHK Match in locality (Property type relaxed)
            List<RentalListingDto> tier3 = pool.stream()
                    .filter(c -> targetBhk.equals(c.getBhk()))
                    .toList();

            if (!tier3.isEmpty()) {
                return new ComparableSelection(tier3, 3);
            }
        }

        // Tier 4: Locality pool (BHK relaxed)
        return new ComparableSelection(pool, 4);
    }

    public boolean isPropertyTypeCompatible(String typeA, String typeB) {
        if (typeA == null || typeB == null) return true;
        String a = typeA.trim().toUpperCase();
        String b = typeB.trim().toUpperCase();
        if (a.equals(b)) return true;

        boolean aMulti = a.equals("APARTMENT") || a.equals("GATED_COMMUNITY") || a.equals("BUILDER_FLOOR");
        boolean bMulti = b.equals("APARTMENT") || b.equals("GATED_COMMUNITY") || b.equals("BUILDER_FLOOR");
        if (aMulti && bMulti) return true;

        boolean aLanded = a.equals("VILLA") || a.equals("INDEPENDENT_HOUSE");
        boolean bLanded = b.equals("VILLA") || b.equals("INDEPENDENT_HOUSE");
        if (aLanded && bLanded) return true;

        if ((a.equals("STUDIO") || b.equals("STUDIO")) && (a.equals("APARTMENT") || b.equals("APARTMENT"))) {
            return true;
        }

        return false;
    }

    /**
     * Computes Tukey quartiles, IQR, median, average, and price/sqft statistics.
     */
    public BaselineStats computeBaselineStats(List<RentalListingDto> comparables, int matchTier) {
        if (comparables == null || comparables.isEmpty()) {
            return new BaselineStats(0, null, null, null, null, null, null, null, null, matchTier);
        }

        List<Integer> rents = comparables.stream()
                .map(RentalListingDto::getRentAmount)
                .filter(r -> r != null && r > 0)
                .sorted()
                .toList();

        int n = rents.size();
        if (n == 0) {
            return new BaselineStats(0, null, null, null, null, null, null, null, null, matchTier);
        }

        // Median rent
        int medianRent;
        if (n % 2 == 0) {
            medianRent = (rents.get(n / 2 - 1) + rents.get(n / 2)) / 2;
        } else {
            medianRent = rents.get(n / 2);
        }

        // Average rent
        long sum = 0;
        for (int r : rents) sum += r;
        int averageRent = (int) Math.round((double) sum / n);

        // Tukey Quartiles (splitting into lower and upper halves)
        int q1;
        int q3;
        if (n == 1) {
            q1 = rents.get(0);
            q3 = rents.get(0);
        } else {
            List<Integer> lowerHalf = rents.subList(0, n / 2);
            List<Integer> upperHalf = (n % 2 == 0) ? rents.subList(n / 2, n) : rents.subList(n / 2 + 1, n);

            q1 = computeMedian(lowerHalf);
            q3 = computeMedian(upperHalf);
        }

        int iqr = Math.max(0, q3 - q1);
        int minTypical = Math.max(0, q1 - (int) Math.round(1.5 * iqr));
        int maxTypical = q3 + (int) Math.round(1.5 * iqr);

        // Median rent / sqft (strictly from listings with BOTH valid rent AND area)
        List<Double> validPps = comparables.stream()
                .filter(c -> c.getRentAmount() != null && c.getRentAmount() > 0 &&
                        c.getCarpetAreaSqft() != null && c.getCarpetAreaSqft() > 0)
                .map(c -> (double) c.getRentAmount() / c.getCarpetAreaSqft())
                .sorted()
                .toList();

        Double medianPps = null;
        if (!validPps.isEmpty()) {
            int pSize = validPps.size();
            double pVal = (pSize % 2 == 0)
                    ? (validPps.get(pSize / 2 - 1) + validPps.get(pSize / 2)) / 2.0
                    : validPps.get(pSize / 2);
            medianPps = Math.round(pVal * 100.0) / 100.0;
        }

        return new BaselineStats(n, medianRent, averageRent, q1, q3, iqr, minTypical, maxTypical, medianPps, matchTier);
    }

    private int computeMedian(List<Integer> list) {
        int sz = list.size();
        if (sz == 0) return 0;
        if (sz % 2 == 0) {
            return (list.get(sz / 2 - 1) + list.get(sz / 2)) / 2;
        } else {
            return list.get(sz / 2);
        }
    }

    /**
     * Deterministic fairness score formula:
     * max(0, min(100, round(100 - |variance| * 2.0)))
     */
    public Integer calculateFairnessScore(Double variance) {
        if (variance == null) return null;
        int score = (int) Math.round(100.0 - Math.abs(variance) * 2.0);
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Deterministic confidence score representing the quality and completeness of market comparison evidence.
     * Does NOT represent probability that the rent is fair.
     */
    public Double calculateConfidence(int sampleSize, int matchTier, RentalListingDto target) {
        if (target == null || target.getRentAmount() == null) {
            return null;
        }

        // 1. Sample Size Weight (Max 0.50)
        double sampleWeight;
        if (sampleSize >= 10) {
            sampleWeight = 0.50;
        } else if (sampleSize >= 5) {
            sampleWeight = 0.35;
        } else if (sampleSize >= 3) {
            sampleWeight = 0.20;
        } else if (sampleSize >= 1) {
            sampleWeight = 0.10;
        } else {
            sampleWeight = 0.00;
        }

        // 2. Match Quality Weight (Max 0.30)
        double matchWeight;
        switch (matchTier) {
            case 1: matchWeight = 0.30; break;
            case 2: matchWeight = 0.20; break;
            case 3: matchWeight = 0.15; break;
            case 4:
            default: matchWeight = 0.10; break;
        }

        // 3. Target Data Completeness Weight (Max 0.20)
        double completeness = 0.08; // rent is present
        if (target.getCarpetAreaSqft() != null && target.getCarpetAreaSqft() > 0) completeness += 0.06;
        if (target.getFurnishing() != null && !target.getFurnishing().isEmpty()) completeness += 0.03;
        if (target.getBathrooms() != null && target.getBathrooms() > 0) completeness += 0.03;

        double total = sampleWeight + matchWeight + completeness;
        if (sampleSize < 3) {
            total = Math.min(0.40, total);
        }
        return Math.round(Math.min(1.00, Math.max(0.00, total)) * 100.0) / 100.0;
    }

    /**
     * Classifies listing into 5 statistical tiers with strict precedence:
     * 1. Outside IQR fence [minTypical, maxTypical] => Outlier takes precedence
     * 2. In-fence => Variance bands categorize market position
     */
    public String determineCategory(int rent, BaselineStats stats, double variance, boolean isOutlier) {
        if (isOutlier) {
            if (rent < stats.getMinTypical()) {
                return "SIGNIFICANTLY_BELOW_TYPICAL";
            } else {
                return "SIGNIFICANTLY_ABOVE_TYPICAL";
            }
        }

        // In-fence classification based strictly on median variance
        if (variance < -25.0) {
            return "SIGNIFICANTLY_BELOW_TYPICAL";
        } else if (variance < -15.0) {
            return "BELOW_TYPICAL";
        } else if (variance <= 10.0) {
            return "FAIR";
        } else if (variance <= 25.0) {
            return "ABOVE_TYPICAL";
        } else {
            return "SIGNIFICANTLY_ABOVE_TYPICAL";
        }
    }

    /**
     * Generates a concise evidence-based explanation from calculated values without subjective commentary.
     */
    public String generateExplanation(RentalListingDto target, BaselineStats stats,
                                      double variance, boolean isOutlier, String category) {
        int rent = target.getRentAmount();
        int median = stats.getMedianRent();
        int n = stats.getSampleSize();
        String bhkStr = target.getBhk() != null ? target.getBhk() + " BHK " : "";

        String formattedVariance = (variance >= 0 ? "+" : "") + String.format(Locale.US, "%.1f", variance) + "%";

        if (n < 3) {
            return String.format(Locale.US,
                    "Limited comparable sample: only %d %slisting(s) available in this locality tier. Median ₹%,d/mo establishes an indicative baseline with wider variance.",
                    n, bhkStr, median);
        }

        if (isOutlier) {
            if (rent > stats.getMaxTypical()) {
                return String.format(Locale.US,
                        "Asking ₹%,d/mo is a statistical upper outlier (%s vs median ₹%,d/mo) exceeding the upper fence (₹%,d/mo) across %d comparable %slistings.",
                        rent, formattedVariance, median, stats.getMaxTypical(), n, bhkStr);
            } else {
                return String.format(Locale.US,
                        "Asking ₹%,d/mo is a statistical lower outlier (%s vs median ₹%,d/mo) below the lower fence (₹%,d/mo) across %d comparable %slistings.",
                        rent, formattedVariance, median, stats.getMinTypical(), n, bhkStr);
            }
        }

        // In-fence explanations
        if ("FAIR".equals(category)) {
            return String.format(Locale.US,
                    "Asking ₹%,d/mo aligns with the locality median (₹%,d/mo, variance %s) across %d comparable %slistings (typical range: ₹%,d - ₹%,d/mo).",
                    rent, median, formattedVariance, n, bhkStr, stats.getMinTypical(), stats.getMaxTypical());
        }

        if ("BELOW_TYPICAL".equals(category) || "SIGNIFICANTLY_BELOW_TYPICAL".equals(category)) {
            return String.format(Locale.US,
                    "Asking ₹%,d/mo is %s below the locality median (₹%,d/mo) across %d comparable %slistings (typical range: ₹%,d - ₹%,d/mo).",
                    rent, formattedVariance, median, n, bhkStr, stats.getMinTypical(), stats.getMaxTypical());
        }

        return String.format(Locale.US,
                "Asking ₹%,d/mo is %s above the locality median (₹%,d/mo) across %d comparable %slistings (typical range: ₹%,d - ₹%,d/mo).",
                rent, formattedVariance, median, n, bhkStr, stats.getMinTypical(), stats.getMaxTypical());
    }
}
