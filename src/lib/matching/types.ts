import { FacilityType } from "@prisma/client";

export type MatchingRequest = {
  wasteLotId: string;
};

export type ScoreComponents = {
  compatibility: number;
  carbonImpact: number;
  distance: number;
  capacity: number;
  cost: number;
};

export type CandidateFacility = {
  id: string;
  name: string;
  facilityType: FacilityType;
  latitude: number;
  longitude: number;
  availableCapacityTonnes: number;
  distanceKm: number;
  acceptedWasteTypes: string[];
};

export type RankedMatch = {
  facility: {
    id: string;
    name: string;
    facilityType: string;
    latitude: number;
    longitude: number;
  };
  distanceKm: number;
  estimatedTransportCostInr: number;
  scores: ScoreComponents;
  overallScore: number;
  matchReason: string;
};

export type WasteLotSummary = {
  id: string;
  wasteType: string;
  quantityTonnes: number;
};

export type MatchingResult = {
  wasteLot: WasteLotSummary;
  matches: RankedMatch[];
};

export type MatchingError = {
  code: "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
  message: string;
};
