"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

type LatLng = [number, number];

/**
 * Real interactive Leaflet map showing route evidence: origin, destination,
 * and the routed geometry. `leaflet` is imported dynamically inside the
 * effect so its module code — which touches browser globals — never runs
 * during SSR, and the container div itself renders identically on server
 * and client (no hydration mismatch).
 */
export function RouteMap({
  origin,
  destination,
  coordinates,
}: {
  origin: LatLng;
  destination: LatLng;
  coordinates: [number, number][];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;

    import("leaflet")
      .then(({ default: L }) => {
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        const originIcon = L.divIcon({ className: "carbonloop-marker carbonloop-marker--origin", iconSize: [12, 12] });
        const destinationIcon = L.divIcon({
          className: "carbonloop-marker carbonloop-marker--destination",
          iconSize: [12, 12],
        });

        L.marker(origin, { icon: originIcon }).addTo(map);
        L.marker(destination, { icon: destinationIcon }).addTo(map);

        const latLngs: [number, number][] =
          coordinates.length > 0 ? coordinates.map(([lon, lat]) => [lat, lon]) : [origin, destination];
        const polyline = L.polyline(latLngs, { className: "carbonloop-route-line", weight: 4, opacity: 1 }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [origin, destination, coordinates]);

  if (failed) {
    return (
      <div className="flex h-64 w-full items-center justify-center border border-border sm:h-80">
        <p className="text-sm text-foreground-secondary">Map unavailable — route metrics are shown above.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="carbonloop-map h-64 w-full border border-border sm:h-80" />;
}
