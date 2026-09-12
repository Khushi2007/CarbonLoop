import { FacilityType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT } from "../src/lib/economics/constants";
import { calculateAvoidedLandfillValueInr, calculateCarbonRelatedValueInr, calculateConversionOutputValueInr, calculateEconomicBreakdown, calculateEstimatedEconomicValueInr, getAvoidedLandfillValueCoefficient, getConversionOutputValueCoefficient } from "../src/lib/economics/engine";

describe("Economic value engine", () => {
  it("calculates transparent components and subtracts transport as an expense", () => {
    expect(calculateAvoidedLandfillValueInr(10, 700)).toBe(7000);
    expect(calculateConversionOutputValueInr(8.2, 12000)).toBeCloseTo(98400, 10);
    expect(calculateCarbonRelatedValueInr(13470, 0)).toBe(0);
    expect(calculateEstimatedEconomicValueInr(3000, 7000, 98400, 0)).toBe(102400);
  });

  it("uses configured coefficients and zero default carbon-related valuation", () => {
    expect(getAvoidedLandfillValueCoefficient("Rice Husk")?.value).toBe(700);
    expect(getConversionOutputValueCoefficient(FacilityType.BIOCHAR)?.value).toBe(12000);
    expect(getConversionOutputValueCoefficient(FacilityType.OTHER)).toBeUndefined();
    expect(CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT.value).toBe(0);
  });

  it("converts carbon kg to tonnes only for carbon-related valuation", () => {
    expect(calculateCarbonRelatedValueInr(2500, 100)).toBe(250);
  });

  it("returns deterministic breakdowns and rejects unsupported combinations", () => {
    const input = { wasteType: "Rice Husk", conversionPathway: FacilityType.BIOCHAR, wasteQuantityTonnes: 10, conversionOutputTonnes: 8.2, transportCostInr: 3000, netCo2eBenefitKgCo2e: 13470 };
    expect(calculateEconomicBreakdown(input).estimatedEconomicValueInr).toBeCloseTo(102400, 10);
    expect(() => calculateEconomicBreakdown({ ...input, conversionPathway: FacilityType.OTHER })).toThrow("Unsupported conversion pathway");
  });
});
