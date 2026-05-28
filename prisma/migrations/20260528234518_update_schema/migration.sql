-- Fully handle partial DB state from previous failed runs.
-- DB may have: ScheduleStatus_old (renamed from ScheduleStatus), Schedule.status typed as either.
-- Goal: end state has ScheduleStatus enum with correct values, all tables exist.

-- Step 1: Create ScheduleStatus if it doesn't exist yet
DO $$ BEGIN
  CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'WAITING_VERIFICATION', 'APPROVED', 'REJECTED', 'MISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 2: Fix Schedule.status column — handle both old type names
DO $$
DECLARE col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'Schedule' AND column_name = 'status';

  -- Drop default first
  ALTER TABLE "Schedule" ALTER COLUMN "status" DROP DEFAULT;

  -- Cast column to new ScheduleStatus
  EXECUTE 'ALTER TABLE "Schedule" ALTER COLUMN "status" TYPE "ScheduleStatus" USING status::text::"ScheduleStatus"';

  -- Re-add default
  ALTER TABLE "Schedule" ALTER COLUMN "status" SET DEFAULT 'PENDING';
END $$;

-- Step 3: Drop old type if exists
DROP TYPE IF EXISTS "ScheduleStatus_old";

-- Step 4: Add deleted_at to PatientProfile
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Step 5: Create MedicationConsumption table
CREATE TABLE IF NOT EXISTS "MedicationConsumption" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "proof_image" TEXT NOT NULL,
    "verification_status" "ScheduleStatus" NOT NULL DEFAULT 'WAITING_VERIFICATION',
    "verified_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationConsumption_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "MedicationConsumption" ADD CONSTRAINT "MedicationConsumption_schedule_id_fkey"
    FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MedicationConsumption" ADD CONSTRAINT "MedicationConsumption_patient_id_fkey"
    FOREIGN KEY ("patient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MedicationConsumption" ADD CONSTRAINT "MedicationConsumption_verified_by_id_fkey"
    FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
