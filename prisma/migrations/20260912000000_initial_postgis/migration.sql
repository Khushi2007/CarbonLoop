CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "UserRole" AS ENUM ('GENERATOR', 'FACILITY', 'ADMIN');
CREATE TYPE "WasteLotStatus" AS ENUM ('AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'PROCESSED', 'CANCELLED');
CREATE TYPE "FacilityType" AS ENUM ('BIOCHAR', 'BIOGAS', 'BIOMATERIAL', 'COMPOST', 'OTHER');
CREATE TYPE "FacilityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "ShipmentStatus" AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "name" TEXT NOT NULL, "role" "UserRole" NOT NULL,
  "organization" TEXT, "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6), "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_latitude_range" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  CONSTRAINT "users_longitude_range" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
);

CREATE TABLE "waste_lots" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "generator_id" UUID NOT NULL, "waste_type" TEXT NOT NULL,
  "quantity_tonnes" DECIMAL(12,3) NOT NULL, "moisture_percent" DECIMAL(5,2), "quality_score" DECIMAL(5,2),
  "latitude" DECIMAL(9,6) NOT NULL, "longitude" DECIMAL(9,6) NOT NULL, "available_from" TIMESTAMPTZ(6) NOT NULL,
  "status" "WasteLotStatus" NOT NULL DEFAULT 'AVAILABLE', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "waste_lots_quantity_nonnegative" CHECK ("quantity_tonnes" >= 0),
  CONSTRAINT "waste_lots_moisture_range" CHECK ("moisture_percent" IS NULL OR "moisture_percent" BETWEEN 0 AND 100),
  CONSTRAINT "waste_lots_quality_range" CHECK ("quality_score" IS NULL OR "quality_score" BETWEEN 0 AND 100),
  CONSTRAINT "waste_lots_latitude_range" CHECK ("latitude" BETWEEN -90 AND 90),
  CONSTRAINT "waste_lots_longitude_range" CHECK ("longitude" BETWEEN -180 AND 180)
);

CREATE TABLE "facilities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "name" TEXT NOT NULL, "facility_type" "FacilityType" NOT NULL,
  "description" TEXT, "latitude" DECIMAL(9,6) NOT NULL, "longitude" DECIMAL(9,6) NOT NULL,
  "capacity_tonnes_per_day" DECIMAL(12,3) NOT NULL, "available_capacity_tonnes" DECIMAL(12,3) NOT NULL,
  "processing_efficiency" DECIMAL(5,2) NOT NULL, "accepted_waste_types" TEXT[] NOT NULL,
  "status" "FacilityStatus" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "facilities_capacity_nonnegative" CHECK ("capacity_tonnes_per_day" >= 0 AND "available_capacity_tonnes" >= 0),
  CONSTRAINT "facilities_efficiency_range" CHECK ("processing_efficiency" BETWEEN 0 AND 100),
  CONSTRAINT "facilities_latitude_range" CHECK ("latitude" BETWEEN -90 AND 90),
  CONSTRAINT "facilities_longitude_range" CHECK ("longitude" BETWEEN -180 AND 180)
);

CREATE TABLE "matches" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "waste_lot_id" UUID NOT NULL, "facility_id" UUID NOT NULL,
  "compatibility_score" DECIMAL(5,2) NOT NULL, "carbon_score" DECIMAL(5,2) NOT NULL, "distance_score" DECIMAL(5,2) NOT NULL,
  "capacity_score" DECIMAL(5,2) NOT NULL, "cost_score" DECIMAL(5,2) NOT NULL, "overall_score" DECIMAL(5,2) NOT NULL,
  "match_reason" TEXT, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "matches_waste_lot_id_facility_id_key" UNIQUE ("waste_lot_id", "facility_id"),
  CONSTRAINT "matches_scores_range" CHECK ("compatibility_score" BETWEEN 0 AND 100 AND "carbon_score" BETWEEN 0 AND 100 AND "distance_score" BETWEEN 0 AND 100 AND "capacity_score" BETWEEN 0 AND 100 AND "cost_score" BETWEEN 0 AND 100 AND "overall_score" BETWEEN 0 AND 100)
);

