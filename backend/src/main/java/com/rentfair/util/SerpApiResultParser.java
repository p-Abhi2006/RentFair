package com.rentfair.util;

import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.dto.RentalListingDto;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SerpApiResultParser {

    private static final Pattern RENT_LAKH_PATTERN = Pattern.compile(
            "(?:rent(?:al)?[:\\s]*(?:is|of)?[:\\s]*)?(?:₹|Rs\\.?|INR|[?]\\?)?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*(?:l|lac|lakhs?)(?:\\s*/\\s*mo|\\s*/\\s*month|\\s*pm|\\s*per\\s*month)?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern RENT_PER_MONTH_PATTERN = Pattern.compile(
            "(?:(?:₹|Rs\\.?|INR|[?]\\?)\\s*)?([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,3},[0-9]{3}|[0-9]{4,6})\\s*(?:/\\s*month|/\\s*mo|per\\s*month|\\s*pm\\b)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern RENT_K_PATTERN = Pattern.compile(
            "(?:rent(?:al)?[:\\s]*)?([0-9]{1,3})\\s*k(?:\\s*/\\s*mo|\\s*pm|\\s*per\\s*month|\\s*/\\s*month)?",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern RENT_INR_PATTERN = Pattern.compile(
            "(?:₹|Rs\\.?|INR|[?]\\?)\\s*([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,3},[0-9]{3}|[0-9]{4,6})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DEPOSIT_INR_PATTERN = Pattern.compile(
            "(?:deposit|security\\s*deposit)[:\\s]*(?:₹|Rs\\.?|INR|[?]\\?)?\\s*([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,3},[0-9]{3}|[0-9]{4,6})",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DEPOSIT_LAKH_PATTERN = Pattern.compile(
            "(?:deposit|security\\s*deposit)[:\\s]*(?:₹|Rs\\.?|INR|[?]\\?)?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*(?:l|lac|lakhs?)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern AREA_PATTERN = Pattern.compile(
            "(?:carpet(?:\\s*area)?|built-?up(?:\\s*area)?|super\\s*built-?up)?[:\\s]*([0-9]{1,2},[0-9]{3}|[0-9]{3,4})\\s*(?:sq\\s*ft|sqft|sq\\.ft|sq\\.\\s*ft\\.?|square\\s*feet|square\\s*foot|sq\\s*feet)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BHK_PATTERN = Pattern.compile(
            "([1-5])\\s*[-]?\\s*(?:bhk|bed|bedroom|b|br)s?\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BATHROOM_PATTERN = Pattern.compile(
            "([1-5])\\s*[-]?\\s*(?:bath|bathroom|washroom)s?\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SECTOR_PATTERN = Pattern.compile(
            "\\b(sector\\s*[0-9]{1,3}[a-z]?|phase\\s*[1-9]|block\\s*[a-z0-9]+|pocket\\s*[a-z0-9]+|stage\\s*[1-9])\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final List<String> COMMON_FEATURES = List.of(
            "Power Backup", "Gated Security", "Lift", "Car Parking", "Covered Parking",
            "Gymnasium", "Gym", "Swimming Pool", "Balcony", "Clubhouse", "Modular Kitchen",
            "Security", "Park", "CCTV", "Intercom", "Gas Pipeline", "Rainwater Harvesting"
    );

    private static final Set<String> TRACKING_QUERY_PARAMS = Set.of(
            "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
            "ref", "ref_", "fbclid", "gclid", "source", "campaign", "trk"
    );

    /**
     * Converts raw SerpApi organic results into clean, deduplicated RentalListingDto items.
     * Never hallucinates or infers missing values.
     * Preserves null when fields cannot be reliably extracted.
     * Deduplication strategy is conservative: canonical URL is primary; secondary requires identical title fingerprint + platform + rent.
     */
    public List<RentalListingDto> parseResults(List<SerpApiOrganicResult> rawResults, String searchLocation, String requestedBhk) {
        List<RentalListingDto> listings = new ArrayList<>();
        if (rawResults == null || rawResults.isEmpty()) {
            return listings;
        }

        Set<String> seenUrls = new HashSet<>();
        Set<String> seenSecondarySignatures = new HashSet<>();

        for (int i = 0; i < rawResults.size(); i++) {
            SerpApiOrganicResult raw = rawResults.get(i);
            if (raw.getTitle() == null && raw.getLink() == null) {
                continue;
            }

            RentalListingDto dto = parseSingleResult(raw, i, searchLocation, requestedBhk);

            // 1. Primary definitive deduplication signal: Normalized Canonical URL
            String rawLink = raw.getLink() != null ? raw.getLink().trim() : "";
            String canonicalUrl = normalizeUrl(rawLink);
            if (!canonicalUrl.isEmpty()) {
                if (!isGenericPortalUrl(canonicalUrl)) {
                    if (seenUrls.contains(canonicalUrl)) {
                        continue; // Skip exact duplicate canonical URL
                    }
                    seenUrls.add(canonicalUrl);
                }
            }

            // 2. Conservative secondary deduplication signal:
            // Different properties legitimately share rent, BHK, and locality.
            // Therefore, secondary deduplication strictly requires matching sourcePlatform AND matching title fingerprint AND locality AND rent.
            if (dto.getRentAmount() != null && dto.getRentAmount() > 0 &&
                    dto.getTitle() != null && !dto.getTitle().isEmpty() &&
                    dto.getSourcePlatform() != null && !dto.getSourcePlatform().isEmpty() &&
                    dto.getLocality() != null && !dto.getLocality().isEmpty()) {
                String titleFingerprint = generateTitleFingerprint(dto.getTitle());
                if (!titleFingerprint.isEmpty()) {
                    String secondaryKey = dto.getSourcePlatform().toLowerCase() + "|" +
                            dto.getLocality().toLowerCase() + "|" +
                            dto.getRentAmount() + "|" +
                            titleFingerprint;
                    if (seenSecondarySignatures.contains(secondaryKey)) {
                        continue; // Skip identical listing cross-posted under different URL parameters
                    }
                    seenSecondarySignatures.add(secondaryKey);
                }
            }

            listings.add(dto);
        }

        return listings;
    }

    public boolean isGenericPortalUrl(String url) {
        if (url == null || url.trim().isEmpty()) return true;
        try {
            URI uri = URI.create(url);
            String path = uri.getPath();
            return path == null || path.isEmpty() || path.equals("/");
        } catch (Exception e) {
            return false;
        }
    }

    public String generateTitleFingerprint(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("(?i)\\b(for\\s*rent|rent|for\\s*lease|apartment|flat|unit|property|in|at)\\b", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    private RentalListingDto parseSingleResult(SerpApiOrganicResult raw, int position, String searchLocation, String requestedBhk) {
        RentalListingDto dto = new RentalListingDto();

        String rawLink = raw.getLink() != null ? raw.getLink().trim() : "";
        String normalizedUrl = normalizeUrl(rawLink);
        dto.setId(generateDeterministicId(normalizedUrl.isEmpty() ? rawLink : normalizedUrl, position));
        dto.setTitle(raw.getTitle() != null ? cleanText(raw.getTitle()) : "Rental Property");
        dto.setSourceUrl(normalizedUrl.isEmpty() ? rawLink : normalizedUrl);
        dto.setSnippet(raw.getSnippet() != null ? cleanText(raw.getSnippet()) : "");
        dto.setImageUrl(raw.getThumbnail());
        dto.setSourcePlatform(detectSourcePlatform(dto.getSourceUrl(), raw.getSource(), raw.getDisplayedLink()));
        String timestamp = Instant.now().toString();
        dto.setScrapedAt(timestamp);
        dto.setRetrievalTimestamp(timestamp);
        dto.setIsPlaceholder(false); // Live normalized SerpApi data

        String fullText = (dto.getTitle() + " " + dto.getSnippet()).toLowerCase();

        // Locality & City generic normalization
        extractLocalityAndCity(dto, fullText, searchLocation);

        // Rent extraction: null if unparseable or absent. Never 0.
        Integer extractedRent = extractRent(fullText);
        dto.setRentAmount(extractedRent);
        boolean priceExtracted = (extractedRent != null && extractedRent > 0);
        dto.setPriceExplicitlyExtracted(priceExtracted);

        // Deposit extraction: null if not explicitly found in snippet. Never fabricated.
        Integer extractedDeposit = extractDeposit(fullText);
        dto.setDepositAmount(extractedDeposit);

        // BHK extraction: strictly null if not present in listing text. Never fabricated from search request.
        Integer bhk = extractBhk(fullText);
        dto.setBhk(bhk);

        // Carpet area extraction: null if unparseable. Never estimated or fabricated as 0.
        Integer area = extractArea(fullText);
        dto.setCarpetAreaSqft(area);
        boolean areaExtracted = (area != null && area > 0);
        dto.setAreaExplicitlyExtracted(areaExtracted);

        // Extraction status:
        // COMPLETE: Both price and area are explicitly extracted
        // PARTIAL: Price is extracted, but area is missing, OR basic attributes extracted
        // MINIMAL: Price is missing/unlisted (or unparseable)
        if (priceExtracted && areaExtracted) {
            dto.setExtractionStatus("COMPLETE");
        } else if (priceExtracted) {
            dto.setExtractionStatus("PARTIAL");
        } else {
            dto.setExtractionStatus("MINIMAL");
        }

        // Price per sqft: only calculated when BOTH valid rent AND valid area are present
        if (dto.getRentAmount() != null && dto.getRentAmount() > 0 &&
                dto.getCarpetAreaSqft() != null && dto.getCarpetAreaSqft() > 0) {
            double pps = (double) dto.getRentAmount() / dto.getCarpetAreaSqft();
            dto.setPricePerSqft(Math.round(pps * 100.0) / 100.0);
        } else {
            dto.setPricePerSqft(null);
        }

        // Property type detection
        dto.setPropertyType(detectPropertyType(fullText));

        // Furnishing status detection: null if not mentioned
        dto.setFurnishing(detectFurnishing(fullText));

        // Bathrooms: null if not mentioned. Never fabricated.
        dto.setBathrooms(extractBathrooms(fullText));

        // Extracted Amenities: only from actual snippet/title text
        dto.setFeatures(detectFeatures(fullText));

        // Fairness and outlier analysis are delegated to FairnessEngineService
        dto.setComparableCount(null);
        dto.setConfidenceScore(null);
        dto.setFairnessScore(null);
        dto.setFairnessCategory(null);
        dto.setVariancePercentage(null);
        dto.setFairnessExplanation(null);
        dto.setIsStatisticalOutlier(false);
        dto.setFairnessAnalysisPerformed(false);

        return dto;
    }

    public Integer extractRent(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        // 1. Check for Lakh per month format: e.g. "1.2 Lakh/month", "1.5L/mo"
        Matcher lakhMatcher = RENT_LAKH_PATTERN.matcher(text);
        if (lakhMatcher.find()) {
            int startIdx = lakhMatcher.start();
            String prefix = text.substring(Math.max(0, startIdx - 15), startIdx);
            if (!prefix.contains("deposit")) {
                try {
                    double lakhs = Double.parseDouble(lakhMatcher.group(1));
                    int rent = (int) Math.round(lakhs * 100000.0);
                    if (rent >= 4000 && rent <= 500000) {
                        return rent;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        // 2. Explicit /month or per month format: e.g. "₹38,000 per month", "45000/month", "25,000 pm"
        Matcher perMonthMatcher = RENT_PER_MONTH_PATTERN.matcher(text);
        if (perMonthMatcher.find()) {
            int startIdx = perMonthMatcher.start();
            String prefix = text.substring(Math.max(0, startIdx - 15), startIdx);
            if (!prefix.contains("deposit")) {
                String numStr = perMonthMatcher.group(1).replace(",", "").trim();
                try {
                    int rent = Integer.parseInt(numStr);
                    if (rent >= 4000 && rent <= 500000) {
                        return rent;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        // 3. 'k/month' format: e.g. "rent 25k/mo", "35k pm", "40k"
        Matcher kMatcher = RENT_K_PATTERN.matcher(text);
        if (kMatcher.find()) {
            int startIdx = kMatcher.start();
            String prefix = text.substring(Math.max(0, startIdx - 15), startIdx);
            if (!prefix.contains("deposit")) {
                String numStr = kMatcher.group(1).trim();
                try {
                    int kVal = Integer.parseInt(numStr);
                    if (kVal >= 5 && kVal <= 250) {
                        return kVal * 1000;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        // 4. Standard INR currency symbol format: e.g. "₹42,000", "Rs. 35000"
        Matcher matcher = RENT_INR_PATTERN.matcher(text);
        while (matcher.find()) {
            int startIdx = matcher.start();
            String prefix = text.substring(Math.max(0, startIdx - 15), startIdx);
            if (!prefix.contains("deposit")) {
                String numStr = matcher.group(1).replace(",", "").trim();
                try {
                    int rent = Integer.parseInt(numStr);
                    if (rent >= 4000 && rent <= 500000) {
                        return rent;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        return null;
    }

    public Integer extractDeposit(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        Matcher matcher = DEPOSIT_INR_PATTERN.matcher(text);
        if (matcher.find()) {
            String numStr = matcher.group(1).replace(",", "").trim();
            try {
                int deposit = Integer.parseInt(numStr);
                if (deposit >= 10000 && deposit <= 2000000) {
                    return deposit;
                }
            } catch (NumberFormatException ignored) {}
        }

        Matcher lakhMatcher = DEPOSIT_LAKH_PATTERN.matcher(text);
        if (lakhMatcher.find()) {
            String numStr = lakhMatcher.group(1).trim();
            try {
                double lakhs = Double.parseDouble(numStr);
                int deposit = (int) Math.round(lakhs * 100000);
                if (deposit >= 10000 && deposit <= 2000000) {
                    return deposit;
                }
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    public Integer extractArea(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        Matcher matcher = AREA_PATTERN.matcher(text);
        if (matcher.find()) {
            String numStr = matcher.group(1).replace(",", "").trim();
            try {
                int area = Integer.parseInt(numStr);
                if (area >= 200 && area <= 10000) {
                    return area;
                }
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    public Integer extractBhk(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        Matcher matcher = BHK_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        // Studio apartment / 1 RK
        if (text.contains("studio apartment") || text.contains("studio flat") || text.contains("1 rk") || text.contains("1rk")) {
            return 1;
        }

        return null;
    }

    public Integer extractBathrooms(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        Matcher matcher = BATHROOM_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    public String detectPropertyType(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        if (text.contains("gated community") || text.contains("society") || text.contains("prestige") ||
                text.contains("sobha") || text.contains("brigade") || text.contains("godrej") ||
                text.contains("salarpuria") || text.contains("puravankara")) {
            return "GATED_COMMUNITY";
        }
        if (text.contains("villa") || text.contains("row house") || text.contains("townhouse")) {
            return "VILLA";
        }
        if (text.contains("builder floor") || text.contains("standalone")) {
            return "BUILDER_FLOOR";
        }
        if (text.contains("independent house") || text.contains("independent duplex") || text.contains("individual house")) {
            return "INDEPENDENT_HOUSE";
        }
        if (text.contains("studio apartment") || text.contains("studio flat") || text.contains("1 rk") || text.contains("1rk") || text.contains("studio")) {
            return "STUDIO";
        }
        if (text.contains("apartment") || text.contains("flat") || text.contains("multistorey") || text.contains("condo")) {
            return "APARTMENT";
        }
        return null;
    }

    public String detectFurnishing(String text) {
        if (text == null) return null;
        text = text.toLowerCase();

        // "semi furnished" must be checked before "furnished"
        if (text.contains("semi furnished") || text.contains("semi-furnished") || text.contains("semifurnished") || text.contains("semi-furn")) {
            return "SEMI_FURNISHED";
        }
        if (text.contains("unfurnished") || text.contains("un-furnished") || text.contains("bare shell")) {
            return "UNFURNISHED";
        }
        if (text.contains("fully furnished") || text.contains("fully-furnished") || text.contains("well furnished") || text.contains("furnished")) {
            return "FULLY_FURNISHED";
        }
        return null;
    }

    public List<String> detectFeatures(String text) {
        List<String> features = new ArrayList<>();
        if (text == null) return features;
        text = text.toLowerCase();

        for (String feat : COMMON_FEATURES) {
            if (text.contains(feat.toLowerCase())) {
                features.add(feat);
                if (features.size() >= 5) break;
            }
        }
        return features;
    }

    public String normalizeUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            return "";
        }
        try {
            URI uri = URI.create(rawUrl.trim());
            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "https";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }

            String path = uri.getPath() != null ? uri.getPath() : "";
            // Normalize double slashes
            path = path.replaceAll("/{2,}", "/");
            if (path.length() > 1 && path.endsWith("/")) {
                path = path.substring(0, path.length() - 1);
            }

            // Filter tracking query parameters
            String query = uri.getQuery();
            StringBuilder cleanQuery = new StringBuilder();
            if (query != null && !query.isEmpty()) {
                String[] pairs = query.split("&");
                for (String pair : pairs) {
                    String[] kv = pair.split("=", 2);
                    String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8).toLowerCase();
                    if (!TRACKING_QUERY_PARAMS.contains(key)) {
                        if (cleanQuery.length() > 0) cleanQuery.append("&");
                        cleanQuery.append(pair);
                    }
                }
            }

            StringBuilder result = new StringBuilder();
            result.append(scheme).append("://").append(host);
            if (uri.getPort() != -1 && uri.getPort() != 80 && uri.getPort() != 443) {
                result.append(":").append(uri.getPort());
            }
            result.append(path);
            if (cleanQuery.length() > 0) {
                result.append("?").append(cleanQuery);
            }
            return result.toString();
        } catch (Exception e) {
            return rawUrl.trim();
        }
    }

    public void extractLocalityAndCity(RentalListingDto dto, String text, String searchLocation) {
        String city = "India";
        String locality = "Local Market";
        String subLocality = null;

        if (searchLocation != null && !searchLocation.trim().isEmpty()) {
            String[] parts = searchLocation.split(",");
            locality = cleanLocalityName(parts[0].trim());
            if (parts.length > 1) {
                city = cleanLocalityName(parts[parts.length - 1].trim());
            } else {
                city = locality;
            }
        }

        // Generic sub-locality detection from text (e.g. Sector 2, Phase 1, Block 4, Pocket B, Stage 2)
        Matcher sectorMatcher = SECTOR_PATTERN.matcher(text);
        if (sectorMatcher.find()) {
            subLocality = cleanLocalityName(sectorMatcher.group(1).trim());
        }

        dto.setLocality(locality);
        dto.setSubLocality(subLocality);
        dto.setCity(city);
    }

    private String cleanLocalityName(String name) {
        if (name == null) return "";
        return name.replaceAll("(?i)\\b(for\\s*rent|rent|near|opposite|behind)\\b", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public String detectSourcePlatform(String url, String source, String displayedLink) {
        if (source != null && !source.trim().isEmpty()) {
            return source;
        }
        if (url != null && !url.trim().isEmpty()) {
            try {
                URI uri = URI.create(url);
                String host = uri.getHost();
                if (host != null) {
                    if (host.contains("magicbricks")) return "MagicBricks";
                    if (host.contains("99acres")) return "99acres";
                    if (host.contains("housing.com")) return "Housing.com";
                    if (host.contains("nobroker")) return "NoBroker";
                    if (host.contains("squareyards")) return "Square Yards";
                    if (host.contains("olx")) return "OLX";
                    if (host.contains("commonfloor")) return "CommonFloor";
                    return host.replace("www.", "");
                }
            } catch (Exception ignored) {}
        }
        return "Aggregated SerpApi";
    }



    private String generateDeterministicId(String url, int index) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest((url + index).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                hex.append(String.format("%02x", hash[i]));
            }
            return "rf-serp-" + hex;
        } catch (Exception e) {
            return "rf-serp-" + System.currentTimeMillis() + "-" + index;
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text.replaceAll("<[^>]*>", "")
                .replaceAll("&amp;", "&")
                .replaceAll("&quot;", "\"")
                .replaceAll("&#39;", "'")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
