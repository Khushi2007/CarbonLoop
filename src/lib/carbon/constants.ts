import { FacilityType } from "@prisma/client";

import { CarbonCoefficient, PathwayCarbonCoefficients } from "./types";

const demoCoefficient = (
  id: string,
  value: number,
  unit: CarbonCoefficient["unit"],
  description: string
): CarbonCoefficient => ({
  id,
  value,
  unit,
  assumption: "illustrative-demo-mvp",
  description,
});

/**
 * Illustrative MVP landfill baselines. These are configuration placeholders,
 * not certified, verified, or universally applicable carbon-accounting values.
 */
export const LANDFILL_BASELINES_KG_CO2E_PER_TONNE: Record<string, CarbonCoefficient> = {
  "Rice Husk": demoCoefficient("demo-landfill-rice-husk-v1", 420, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Rice Husk."),
  "Wheat Straw": demoCoefficient("demo-landfill-wheat-straw-v1", 400, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Wheat Straw."),
  "Sugarcane Bagasse": demoCoefficient("demo-landfill-sugarcane-bagasse-v1", 380, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Sugarcane Bagasse."),
  "Food Waste": demoCoefficient("demo-landfill-food-waste-v1", 650, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Food Waste."),
  "Cattle Manure": demoCoefficient("demo-landfill-cattle-manure-v1", 580, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Cattle Manure."),
  "Cotton Residue": demoCoefficient("demo-landfill-cotton-residue-v1", 360, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Cotton Residue."),
  "Corn Stover": demoCoefficient("demo-landfill-corn-stover-v1", 390, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Corn Stover."),
  "Wood Residue": demoCoefficient("demo-landfill-wood-residue-v1", 300, "kg CO2e per tonne input", "Estimated avoided landfill emissions for Wood Residue."),
};

const pathway = (wasteType: string, facilityType: FacilityType, carbonStored: number, processEmissions: number): PathwayCarbonCoefficients => ({
  carbonStored: demoCoefficient(`demo-storage-${wasteType.toLowerCase().replaceAll(" ", "-")}-${facilityType.toLowerCase()}-v1`, carbonStored, "kg CO2e per tonne input", `Estimated carbon stored for ${wasteType} through ${facilityType}.`),
  processEmissions: demoCoefficient(`demo-process-${wasteType.toLowerCase().replaceAll(" ", "-")}-${facilityType.toLowerCase()}-v1`, processEmissions, "kg CO2e per tonne input", `Estimated processing emissions for ${wasteType} through ${facilityType}.`),
});

/**
 * Illustrative MVP coefficients keyed by the existing feedstock and facility
 * taxonomy. Missing combinations are deliberately unsupported rather than
 * receiving an unrelated fallback value.
 */
export const PATHWAY_CARBON_COEFFICIENTS: Record<string, Partial<Record<FacilityType, PathwayCarbonCoefficients>>> = {
  "Rice Husk": { BIOCHAR: pathway("Rice Husk", FacilityType.BIOCHAR, 1100, 170), BIOMATERIAL: pathway("Rice Husk", FacilityType.BIOMATERIAL, 520, 120), COMPOST: pathway("Rice Husk", FacilityType.COMPOST, 110, 90) },
  "Wheat Straw": { BIOCHAR: pathway("Wheat Straw", FacilityType.BIOCHAR, 1050, 180), BIOMATERIAL: pathway("Wheat Straw", FacilityType.BIOMATERIAL, 500, 125), COMPOST: pathway("Wheat Straw", FacilityType.COMPOST, 120, 95) },
  "Sugarcane Bagasse": { BIOCHAR: pathway("Sugarcane Bagasse", FacilityType.BIOCHAR, 1080, 175), BIOGAS: pathway("Sugarcane Bagasse", FacilityType.BIOGAS, 60, 150) },
  "Food Waste": { BIOGAS: pathway("Food Waste", FacilityType.BIOGAS, 70, 145), COMPOST: pathway("Food Waste", FacilityType.COMPOST, 130, 100) },
  "Cattle Manure": { BIOGAS: pathway("Cattle Manure", FacilityType.BIOGAS, 80, 140), COMPOST: pathway("Cattle Manure", FacilityType.COMPOST, 140, 95) },
  "Cotton Residue": { BIOCHAR: pathway("Cotton Residue", FacilityType.BIOCHAR, 1000, 185), BIOMATERIAL: pathway("Cotton Residue", FacilityType.BIOMATERIAL, 560, 115) },
  "Corn Stover": { BIOCHAR: pathway("Corn Stover", FacilityType.BIOCHAR, 1020, 180), BIOGAS: pathway("Corn Stover", FacilityType.BIOGAS, 65, 155), BIOMATERIAL: pathway("Corn Stover", FacilityType.BIOMATERIAL, 510, 120) },
  "Wood Residue": { BIOCHAR: pathway("Wood Residue", FacilityType.BIOCHAR, 1150, 165), BIOMATERIAL: pathway("Wood Residue", FacilityType.BIOMATERIAL, 580, 110) },
};

/** Facility pathways with illustrative MVP carbon coefficients. */
export const SUPPORTED_CARBON_CONVERSION_PATHWAYS = new Set<FacilityType>([
  FacilityType.BIOCHAR,
  FacilityType.BIOGAS,
  FacilityType.BIOMATERIAL,
  FacilityType.COMPOST,
]);

/** Illustrative MVP vehicle-emission factor; independent from transport cost. */
export const TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM = demoCoefficient(
  "demo-road-transport-v1",
  0.12,
  "kg CO2e per tonne-km",
  "Estimated road transport emissions per tonne-kilometre."
);
