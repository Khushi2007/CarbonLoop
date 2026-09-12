export type RouteGeometry = {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude][]
};

export type OSRMRoute = {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: RouteGeometry;
};

export type OSRMResponse = {
  code: string;
  message?: string;
  routes?: OSRMRoute[];
};

export type RouteResult = {
  distanceKm: number;
  durationMinutes: number;
  estimatedTransportCostInr: number;
  geometry: RouteGeometry;
};

export type RoutingError = {
  code: "NOT_FOUND" | "NO_ROUTE" | "NETWORK_ERROR" | "INVALID_RESPONSE" | "INVALID_COORDINATES";
  message: string;
};

export type RouteRequest = {
  wasteLotId: string;
  facilityId: string;
};

export type RouteAPIResponse = {
  wasteLot: {
    id: string;
    wasteType: string;
    quantityTonnes: number;
    latitude: number;
    longitude: number;
  };
  facility: {
    id: string;
    name: string;
    facilityType: string;
    latitude: number;
    longitude: number;
  };
  route: RouteResult;
};
