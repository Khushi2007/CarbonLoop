import { FacilityType } from "@prisma/client";

import {
  CAPACITY_HEADROOM_CEILING_TONNES,
  CARBON_IMPACT_SCORES,
  DEFAULT_CARBON_IMPACT_SCORE,
  MAX_DISTANCE_KM,
  MAX_TRANSPORT_COST_INR,
  TRANSPORT_RATE_INR_PER_TONNE_KM,
  WEIGHTS,
} from "./constants";
import { CandidateFacility, ScoreComponents } from "./types";

export function calculateCompatibilityScore(
  wasteType: string,
  acceptedWasteTypes: string[]
): number {
  if (acceptedWasteTypes.includes(wasteType)) {
    return 100;
  }
  return 0;
}

export function calculateCarbonImpactScore(
  wasteType: string,
  facilityType: FacilityType
): number {
  const scoresForWaste = CARBON_IMPACT_SCORES[wasteType];
  if (scoresForWaste && facilityType in scoresForWaste) {
    return scoresForWaste[facilityType] ?? DEFAULT_CARBON_IMPACT_SCORE;
  }
  return DEFAULT_CARBON_IMPACT_SCORE;
}

export function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm < 0) return 0;
  const score = 100 * (1 - distanceKm / MAX_DISTANCE_KM);
  return Math.max(0, Math.min(100, score));
}

export function calculateCapacityScore(
  availableCapacityTonnes: number,
  requiredQuantityTonnes: number
): number {
  const headroom = availableCapacityTonnes - requiredQuantityTonnes;
  if (headroom < 0) return 0;
  
  const score = 100 * (headroom / CAPACITY_HEADROOM_CEILING_TONNES);
  return Math.max(0, Math.min(100, score));
}

export function estimateTransportCost(
  distanceKm: number,
  quantityTonnes: number
): number {
  if (distanceKm < 0 || quantityTonnes < 0) return 0;
  return distanceKm * quantityTonnes * TRANSPORT_RATE_INR_PER_TONNE_KM;
}

export function calculateCostScore(estimatedCostInr: number): number {
  if (estimatedCostInr < 0) return 0;
  const score = 100 * (1 - estimatedCostInr / MAX_TRANSPORT_COST_INR);
  return Math.max(0, Math.min(100, score));
}

export function calculateOverallScore(scores: ScoreComponents): number {
  const overall =
    WEIGHTS.COMPATIBILITY * scores.compatibility +
    WEIGHTS.CARBON_IMPACT * scores.carbonImpact +
    WEIGHTS.DISTANCE * scores.distance +
    WEIGHTS.CAPACITY * scores.capacity +
    WEIGHTS.COST * scores.cost;
  
  return Math.max(0, Math.min(100, Number(overall.toFixed(2))));
}

export function generateMatchReason(
  facility: CandidateFacility,
  scores: ScoreComponents,
  distanceKm: number
): string {
  const parts: string[] = [];

  if (scores.compatibility > 80) {
    parts.push("Highly compatible facility");
  } else if (scores.compatibility > 0) {
    parts.push("Compatible facility");
  } else {
    parts.push("Incompatible facility");
  }

  if (scores.carbonImpact > 80) {
    parts.push(`excellent for ${facility.facilityType.toLowerCase()} conversion pathway`);
  } else {
    parts.push(`suitable for ${facility.facilityType.toLowerCase()} conversion pathway`);
  }

  if (scores.capacity > 80) {
    parts.push("with abundant available capacity");
  } else {
    parts.push("with sufficient capacity");
  }

  if (distanceKm < 50) {
    parts.push("and short transport distance.");
  } else if (distanceKm < 200) {
    parts.push("and reasonable transport distance.");
  } else {
    parts.push("and long transport distance.");
  }

  return parts.join(" ");
}
