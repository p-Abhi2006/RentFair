import {
  RentalListing,
  MarketBaseline,
  SearchFilterParams,
  LocationComparisonRequest,
  LocationComparisonResponse
} from '../types/rental';

/**
 * ----------------------------------------------------------------------
 * RentFair API Service Layer
 * ----------------------------------------------------------------------
 * Connects the React UI to the live Spring Boot backend.
 * Reads VITE_API_BASE_URL or defaults dynamically to http://localhost:8080.
 * Never exposes SerpApi secrets to the browser.
 * Does not fall back to mock data on search errors or network failures.
 * ----------------------------------------------------------------------
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConnectionError';
  }
}

export class ApiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRateLimitError';
  }
}

export const rentalService = {
  /**
   * Search and filter rental listings via Spring Boot backend + SerpApi
   */
  async searchListings(
    params: Partial<SearchFilterParams> = {},
    options?: { signal?: AbortSignal }
  ): Promise<RentalListing[]> {
    const queryParams = new URLSearchParams();
    if (params.location) queryParams.set('location', params.location);
    if (params.bhk && params.bhk !== 'all') queryParams.set('bhk', params.bhk);
    if (params.propertyType && params.propertyType !== 'all') queryParams.set('propertyType', params.propertyType);
    if (params.furnishing && params.furnishing !== 'all') queryParams.set('furnishing', params.furnishing);
    if (params.maxRent) queryParams.set('maxRent', params.maxRent.toString());
    if (params.minArea) queryParams.set('minArea', params.minArea.toString());
    if (params.maxArea) queryParams.set('maxArea', params.maxArea.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/rentals/search?${queryParams.toString()}`, {
        signal: options?.signal,
      });
    } catch (networkError: any) {
      if (networkError?.name === 'AbortError') {
        throw networkError;
      }
      throw new ApiConnectionError(
        `Cannot connect to Spring Boot backend at ${API_BASE_URL}. Ensure the backend service is running.`
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiRateLimitError(
          'SerpApi search limit reached. Please check your SerpApi account quota or try again later.'
        );
      }
      const errorJson = await response.json().catch(() => null);
      const errorMsg = errorJson?.message || response.statusText;
      throw new Error(`Spring Boot backend error (${response.status}): ${errorMsg}`);
    }

    return await response.json();
  },

  /**
   * Fetch statistical market baseline for a locality and configuration
   */
  async getMarketBaseline(
    locality: string,
    bhk?: number | null,
    options?: { signal?: AbortSignal }
  ): Promise<MarketBaseline> {
    const queryParams = new URLSearchParams();
    if (locality) queryParams.set('locality', locality);
    if (bhk != null && bhk > 0) queryParams.set('bhk', bhk.toString());

    let response: Response;
    try {
      response = await fetch(
        `${API_BASE_URL}/api/v1/market-baseline?${queryParams.toString()}`,
        {
          signal: options?.signal,
        }
      );
    } catch (networkError: any) {
      if (networkError?.name === 'AbortError') {
        throw networkError;
      }
      throw new ApiConnectionError(
        `Cannot connect to Spring Boot backend at ${API_BASE_URL}. Ensure the backend service is running.`
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiRateLimitError(
          'SerpApi search limit reached. Please check your SerpApi account quota or try again later.'
        );
      }
      const errorJson = await response.json().catch(() => null);
      const errorMsg = errorJson?.message || response.statusText;
      throw new Error(`Failed to fetch market baseline (${response.status}): ${errorMsg}`);
    }

    return await response.json();
  },

  /**
   * Fetch single listing detail
   */
  async getListingById(id: string): Promise<RentalListing | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rentals/${encodeURIComponent(id)}`);
      if (!response.ok) return undefined;
      return await response.json();
    } catch (e) {
      return undefined;
    }
  },

  /**
   * Fetch listings for comparison
   */
  async getComparisonListings(ids: string[]): Promise<RentalListing[]> {
    if (ids.length === 0) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rentals/compare?ids=${encodeURIComponent(ids.join(','))}`);
      if (!response.ok) throw new Error('Comparison request failed');
      return await response.json();
    } catch (networkError: any) {
      throw new ApiConnectionError(
        `Cannot connect to Spring Boot backend at ${API_BASE_URL} for comparison data.`
      );
    }
  },

  /**
   * Compare rental markets across 2 to 5 locations via Spring Boot multi-locality engine
   */
  async compareMarkets(
    request: LocationComparisonRequest,
    options?: { signal?: AbortSignal }
  ): Promise<LocationComparisonResponse> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/market-comparison`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: options?.signal,
      });
    } catch (networkError: any) {
      if (networkError?.name === 'AbortError') {
        throw networkError;
      }
      throw new ApiConnectionError(
        `Cannot connect to Spring Boot backend at ${API_BASE_URL}. Ensure the backend service is running.`
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiRateLimitError(
          'SerpApi search limit reached. Please check your SerpApi account quota or try again later.'
        );
      }
      const errorJson = await response.json().catch(() => null);
      const errorMsg = errorJson?.message || response.statusText;
      throw new Error(`Market comparison failed (${response.status}): ${errorMsg}`);
    }

    return await response.json();
  }
};
