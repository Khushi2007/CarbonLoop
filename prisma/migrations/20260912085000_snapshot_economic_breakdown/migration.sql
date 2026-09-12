-- Snapshot economic components so completed ledger records remain historical
-- when configurable economic coefficients change in future releases.
ALTER TABLE "carbon_records"
  ADD COLUMN "avoided_landfill_value_inr" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "conversion_output_value_inr" DECIMAL(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "carbon_related_value_inr" DECIMAL(14, 2) NOT NULL DEFAULT 0;

ALTER TABLE "carbon_records"
  ALTER COLUMN "avoided_landfill_value_inr" DROP DEFAULT,
  ALTER COLUMN "conversion_output_value_inr" DROP DEFAULT,
  ALTER COLUMN "carbon_related_value_inr" DROP DEFAULT;
