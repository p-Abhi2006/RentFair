# RentFair — Java Spring Boot Backend

Production-ready backend for **RentFair — Rental Price Fairness Intelligence**, powered by Java 21, Spring Boot 3.3.x, real SerpApi Google search ingestion, and PostgreSQL.

---

## 1. Tech Stack & Architecture

- **Java**: 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Database**: PostgreSQL (with automatic in-memory H2 PostgreSQL-compatible fallback for zero-Docker development)
- **External Data Source**: SerpApi Google Search Engine (`https://serpapi.com/search`)
- **Caching**: Lightweight application-level memory cache (`ConcurrentMapCacheManager`)
- **Build Tool**: Apache Maven

### Package Structure
```
com.rentfair/
├── config/             # RestClient, CORS filter, CacheManager, SerpApi properties
├── client/             # Real SerpApiClient calling https://serpapi.com/search
│   └── dto/            # SerpApiResponse, SerpApiOrganicResult, SerpApiSearchMetadata
├── controller/         # RentalSearchController, MarketBaselineController
├── dto/                # RentalListingDto, RentalSearchRequest, MarketBaselineDto, ApiErrorResponse
├── model/              # JPA entities: SearchQueryEntity, RentalListingEntity
├── repository/         # Spring Data JPA repositories
├── service/            # RentalSearchService (orchestration, caching), MarketBaselineService
├── util/               # RentalQueryBuilder, SerpApiResultParser
└── exception/          # GlobalExceptionHandler, custom domain exceptions
```

---

## 2. Environment Variables & Configuration

The application reads configuration from environment variables or a local `.env` file. **Never hardcode or commit secrets.**

| Variable | Required | Default | Description |
|---|---|---|---|
| `SERPAPI_API_KEY` | **Yes** (for live search) | None | Your SerpApi API key (get free key at [serpapi.com](https://serpapi.com)) |
| `DATABASE_URL` | Optional | `jdbc:h2:mem:rentfair;...` | PostgreSQL connection URL (e.g. `jdbc:postgresql://localhost:5432/rentfair`) |
| `DATABASE_USERNAME` | Optional | `sa` (H2) / `postgres` | Database user |
| `DATABASE_PASSWORD` | Optional | `""` | Database password |
| `PORT` | Optional | `8080` | HTTP server port |
| `CORS_ALLOWED_ORIGINS` | Optional | `http://localhost:3000,http://localhost:5173,http://localhost:4173` | Allowed frontend origins |

---

## 3. Running the Backend

### Build and run tests
```bash
mvn test
```

### Launch the development server
```bash
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

---

## 4. REST API Specification

### 1. Search Rental Listings
- **Endpoint**: `GET /api/rentals/search` (also available as `GET /api/v1/rentals`)
- **Query Parameters**:
  - `location` (string, e.g. `Whitefield, Bangalore`)
  - `bhk` (string, e.g. `1`, `2`, `3`, `4+`, or `all`)
  - `propertyType` (string: `APARTMENT`, `GATED_COMMUNITY`, `INDEPENDENT_HOUSE`, `VILLA`, `STUDIO`, `BUILDER_FLOOR`, or `all`)
  - `minRent` (integer)
  - `maxRent` (integer)
  - `minArea` (integer sq.ft)
  - `maxArea` (integer sq.ft)
  - `furnishing` (string: `FULLY_FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED`, or `all`)
  - `sortBy` (string: `fairness`, `price_low`, `price_high`, `area_desc`, `variance_asc`)
- **Example**:
  ```bash
  curl "http://localhost:8080/api/rentals/search?location=Whitefield+Bangalore&bhk=1"
  ```

### 2. Market Baseline Benchmark
- **Endpoint**: `GET /api/v1/market-baseline`
- **Query Parameters**:
  - `locality` (string, e.g. `Whitefield`)
  - `bhk` (integer, e.g. `2`)
- **Example**:
  ```bash
  curl "http://localhost:8080/api/v1/market-baseline?locality=Whitefield&bhk=2"
  ```

### 3. Single Listing Detail
- **Endpoint**: `GET /api/v1/rentals/{id}`

### 4. Comparison Lookup
- **Endpoint**: `GET /api/v1/rentals/compare?ids=id1,id2,id3`

---

## 5. Caching & Persistence

- **Caching**: Searches with identical parameter combinations are cached in memory. Identical repeated queries do not re-consume SerpApi quota.
- **Persistence**: Every search execution is recorded in the `search_queries` table, and extracted rental properties are persisted to `rental_listings` for historical intelligence.
