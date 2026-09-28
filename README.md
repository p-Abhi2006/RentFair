# RentFair — Rental Price Fairness Intelligence Platform

> **Live Rental Intelligence Powered by Google Search via SerpApi**  
> Empirical valuation, IQR statistical corridor baselines, price anomaly detection, and transparent tenant negotiation evidence.

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![SerpApi](https://img.shields.io/badge/SerpApi-Google%20Search%20Engine-purple.svg)](https://serpapi.com/)
[![Tests](https://img.shields.io/badge/Tests-69%20Passing-success.svg)](https://github.com/)

---

## 1. Project Overview

**RentFair** is an analytical rental price fairness platform built to solve the pervasive information asymmetry in metropolitan rental markets such as Bangalore. RentFair aggregates live rental listings directly from search results using **SerpApi**, extracts and standardizes property attributes using deterministic parser rules, computes robust local market baselines (50th percentile median and Tukey Interquartile Range corridors), detects statistical outliers, and equips tenants with factual, transparent market valuation evidence.

---

## 2. The Problem

In high-demand technology corridors (such as Whitefield, Koramangala, HSR Layout, and Indiranagar):
- **Opaque Asking Prices**: Landlords and brokers frequently inflate asking rents with zero objective justification.
- **Fragile Comparison**: Averages are severely distorted by ultra-luxury penthouses or furnished villas.
- **Synthetic/Stale Portals**: Traditional listing portals often display expired or fabricated listings.
- **Tenant Disadvantage**: Renters lack data-driven negotiation leverage to contest arbitrary price markups.

---

## 3. The Solution

RentFair delivers real-time rental intelligence with total data integrity:
1. **Live Aggregation**: Queries Google Search via **SerpApi** in real time across multiple real estate portals (99acres, MagicBricks, Housing.com, NoBroker, OLX) without brittle web scraping.
2. **Deterministic Attribute Normalization**: Extracts rent, deposit, carpet area, configuration (BHK), and furnishing with strict null-preservation (no ₹0, no fabricated values).
3. **50th Percentile Median Benchmark**: Uses the mathematical median instead of the arithmetic mean to anchor market value resistant to luxury skew.
4. **Tukey IQR Outlier Boundaries**: Establishes $Q1$, $Q3$, and $[Q1 - 1.5 \times \text{IQR}, Q3 + 1.5 \times \text{IQR}]$ fences to mathematically identify overpriced anomalies.
5. **Deterministic Fairness Score**: Computes an objective 0–100 fairness score based on variance from comparable median.
6. **Cross-Locality Analysis**: Enables multi-market comparison across 2 to 5 localities to evaluate relative value without subjective rankings.

---

## 4. Key Features

- **Live Locality Search**: Instant search for rental properties in any neighborhood with BHK, budget, area, and furnishing filters.
- **Locality Market Baseline**: Real-time statistical metrics ($N$, Median, Mean, Median Price/sqft, IQR corridor) updated per search.
- **Deterministic Fairness Scoring**: 0–100 index measuring asking rent alignment against valid extracted comparable listings.
- **Statistical Outlier Detection**: Automatic flags for listings exceeding Tukey upper fences, indicating artificial price inflation.
- **Data Provenance & Freshness (Fix 9)**: Every listing and baseline explicitly exposes source platform, canonical URL, retrieval timestamp, extraction status (`COMPLETE`, `PARTIAL`, `MINIMAL`), and boolean flags (`priceExplicitlyExtracted`, `areaExplicitlyExtracted`, `fairnessAnalysisPerformed`).
- **Multi-Locality Market Comparison**: Compare 2 to 5 localities side-by-side with independent sample sizes, medians, rent/sqft, and distribution spreads.
- **Property Compare Tray**: Side-by-side detailed comparison of up to 4 shortlisted listings.
- **Saved Watchlist**: Local browser persistence for saving and tracking properties.
- **Deterministic Live-Data Path**: No mock data is used in the live search path. Extracted property values in the live search path are derived from the information returned by SerpApi search results, and no LLM is used to invent missing rental values.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Browser                                │
│               React 18 + TypeScript + Tailwind CSS (Vite)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST Requests (Port 3000 -> 8080)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Spring Boot 3.3.x Backend                            │
│                                                                         │
│  ┌────────────────────────┐         ┌────────────────────────┐         │
│  │ RentalListingController│         │MarketBaselineController│         │
│  └───────────┬────────────┘         └───────────┬────────────┘         │
│              │                                  │                       │
│  ┌───────────▼────────────┐         ┌───────────▼────────────┐         │
│  │   RentalSearchService  │◄───────►│  MarketBaselineService │         │
│  └───────────┬────────────┘         └───────────┬────────────┘         │
│              │                                  │                       │
│  ┌───────────▼────────────┐         ┌───────────▼────────────┐         │
│  │ SerpApiResultParser    │         │ FairnessEngineService  │         │
│  │ (Deterministic Regex)  │         │ (Median & Tukey IQR)   │         │
│  └───────────┬────────────┘         └───────────┬────────────┘         │
│              │                                  │                       │
│  ┌───────────▼────────────┐         ┌───────────▼────────────┐         │
│  │     SerpApiClient      │         │   In-Memory H2 DB      │         │
│  │   (Spring RestClient)  │         │ (PostgreSQL Compatibility)       │
│  └───────────┬────────────┘         └────────────────────────┘         │
└──────────────┼──────────────────────────────────────────────────────────┘
               │ HTTPS (api_key)
┌──────────────▼──────────────────────────────────────────────────────────┐
│                   SerpApi (Google Search Engine)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. End-to-End Data Flow

1. **User Query**: Tenant specifies locality (e.g. `Whitefield`), bedroom count (`2 BHK`), and optional filters in the React UI.
2. **Backend Query Construction**: `RentalQueryBuilder` forms targeted Google Search queries (e.g. `"2 BHK for rent in Whitefield Bangalore"`).
3. **SerpApi Retrieval**: `SerpApiClient` invokes the SerpApi Google Search endpoint securely using the server-side `SERPAPI_API_KEY`.
4. **Attribute Parsing**: `SerpApiResultParser` extracts numeric rent, carpet area, deposit, bathrooms, furnishing status, and amenities from organic result snippets.
5. **Canonical Deduplication**: Listings are deduplicated primarily by normalized canonical URL and secondarily by source platform + locality + rent + title fingerprint.
6. **Comparable Property Clustering**: `FairnessEngineService` identifies compatible comparables matching locality, BHK, and property type, strictly excluding the target listing from its own baseline.
7. **Statistical Evaluation**: Baseline median, Q1, Q3, IQR, and fences are computed. Fairness score and outlier flags are assigned.
8. **Provenance Retention**: Extracted listings, timestamps, and metadata are retained in the session repository for the duration of the active application session.
9. **UI Presentation**: React renders listing cards, the interactive SVG fairness gauge, locality baseline cards, and detailed provenance disclosures.

---

## 7. SerpApi Integration

SerpApi is the foundational data provider of RentFair:
- **Core Function**: RentFair does not rely on a static pre-seeded database; every search query dispatches a real-time request to SerpApi to collect indexed rental listings from Google Search.
- **Security**: The API key is stored exclusively on the backend (`SERPAPI_API_KEY`). It is never bundled, logged, or exposed to the Vite frontend.
- **Resilience**:
  - `SerpApiRateLimitException`: Catches HTTP 429 and rate limit messages, returning clean user guidance.
  - `MissingApiKeyException`: Detects unconfigured or invalid keys (HTTP 401/403).
  - `SerpApiNetworkException`: Handles upstream network drops and connection timeouts.

---

## 8. Fairness Methodology

### Mathematical Definitions

1. **Median (50th Percentile)**:
   For an ordered list of valid priced rents $R = [r_1, r_2, \dots, r_n]$:
   $$\text{Median} = \begin{cases} R_{\frac{n+1}{2}} & \text{if } n \text{ is odd} \\ \frac{R_{\frac{n}{2}} + R_{\frac{n}{2}+1}}{2} & \text{if } n \text{ is even} \end{cases}$$
2. **Interquartile Range (IQR)**:
   $$\text{IQR} = Q3 - Q1$$
   - $Q1$ (25th percentile): Median of the lower half.
   - $Q3$ (75th percentile): Median of the upper half.
3. **Tukey Outlier Fences**:
   $$\text{Lower Fence} = Q1 - (1.5 \times \text{IQR})$$
   $$\text{Upper Fence} = Q3 + (1.5 \times \text{IQR})$$
   A listing is classified as a **Statistical Outlier** only when $N \ge 3$ and asking rent falls outside these fences.
4. **Median Variance Percentage**:
   $$\text{Variance \%} = \frac{\text{Asking Rent} - \text{Median Rent}}{\text{Median Rent}} \times 100$$
5. **Fairness Score (0–100)**:
   $$\text{Fairness Score} = \max\left(0, \min\left(100, \text{round}\left(100 - |\text{Variance \%}| \times 2.0\right)\right)\right)$$
   - Exactly at median ($0\%$ variance) $\rightarrow$ Score: **100**
   - $\pm 10\%$ from median $\rightarrow$ Score: **80**
   - $\pm 25\%$ from median $\rightarrow$ Score: **50**
   - $\ge \pm 50\%$ from median $\rightarrow$ Score: **0**
6. **Confidence Metric**:
   Scaled logarithmically based on comparable sample size ($n=0$ to $n \ge 15$), match tier specificity, and property data completeness.

---

## 9. Extraction Methodology

RentFair uses **deterministic, rule-based extraction** via regex and pattern matching:
- **Rent Parsing**: Captures Lakh patterns (`"1.2 Lakh/month"`, `"1.5L/mo"`), explicit monthly rates (`"₹38,000 per month"`, `"45000/month"`), and thousands notation (`"35k/mo"`).
- **Area Parsing**: Captures carpet/built-up square feet (`"1,200 sq ft"`, `"950 sqft"`).
- **Strict Null Preservation**:
  - Missing rent remains `null` (never ₹0).
  - Missing area remains `null` (never estimated or defaulted).
  - Missing deposit remains `null`.
  - Missing bathrooms remains `null`.
  - Missing BHK remains `null` (never inferred from search request).
- **Provenance Attributes & Flags**:
  - `sourcePlatform`: Identified listing source (e.g., 99acres, MagicBricks, Housing.com, OLX, Aggregated SerpApi).
  - `sourceUrl`: Direct canonical outbound link to the live property listing.
  - `retrievalTimestamp` / `scrapedAt`: ISO timestamp recording when SerpApi executed the retrieval.
  - `snippet`: Extracted text snippet returned by the search engine.
  - `extractionStatus`: `"COMPLETE"` (both price and area extracted), `"PARTIAL"` (price extracted, area missing or basic attributes), `"MINIMAL"` (price missing/unlisted).
  - `priceExplicitlyExtracted`: Boolean flag indicating whether a numeric rent value was explicitly extracted from the search result.
  - `areaExplicitlyExtracted`: Boolean flag indicating whether a carpet area value was explicitly extracted from the search result.
  - `fairnessAnalysisPerformed`: Boolean flag indicating completed evaluation against market baseline.

---

## 10. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | High-performance single page application |
| **Language** | TypeScript (Strict Mode) | Type-safe data contracts and UI models |
| **Styling** | Tailwind CSS | Commercial dark-slate design system |
| **Icons** | Lucide React | Lightweight, accessible UI iconography |
| **Backend Framework** | Spring Boot 3.3.x (Java 21) | Production-grade REST controllers & services |
| **Data Access** | Spring Data JPA / Hibernate | Object-relational mapping and repository queries |
| **Runtime Database** | H2 In-Memory (PostgreSQL Mode) | Zero-setup, zero-Docker embedded database |
| **Search Engine** | SerpApi (Google Search API) | Real-time web aggregation across property portals |
| **Testing** | JUnit 5, Mockito, AssertJ | Comprehensive deterministic test suite (69 tests) |

---

## 11. Setup Instructions

### Prerequisites
- **Java 21** or later (`java -version`)
- **Node.js 18+** and **npm** (`node -v`, `npm -v`)
- **Apache Maven 3.9+** (`mvn -v`)
- A **SerpApi API Key** (obtain free at [serpapi.com](https://serpapi.com))

### 1. Clone & Environment Configuration
```bash
git clone https://github.com/p-Abhi2006/RentFair.git
cd RentFair

# Create .env from template
cp .env.example .env
```
Edit `.env` and add your SerpApi key:
```env
SERPAPI_API_KEY=your_actual_serpapi_key_here
PORT=8080
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Run Backend
```bash
cd backend
mvn clean compile
mvn test
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

### 3. Run Frontend
In a new terminal from the root directory:
```bash
npm install
npm run dev
```
The frontend is available at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Generates production assets in `dist/`.

---

## 12. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SERPAPI_API_KEY` | **Yes** | `""` | API key for SerpApi Google search engine calls |
| `PORT` | No | `8080` | Spring Boot server port |
| `DATABASE_URL` | No | `jdbc:h2:mem:rentfair;DB_CLOSE_DELAY=-1;MODE=PostgreSQL` | JDBC database connection URL |
| `DATABASE_USERNAME` | No | `sa` | Database username |
| `DATABASE_PASSWORD` | No | `""` | Database password |
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Base URL used by the frontend to contact backend |

---

## 13. API Endpoints

### 1. Search Rental Listings
- **`GET /api/rentals/search`** (alias: **`GET /api/v1/rentals`**)
  - **Query Parameters**:
    - `location` / `locality` (string, optional, defaults to `"Whitefield, Bangalore"`): Search target neighborhood
    - `bhk` (string, optional, default: `"all"`): `"1"`, `"2"`, `"3"`, `"4+"`, or `"all"`
    - `propertyType` (string, optional, default: `"all"`): `"APARTMENT"`, `"GATED_COMMUNITY"`, `"INDEPENDENT_HOUSE"`, `"VILLA"`, `"STUDIO"`, `"BUILDER_FLOOR"`
    - `minRent` / `maxRent` (integer, optional): Monthly budget boundaries
    - `minArea` / `maxArea` (integer, optional): Carpet area boundaries in sq ft
    - `furnishing` (string, optional, default: `"all"`): `"FURNISHED"`, `"SEMI_FURNISHED"`, `"UNFURNISHED"`
    - `sortBy` (string, optional, default: `"fairness"`): `"fairness"`, `"price_low"`, `"price_high"`, `"area_desc"`, `"variance_asc"`
  - **Response**: Array of `RentalListingDto` items with provenance attributes.

### 2. Single Listing Detail & Multi-ID Compare
- **`GET /api/v1/rentals/{id}`**: Returns single `RentalListingDto` by entity ID.
- **`GET /api/v1/rentals/compare?ids={id1,id2}`**: Returns matched list of `RentalListingDto` items for shortlisted comparison.

### 3. Get Locality Market Baseline
- **`GET /api/v1/market-baseline`** (alias: **`GET /api/market-baseline`**)
  - **Query Parameters**:
    - `locality` / `location` (string, optional, defaults to `"Whitefield, Bangalore"`): Target locality
    - `bhk` (integer, optional): Target BHK configuration (e.g. `2`)
  - **Response**: `MarketBaselineDto` containing sample size, median, mean, rent/sqft, IQR corridor (`q1`, `q3`, `minTypical`, `maxTypical`), price distribution buckets, and `generatedAt` timestamp.

### 4. Cross-Locality Market Comparison
- **`POST /api/v1/market-comparison`** (aliases: `POST /api/market-comparison`, `GET /api/v1/market-comparison`, `GET /api/market-comparison`)
  - **Request Body**:
    ```json
    {
      "locations": ["Whitefield", "Koramangala", "HSR Layout", "Indiranagar"],
      "bhk": 2,
      "propertyType": "all",
      "furnishing": "all"
    }
    ```
  - **Response**: `LocationComparisonResponse` containing `localities` (`LocalityMarketStatsDto[]`) with sample reliability indicators, IQR metrics, and `comparisonSummary`.

---

## 14. Database Architecture

- **Engine**: In-Memory **H2 Database** configured in PostgreSQL compatibility mode (`MODE=PostgreSQL`).
- **Tables**:
  - `rental_listings`: Normalized rental property listings with extracted attributes, Tukey outlier flags, and Fix 9 provenance metadata.
  - `search_queries`: Audit trail recording search parameters, timestamps, and result counts.
- **Zero-Docker Deployment**: Allows judges, reviewers, and evaluators to run the entire backend and test suite without configuring external database services.

---

## 15. Limitations & Boundary Disclosures

- **Search Availability Dependent**: Extraction volume depends on the depth and content of listings indexed by Google Search via SerpApi in the queried locality.
- **Unpriced Listings**: Listings without publicly disclosed rent cannot establish a numerical baseline and are classified as `MINIMAL` extraction status.
- **In-Memory Storage & Retention**: The default H2 database maintains records in memory. Provenance information is retained during the active application session; restarting the server clears in-memory session cache and history.
- **Methodology Notice**:
  > *"RentFair analyzes information returned by live search results. It does not independently verify property availability, ownership, rent, or listing accuracy."*

---

## 16. Demo Instructions (Sub-3-Minute Hackathon Walkthrough)

1. **Landing & Problem (0:00 - 0:30)**:
   - Open `http://localhost:3000`.
   - Highlight the Bangalore rental market challenge: extreme price variance, broker markups, and tenant information asymmetry.
2. **Live Search Execution (0:30 - 1:00)**:
   - Query **`Whitefield, Bangalore`** with **`2 BHK`**.
   - Watch the Loading Pipeline reflect live SerpApi querying, attribute parsing, deduplication, and statistical baseline calibration.
3. **Market Baseline & IQR Corridor (1:00 - 1:30)**:
   - View the calibrated **Locality Market Baseline**: Median Rent, Mean Rent, Rent/sqft, and the 25th–75th Percentile IQR Corridor.
   - Point out the provenance strip: Source count, valid priced count, usable area count, and generation timestamp.
4. **Inspecting a Listing & Fairness Gauge (1:30 - 2:00)**:
   - Click **Analysis Detail** on an unusual listing (e.g. an above-market or high-value listing).
   - Show the circular SVG Fairness Score Gauge, variance percentage, comparable cluster count, and full provenance badge (Platform, live search result link, extraction status).
5. **Cross-Locality Market Comparison (2:00 - 2:30)**:
   - Navigate to **Market Comparison** in the top navigation.
   - Compare **Whitefield**, **Koramangala**, **HSR Layout**, and **Indiranagar** for 2 BHK units.
   - Show independent medians, rent/sqft parity, and data reliability tiers without subjective rankings.
6. **Methodology & Provenance Notice (2:30 - 3:00)**:
   - Navigate to **Market Insights** / **About RentFair**.
   - Show the transparent mathematical formulas (Tukey fences, IQR, median variance) and the exact methodology disclosure.

---

## License

This project is licensed under the MIT License for educational and hackathon submission purposes.
