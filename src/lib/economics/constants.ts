import { FacilityType } from "@prisma/client";

import { EconomicCoefficient } from "./types";

const demo = (id: string, value: number, unit: EconomicCoefficient["unit"], description: string): EconomicCoefficient => ({ id, value, unit, assumption: "illustrative-demo-mvp", description });

/** Illustrative MVP avoided-disposal savings; not a tariff or market quote. */
export const AVOIDED_LANDFILL_VALUE_INR_PER_TONNE: Record<string, EconomicCoefficient> = {
  "Rice Husk": demo("demo-landfill-value-rice-husk-v1", 700, "INR per tonne input", "Illustrative avoided landfill/disposal value for Rice Husk."),
  "Wheat Straw": demo("demo-landfill-value-wheat-straw-v1", 700, "INR per tonne input", "Illustrative avoided landfill/disposal value for Wheat Straw."),
  "Sugarcane Bagasse": demo("demo-landfill-value-sugarcane-bagasse-v1", 650, "INR per tonne input", "Illustrative avoided landfill/disposal value for Sugarcane Bagasse."),
  "Food Waste": demo("demo-landfill-value-food-waste-v1", 1000, "INR per tonne input", "Illustrative avoided landfill/disposal value for Food Waste."),
  "Cattle Manure": demo("demo-landfill-value-cattle-manure-v1", 850, "INR per tonne input", "Illustrative avoided landfill/disposal value for Cattle Manure."),
  "Cotton Residue": demo("demo-landfill-value-cotton-residue-v1", 750, "INR per tonne input", "Illustrative avoided landfill/disposal value for Cotton Residue."),
  "Corn Stover": demo("demo-landfill-value-corn-stover-v1", 700, "INR per tonne input", "Illustrative avoided landfill/disposal value for Corn Stover."),
  "Wood Residue": demo("demo-landfill-value-wood-residue-v1", 600, "INR per tonne input", "Illustrative avoided landfill/disposal value for Wood Residue."),
};

/** Illustrative MVP output values, by existing facility pathway. */
export const CONVERSION_OUTPUT_VALUE_INR_PER_TONNE: Partial<Record<FacilityType, EconomicCoefficient>> = {
  [FacilityType.BIOCHAR]: demo("demo-output-value-biochar-v1", 12000, "INR per tonne output", "Illustrative biochar output value."),
  [FacilityType.BIOGAS]: demo("demo-output-value-biogas-v1", 5500, "INR per tonne output", "Illustrative biogas output value."),
  [FacilityType.BIOMATERIAL]: demo("demo-output-value-biomaterial-v1", 18000, "INR per tonne output", "Illustrative biomaterial output value."),
  [FacilityType.COMPOST]: demo("demo-output-value-compost-v1", 3500, "INR per tonne output", "Illustrative compost output value."),
};

/** Deliberately zero for the MVP: no carbon-credit or market-price claim. */
export const CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT = demo("demo-carbon-related-value-v1", 0, "INR per tonne CO2e benefit", "Illustrative carbon-related value is disabled (zero) for this MVP.");
