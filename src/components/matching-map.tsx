"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

import { formatKm } from "@/components/ui/format";
import { formatInr } from "@/components/ui/stat";
import type { RankedMatch } from "@/hooks/use-matches";

type LatLng = [number, number];

/**
 * Candidate-facility GIS view: "where are my viable facilities and how do
 * they compare?" — distinct from RouteMap, which answers "what actual road
 * route will the shipment take to the one facility I picked?". This
 * component never touches routing; selecting a marker only reports the
 * chosen facility ID back up via `onSelectFacility`, which the caller wires
 * to the same `planRoute()` already used by the candidate list's own
 * "Plan Route →" action — there is exactly one route-planning path.
 *
 * Leaflet loading mirrors route-map.tsx exactly: dynamic `import("leaflet")`
 * inside a `useEffect` so its browser-only code never runs during SSR, with
 * an identical container/fallback shape to avoid a hydration mismatch.
 */
export function MatchingMap({
  origin,
  candidates,
  selectedFacilityId,
  onSelectFacility,
}: {
  origin: LatLng;
  candidates: RankedMatch[];
  selectedFacilityId?: string;
  onSelectFacility: (facilityId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  // Keeps the latest callback available to marker click handlers without
  // making it a useEffect dependency — planRoute is a fresh function
  // identity on every render of the parent, and rebuilding the whole map on
  // every unrelated re-render (e.g. while a route/carbon/shipment step
  // elsewhere on the page is loading) would be wasteful, flicker-prone, and
  // unnecessary for a live demo.
  const onSelectFacilityRef = useRef(onSelectFacility);
  useEffect(() => {
    onSelectFacilityRef.current = onSelectFacility;
  }, [onSelectFacility]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;

    import("leaflet")
      .then(({ default: L }) => {
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, { scrollWheelZoom: false });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        const originIcon = L.divIcon({ className: "carbonloop-marker carbonloop-marker--origin", iconSize: [12, 12] });
        L.marker(origin, { icon: originIcon }).addTo(map).bindTooltip("Waste lot", { direction: "top" });

        const bounds = L.latLngBounds([origin]);

        candidates.forEach((candidate, index) => {
          const rank = index + 1;
          const isSelected = candidate.facility.id === selectedFacilityId;
          const icon = L.divIcon({
            className: `carbonloop-marker carbonloop-marker--candidate ${isSelected ? "carbonloop-marker--candidate-selected" : ""}`,
            html: `<span>${rank}</span>`,
            iconSize: isSelected ? [26, 26] : [20, 20],
          });
          const position: LatLng = [candidate.facility.latitude, candidate.facility.longitude];
          bounds.extend(position);

          const popup = document.createElement("div");
          popup.className = "carbonloop-map-popup";

          const title = document.createElement("p");
          title.className = "carbonloop-map-popup-title";
          title.textContent = `#${rank} ${candidate.facility.name}`;
          popup.appendChild(title);

          const details = document.createElement("dl");
          details.className = "carbonloop-map-popup-details";
          const addRow = (label: string, value: string) => {
            const dt = document.createElement("dt");
            dt.textContent = label;
            const dd = document.createElement("dd");
            dd.textContent = value;
            details.appendChild(dt);
            details.appendChild(dd);
          };
          addRow("Score", candidate.overallScore.toFixed(1));
          addRow("Distance", formatKm(candidate.distanceKm));
          addRow("Est. cost", formatInr(candidate.estimatedTransportCostInr));
          popup.appendChild(details);

          const action = document.createElement("button");
          action.type = "button";
          action.className = "carbonloop-map-popup-action";
          action.textContent = "Plan Route →";
          action.addEventListener("click", () => onSelectFacilityRef.current(candidate.facility.id));
          popup.appendChild(action);

          const marker = L.marker(position, { icon }).addTo(map!).bindPopup(popup);
          marker.on("click", () => onSelectFacilityRef.current(candidate.facility.id));
        });

        if (candidates.length > 0) {
          map.fitBounds(bounds, { padding: [32, 32] });
        } else {
          map.setView(origin, 9);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [origin, candidates, selectedFacilityId]);

  if (failed) {
    return (
      <div className="flex h-64 w-full items-center justify-center border border-border sm:h-80">
        <p className="text-sm text-foreground-secondary">Map unavailable — candidates are listed below.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="carbonloop-map h-64 w-full border border-border sm:h-80" />;
}
