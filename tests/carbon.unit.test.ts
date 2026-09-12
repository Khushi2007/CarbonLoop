import { FacilityType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM } from "../src/lib/carbon/constants";
import {
  calculateAvoidedLandfillEmissionsKgCo2e,
  calculateCarbonBreakdown,
  calculateCarbonStoredKgCo2e,
  calculateConversionOutputTonnes,
  calculateNetCo2eBenefitKgCo2e,
  calculateProcessEmissionsKgCo2e,
  calculateTransportEmissionsKgCo2e,
  getLandfillBaseline,
  getPathwayCarbonCoefficients,
} from "../src/lib/carbon/engine";

describe("Carbon calculation engine", () => {
  it("calculates every component with documented units", () => {
    expect(calculateConversionOutputTonnes(10, 82)).toBe(8.2);
    expect(calculateAvoidedLandfillEmissionsKgCo2e(10, 420)).toBe(4200);
    expect(calculateCarbonStoredKgCo2e(10, 1100)).toBe(11000);
    expect(calculateProcessEmissionsKgCo2e(10, 170)).toBe(1700);
    // 10 tonnes × 25 actual OSRM km × 0.12 kg CO2e/(tonne-km)
    expect(calculateTransportEmissionsKgCo2e(10, 25, 0.12)).toBe(30);
  });

  it("implements the CarbonLoop equation exactly", () => {
    expect(calculateNetCo2eBenefitKgCo2e(4200, 11000, 1700, 30)).toBe(13470);
  });

  it("returns a transparent, deterministic breakdown without rounding intermediates", () => {
    const input = { wasteType: "Rice Husk", conversionPathway: FacilityType.BIOCHAR, quantityTonnes: 10, processingEfficiency: 82, routeDistanceKm: 25.5555 };
    const first = calculateCarbonBreakdown(input);
    const second = calculateCarbonBreakdown(input);
    expect(first).toEqual(second);
    expect(first.conversionOutputTonnes).toBe(8.2);
    expect(first.transportEmissionsKgCo2e).toBeCloseTo(30.6666, 10);
    expect(first.netCo2eBenefitKgCo2e).toBeCloseTo(13469.3334, 10);
    expect(first.assumptions.transportEmissions).toEqual(TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM);
    expect(first.assumptions.landfillBaseline.unit).toBe("kg CO2e per tonne input");
  });

  it("looks up only configured feedstock/pathway combinations", () => {
    expect(getLandfillBaseline("Rice Husk")?.value).toBe(420);
    expect(getLandfillBaseline("Unknown Waste")).toBeUndefined();
    expect(getPathwayCarbonCoefficients("Rice Husk", FacilityType.BIOCHAR)?.carbonStored.value).toBe(1100);
    expect(getPathwayCarbonCoefficients("Rice Husk", FacilityType.BIOGAS)).toBeUndefined();
  });

  it("rejects invalid quantities, distances, and unsupported coefficients", () => {
    expect(() => calculateCarbonBreakdown({ wasteType: "Rice Husk", conversionPathway: FacilityType.BIOCHAR, quantityTonnes: 0, processingEfficiency: 82, routeDistanceKm: 1 })).toThrow("quantity");
    expect(() => calculateCarbonBreakdown({ wasteType: "Rice Husk", conversionPathway: FacilityType.BIOCHAR, quantityTonnes: 1, processingEfficiency: 82, routeDistanceKm: -1 })).toThrow("distance");
    expect(() => calculateCarbonBreakdown({ wasteType: "Rice Husk", conversionPathway: FacilityType.BIOGAS, quantityTonnes: 1, processingEfficiency: 82, routeDistanceKm: 1 })).toThrow("Unsupported carbon coefficient");
  });
});
