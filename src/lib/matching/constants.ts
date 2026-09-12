import { FacilityType } from "@prisma/client";

// Core scoring weights (must sum to 1.0)
export const WEIGHTS = {
  COMPATIBILITY: 0.3,
  CARBON_IMPACT: 0.25,
  DISTANCE: 0.2,
  CAPACITY: 0.15,
  COST: 0.1,
} as const;

// Normalization constants
export const MAX_DISTANCE_KM = 500;
export const MAX_TRANSPORT_COST_INR = 150_000;
export const TRANSPORT_RATE_INR_PER_TONNE_KM = 12;
export const CANDIDATE_SEARCH_RADIUS_KM = 500;
export const CAPACITY_HEADROOM_CEILING_TONNES = 500;

// Relative Carbon Impact Configuration
// This is a relative decision score (0-100), not an actual emissions calculation.
// It represents the relative attractiveness of conversion pathways for CarbonLoop's objectives.
export const CARBON_IMPACT_SCORES: Record<string, Record<FacilityType, number>> = {
  "Rice Husk": {
    [FacilityType.BIOCHAR]: 100, // High silica, great for biochar
    [FacilityType.BIOGAS]: 40,
    [FacilityType.BIOMATERIAL]: 80,
    [FacilityType.COMPOST]: 30,
    [FacilityType.OTHER]: 10,
  },
  "Wheat Straw": {
    [FacilityType.BIOCHAR]: 90,
    [FacilityType.BIOGAS]: 60,
    [FacilityType.BIOMATERIAL]: 85,
    [FacilityType.COMPOST]: 50,
    [FacilityType.OTHER]: 10,
  },
  "Sugarcane Bagasse": {
    [FacilityType.BIOCHAR]: 95,
    [FacilityType.BIOGAS]: 70,
    [FacilityType.BIOMATERIAL]: 90,
    [FacilityType.COMPOST]: 40,
    [FacilityType.OTHER]: 10,
  },
  "Food Waste": {
    [FacilityType.BIOCHAR]: 20, // Too wet for efficient biochar
    [FacilityType.BIOGAS]: 100, // Excellent for biogas
    [FacilityType.BIOMATERIAL]: 10,
    [FacilityType.COMPOST]: 90, // Excellent for compost
    [FacilityType.OTHER]: 10,
  },
  "Cattle Manure": {
    [FacilityType.BIOCHAR]: 30,
    [FacilityType.BIOGAS]: 100, // Excellent for biogas
    [FacilityType.BIOMATERIAL]: 10,
    [FacilityType.COMPOST]: 95, // Excellent for compost
    [FacilityType.OTHER]: 10,
  },
  "Cotton Residue": {
    [FacilityType.BIOCHAR]: 85,
    [FacilityType.BIOGAS]: 40,
    [FacilityType.BIOMATERIAL]: 100, // Excellent for biomaterials (textile reuse)
    [FacilityType.COMPOST]: 30,
    [FacilityType.OTHER]: 10,
  },
  "Corn Stover": {
    [FacilityType.BIOCHAR]: 80,
    [FacilityType.BIOGAS]: 75,
    [FacilityType.BIOMATERIAL]: 80,
    [FacilityType.COMPOST]: 60,
    [FacilityType.OTHER]: 10,
  },
  "Wood Residue": {
    [FacilityType.BIOCHAR]: 100, // Excellent for biochar
    [FacilityType.BIOGAS]: 20, // Poor for biogas (lignin)
    [FacilityType.BIOMATERIAL]: 95, // Excellent for structural biomaterials
    [FacilityType.COMPOST]: 40, // Slow to compost
    [FacilityType.OTHER]: 10,
  },
};

// Fallback score if waste type is not in configuration
export const DEFAULT_CARBON_IMPACT_SCORE = 50;
