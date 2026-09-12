import { OSRM_BASE_URL, OSRM_TIMEOUT_MS } from "./constants";
import { OSRMResponse, OSRMRoute, RoutingError } from "./types";

/**
 * Validates coordinate inputs.
 */
function isValidCoordinate(lon: number, lat: number): boolean {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

/**
 * Fetches the driving route from OSRM between two points.
 * All coordinates must be in [longitude, latitude] order.
 */
export async function getRouteFromOSRM(
  origin: [number, number],
  destination: [number, number]
): Promise<OSRMRoute | RoutingError> {
  const [lon1, lat1] = origin;
  const [lon2, lat2] = destination;

  if (!isValidCoordinate(lon1, lat1) || !isValidCoordinate(lon2, lat2)) {
    return {
      code: "INVALID_COORDINATES",
      message: "Provided coordinates are invalid.",
    };
  }

  // Construct coordinates string (lon,lat;lon,lat)
  const coordinatesString = `${lon1},${lat1};${lon2},${lat2}`;
  
  // Construct parameters
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
  });

  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinatesString}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      // OSRM returns 400 for NoRoute, we should parse the body to check
      try {
        const errorData = (await response.json()) as OSRMResponse;
        if (errorData.code === "NoRoute") {
          return {
            code: "NO_ROUTE",
            message: "OSRM could not find a valid driving route between these points.",
          };
        }
      } catch {
        // Fallback if parsing fails
      }
      
      return {
        code: "NETWORK_ERROR",
        message: `OSRM request failed with status: ${response.status}`,
      };
    }

    const data = (await response.json()) as OSRMResponse;

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      if (data.code === "NoRoute") {
        return {
          code: "NO_ROUTE",
          message: "OSRM could not find a valid driving route between these points.",
        };
      }
      return {
        code: "INVALID_RESPONSE",
        message: "OSRM returned an Ok status but no valid routes were found.",
      };
    }

    const route = data.routes[0];

    // Validate GeoJSON geometry
    if (
      !route.geometry ||
      route.geometry.type !== "LineString" ||
      !Array.isArray(route.geometry.coordinates) ||
      route.geometry.coordinates.length === 0
    ) {
      return {
        code: "INVALID_RESPONSE",
        message: "OSRM returned invalid route geometry.",
      };
    }

    return route;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        code: "NETWORK_ERROR",
        message: "OSRM request timed out.",
      };
    }
    return {
      code: "NETWORK_ERROR",
      message: "Failed to connect to OSRM service.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
