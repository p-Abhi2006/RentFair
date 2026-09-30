package com.rentfair.util;

import com.rentfair.dto.RentalSearchRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RentalQueryBuilder {

    /**
     * Constructs a targeted search query for Google search via SerpApi.
     * Example outputs:
     * - "1 BHK apartment for rent in Whitefield Bangalore"
     * - "2 BHK gated community for rent in HSR Layout Bangalore semi furnished"
     */
    public String buildQuery(RentalSearchRequest request) {
        StringBuilder query = new StringBuilder();

        // BHK configuration
        if (request.getBhk() != null && !request.getBhk().trim().isEmpty() && !"all".equalsIgnoreCase(request.getBhk())) {
            String bhk = request.getBhk().trim();
            if (bhk.matches("\\d+")) {
                query.append(bhk).append(" BHK ");
            } else if (bhk.contains("BHK")) {
                query.append(bhk).append(" ");
            } else {
                query.append(bhk).append(" BHK ");
            }
        }

        // Property Type
        if (request.getPropertyType() != null && !request.getPropertyType().trim().isEmpty() && !"all".equalsIgnoreCase(request.getPropertyType())) {
            String type = formatPropertyTypeForQuery(request.getPropertyType());
            query.append(type).append(" ");
        } else {
            query.append("for rent in ");
        }

        if (!query.toString().contains("for rent in ")) {
            query.append("for rent in ");
        }

        // Location
        String location = cleanLocationForQuery(request.getLocation());
        query.append(location);

        // Furnishing filter if specified
        if (request.getFurnishing() != null && !request.getFurnishing().trim().isEmpty() && !"all".equalsIgnoreCase(request.getFurnishing())) {
            String furnishing = formatFurnishingForQuery(request.getFurnishing());
            query.append(" ").append(furnishing);
        }

        return query.toString().replaceAll("\\s+", " ").trim();
    }

    private String formatPropertyTypeForQuery(String propertyType) {
        return switch (propertyType.toUpperCase()) {
            case "APARTMENT" -> "apartment";
            case "GATED_COMMUNITY" -> "gated community apartment";
            case "INDEPENDENT_HOUSE" -> "independent house";
            case "VILLA" -> "villa";
            case "STUDIO" -> "studio apartment";
            case "BUILDER_FLOOR" -> "builder floor";
            default -> propertyType.toLowerCase().replace('_', ' ');
        };
    }

    private String formatFurnishingForQuery(String furnishing) {
        return switch (furnishing.toUpperCase()) {
            case "FULLY_FURNISHED" -> "fully furnished";
            case "SEMI_FURNISHED" -> "semi furnished";
            case "UNFURNISHED" -> "unfurnished";
            default -> furnishing.toLowerCase().replace('_', ' ');
        };
    }

    public String cleanLocationForQuery(String location) {
        if (location == null || location.trim().isEmpty()) {
            return "Bangalore";
        }
        String[] parts = location.split(",");
        List<String> distinctParts = new ArrayList<>();
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            boolean isDuplicate = false;
            for (String existing : distinctParts) {
                if (existing.equalsIgnoreCase(trimmed)) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                distinctParts.add(trimmed);
            }
        }
        if (distinctParts.isEmpty()) {
            return "Bangalore";
        }
        return String.join(", ", distinctParts);
    }
}
