import "dotenv/config";

import {
  FacilityStatus,
  FacilityType,
  PrismaClient,
  UserRole,
  WasteLotStatus,
} from "@prisma/client";

const DEMO_DATE = new Date("2026-09-15T09:00:00.000Z");
const userId = (index: number) => `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`;
const facilityId = (index: number) => `22222222-2222-4222-8222-${String(index).padStart(12, "0")}`;
const lotId = (index: number) => `33333333-3333-4333-8333-${String(index).padStart(12, "0")}`;

export const DEMO_GENERATOR_IDS = Array.from({ length: 8 }, (_, index) => userId(index + 1));
export const DEMO_FACILITY_IDS = Array.from({ length: 12 }, (_, index) => facilityId(index + 1));
export const DEMO_WASTE_LOT_IDS = Array.from({ length: 24 }, (_, index) => lotId(index + 1));

const generators = [
  ["Anand Dairy Cooperative (Demo)", "Anand", 22.5645, 72.9289],
  ["Kheda Farm Collective (Demo)", "Nadiad", 22.6916, 72.8634],
  ["Bharuch Agro Hub (Demo)", "Bharuch", 21.7051, 72.9959],
  ["Surat Food Market (Demo)", "Surat", 21.1702, 72.8311],
  ["Vadodara Grain Network (Demo)", "Vadodara", 22.3072, 73.1812],
  ["Mehsana Rural Producers (Demo)", "Mehsana", 23.588, 72.3693],
  ["Rajkot Cotton Collective (Demo)", "Rajkot", 22.3039, 70.8022],
  ["Ahmedabad Woodworks Cluster (Demo)", "Ahmedabad", 23.0225, 72.5714],
] as const;

const facilities = [
  ["Anand Biochar Demonstration Unit", FacilityType.BIOCHAR, 22.558, 72.94, 40, 250, 82, ["Rice Husk", "Wheat Straw", "Cotton Residue"]],
  ["Vadodara Bagasse Biochar Unit", FacilityType.BIOCHAR, 22.299, 73.195, 55, 310, 85, ["Sugarcane Bagasse", "Corn Stover", "Wood Residue"]],
  ["Surat Organic Biogas Plant", FacilityType.BIOGAS, 21.185, 72.82, 90, 500, 88, ["Food Waste", "Cattle Manure", "Sugarcane Bagasse"]],
  ["Bharuch Biogas Demonstration Plant", FacilityType.BIOGAS, 21.69, 73.01, 65, 380, 84, ["Cattle Manure", "Food Waste", "Corn Stover"]],
  ["Ahmedabad Biomaterial Lab", FacilityType.BIOMATERIAL, 23.04, 72.58, 25, 120, 76, ["Rice Husk", "Wheat Straw", "Wood Residue"]],
  ["Rajkot Fiber Biomaterial Unit", FacilityType.BIOMATERIAL, 22.29, 70.815, 35, 180, 79, ["Cotton Residue", "Corn Stover", "Wheat Straw"]],
  ["Mehsana Compost Resource Centre", FacilityType.COMPOST, 23.6, 72.36, 70, 420, 80, ["Food Waste", "Cattle Manure", "Wheat Straw"]],
  ["Nadiad Compost Demonstration Site", FacilityType.COMPOST, 22.68, 72.87, 45, 260, 78, ["Food Waste", "Cattle Manure", "Rice Husk"]],
  ["Gandhinagar Biochar Pilot", FacilityType.BIOCHAR, 23.215, 72.636, 30, 160, 81, ["Rice Husk", "Wood Residue", "Cotton Residue"]],
  ["Navsari Biogas Resource Centre", FacilityType.BIOGAS, 20.95, 72.93, 50, 290, 86, ["Food Waste", "Cattle Manure", "Sugarcane Bagasse"]],
  ["Patan Compost Pilot", FacilityType.COMPOST, 23.85, 72.12, 35, 190, 75, ["Wheat Straw", "Cattle Manure", "Food Waste"]],
  ["Bhavnagar Biomaterial Studio", FacilityType.BIOMATERIAL, 21.765, 72.151, 20, 100, 74, ["Cotton Residue", "Wood Residue", "Rice Husk"]],
] as const;

const wasteTypes = ["Rice Husk", "Wheat Straw", "Sugarcane Bagasse", "Food Waste", "Cattle Manure", "Cotton Residue", "Corn Stover", "Wood Residue"];

export async function seedDatabase(client: PrismaClient) {
  for (const [index, generator] of generators.entries()) {
    await client.user.upsert({
      where: { id: userId(index + 1) },
      update: { name: generator[0], organization: `${generator[1]} synthetic demo network`, latitude: generator[2], longitude: generator[3] },
      create: { id: userId(index + 1), name: generator[0], role: UserRole.GENERATOR, organization: `${generator[1]} synthetic demo network`, latitude: generator[2], longitude: generator[3] },
    });
  }

  for (const [index, facility] of facilities.entries()) {
    const data = { name: facility[0], facilityType: facility[1], description: "Synthetic/demo facility only — not a real company or verified facility.", latitude: facility[2], longitude: facility[3], capacityTonnesPerDay: facility[4], availableCapacityTonnes: facility[5], processingEfficiency: facility[6], acceptedWasteTypes: [...facility[7]], status: FacilityStatus.ACTIVE };
    await client.facility.upsert({ where: { id: facilityId(index + 1) }, update: data, create: { id: facilityId(index + 1), ...data } });
  }

  for (const [index, wasteType] of Array.from({ length: 24 }, (_, index) => wasteTypes[index % wasteTypes.length]).entries()) {
    const generator = generators[index % generators.length];
    // Lifecycle status is deliberately excluded from `data` (and therefore from the
    // `update` payload): re-running the seed must never revert an existing lot that
    // has since become MATCHED/PROCESSED back to AVAILABLE while its shipment/carbon
    // records still reference it. Only a newly created lot starts out AVAILABLE.
    const data = { generatorId: userId((index % generators.length) + 1), wasteType, quantityTonnes: 8 + (index % 6) * 4.5, moisturePercent: 12 + (index % 5) * 8, qualityScore: 68 + (index % 6) * 5, latitude: generator[2] + (index % 3) * 0.008, longitude: generator[3] + (index % 4) * 0.007, availableFrom: new Date(DEMO_DATE.getTime() + index * 86_400_000) };
    await client.wasteLot.upsert({ where: { id: lotId(index + 1) }, update: data, create: { id: lotId(index + 1), ...data, status: WasteLotStatus.AVAILABLE } });
  }
}

async function main() {
  const client = new PrismaClient();
  await seedDatabase(client);
  await client.$disconnect();
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main().catch(async (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