CREATE TABLE "shipments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "waste_lot_id" UUID NOT NULL, "facility_id" UUID NOT NULL,
  "distance_km" DECIMAL(12,3) NOT NULL, "duration_minutes" INTEGER NOT NULL, "transport_cost" DECIMAL(14,2) NOT NULL,
  "transport_emissions_kg_co2e" DECIMAL(14,3) NOT NULL, "route_geometry" JSONB, "status" "ShipmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "scheduled_at" TIMESTAMPTZ(6), "completed_at" TIMESTAMPTZ(6), "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shipments_values_nonnegative" CHECK ("distance_km" >= 0 AND "duration_minutes" >= 0 AND "transport_cost" >= 0 AND "transport_emissions_kg_co2e" >= 0)
);

CREATE TABLE "carbon_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "shipment_id" UUID NOT NULL UNIQUE, "waste_quantity_tonnes" DECIMAL(12,3) NOT NULL,
  "conversion_pathway" TEXT NOT NULL, "conversion_output_tonnes" DECIMAL(12,3) NOT NULL,
  "avoided_landfill_emissions_kg_co2e" DECIMAL(14,3) NOT NULL, "carbon_stored_kg_co2e" DECIMAL(14,3) NOT NULL,
  "process_emissions_kg_co2e" DECIMAL(14,3) NOT NULL, "transport_emissions_kg_co2e" DECIMAL(14,3) NOT NULL,
  "net_co2e_benefit_kg" DECIMAL(14,3) NOT NULL, "estimated_economic_value_inr" DECIMAL(14,2) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "carbon_records_values_nonnegative" CHECK ("waste_quantity_tonnes" >= 0 AND "conversion_output_tonnes" >= 0 AND "avoided_landfill_emissions_kg_co2e" >= 0 AND "carbon_stored_kg_co2e" >= 0 AND "process_emissions_kg_co2e" >= 0 AND "transport_emissions_kg_co2e" >= 0)
);

ALTER TABLE "waste_lots" ADD CONSTRAINT "waste_lots_generator_id_fkey" FOREIGN KEY ("generator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_waste_lot_id_fkey" FOREIGN KEY ("waste_lot_id") REFERENCES "waste_lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_waste_lot_id_fkey" FOREIGN KEY ("waste_lot_id") REFERENCES "waste_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "carbon_records" ADD CONSTRAINT "carbon_records_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_latitude_idx" ON "users"("latitude");
CREATE INDEX "users_longitude_idx" ON "users"("longitude");
CREATE INDEX "waste_lots_waste_type_idx" ON "waste_lots"("waste_type");
CREATE INDEX "waste_lots_status_idx" ON "waste_lots"("status");
CREATE INDEX "waste_lots_waste_type_status_idx" ON "waste_lots"("waste_type", "status");
CREATE INDEX "waste_lots_latitude_idx" ON "waste_lots"("latitude");
CREATE INDEX "waste_lots_longitude_idx" ON "waste_lots"("longitude");
CREATE INDEX "waste_lots_available_from_idx" ON "waste_lots"("available_from");
CREATE INDEX "facilities_facility_type_idx" ON "facilities"("facility_type");
CREATE INDEX "facilities_status_idx" ON "facilities"("status");
CREATE INDEX "facilities_available_capacity_tonnes_idx" ON "facilities"("available_capacity_tonnes");
CREATE INDEX "facilities_matching_idx" ON "facilities"("facility_type", "status", "available_capacity_tonnes");
CREATE INDEX "facilities_latitude_idx" ON "facilities"("latitude");
CREATE INDEX "facilities_longitude_idx" ON "facilities"("longitude");
CREATE INDEX "facilities_accepted_waste_types_idx" ON "facilities" USING GIN ("accepted_waste_types");
CREATE INDEX "matches_facility_id_idx" ON "matches"("facility_id");
CREATE INDEX "matches_overall_score_idx" ON "matches"("overall_score");
CREATE INDEX "shipments_waste_lot_id_idx" ON "shipments"("waste_lot_id");
CREATE INDEX "shipments_facility_id_idx" ON "shipments"("facility_id");
CREATE INDEX "shipments_status_idx" ON "shipments"("status");
CREATE INDEX "shipments_scheduled_at_idx" ON "shipments"("scheduled_at");
CREATE INDEX "carbon_records_created_at_idx" ON "carbon_records"("created_at");
