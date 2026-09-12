import { FacilityType } from "@prisma/client";

import { prisma } from "../db/prisma";
import { findCandidateFacilities } from "../db/spatial";
import { CANDIDATE_SEARCH_RADIUS_KM } from "./constants";
import {
  calculateCapacityScore,
  calculateCarbonImpactScore,
  calculateCompatibilityScore,
  calculateCostScore,
  calculateDistanceScore,
  calculateOverallScore,
  estimateTransportCost,
  generateMatchReason,
} from "./scoring";
import { MatchingError, MatchingResult, RankedMatch } from "./types";

export async function findMatchesForWasteLot(
  wasteLotId: string
): Promise<MatchingResult | MatchingError> {
  // 1. Load waste lot
  const wasteLot = await prisma.wasteLot.findUnique({
    where: { id: wasteLotId },
  });

  if (!wasteLot) {
    return {
      code: "NOT_FOUND",
      message: "Waste lot not found",
    };
  }

  // 2. Find candidate facilities using PostGIS
  const candidates = await findCandidateFacilities({
    latitude: Number(wasteLot.latitude),
    longitude: Number(wasteLot.longitude),
    radiusKilometers: CANDIDATE_SEARCH_RADIUS_KM,
    wasteType: wasteLot.wasteType,
    requiredQuantityTonnes: Number(wasteLot.quantityTonnes),
  });

  // 3. Calculate scores for each candidate
  const matches: RankedMatch[] = candidates.map((candidate) => {
    const compatibility = calculateCompatibilityScore(
      wasteLot.wasteType,
      candidate.acceptedWasteTypes
    );
    const carbonImpact = calculateCarbonImpactScore(
      wasteLot.wasteType,
      candidate.facilityType as FacilityType
    );
    const distance = calculateDistanceScore(candidate.distanceKm);
    const capacity = calculateCapacityScore(
      Number(candidate.availableCapacityTonnes),
      Number(wasteLot.quantityTonnes)
    );
    
    const estimatedTransportCostInr = estimateTransportCost(
      candidate.distanceKm,
      Number(wasteLot.quantityTonnes)
    );
    const cost = calculateCostScore(estimatedTransportCostInr);

    const scores = { compatibility, carbonImpact, distance, capacity, cost };
    const overallScore = calculateOverallScore(scores);
    
    const facilityObj = {
      id: candidate.id,
      name: candidate.name,
      facilityType: candidate.facilityType as FacilityType,
      latitude: Number(candidate.latitude),
      longitude: Number(candidate.longitude),
      availableCapacityTonnes: Number(candidate.availableCapacityTonnes),
      distanceKm: candidate.distanceKm,
      acceptedWasteTypes: candidate.acceptedWasteTypes,
    };

    const matchReason = generateMatchReason(facilityObj, scores, candidate.distanceKm);

    return {
      facility: {
        id: candidate.id,
        name: candidate.name,
        facilityType: candidate.facilityType,
        latitude: Number(candidate.latitude),
        longitude: Number(candidate.longitude),
      },
      distanceKm: candidate.distanceKm,
      estimatedTransportCostInr,
      scores,
      overallScore,
      matchReason,
    };
  });

  // 4. Sort matches deterministically
  matches.sort((a, b) => {
    // 1st: Overall score descending
    if (a.overallScore !== b.overallScore) {
      return b.overallScore - a.overallScore;
    }
    // 2nd: Distance ascending
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    // 3rd: Facility ID ascending
    return a.facility.id.localeCompare(b.facility.id);
  });

  return {
    wasteLot: {
      id: wasteLot.id,
      wasteType: wasteLot.wasteType,
      quantityTonnes: Number(wasteLot.quantityTonnes),
    },
    matches,
  };
}
