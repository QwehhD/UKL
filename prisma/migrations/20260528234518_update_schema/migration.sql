-- Handle both scenarios:
-- A) Shadow DB (fresh): ScheduleStatus exists with old values (PENDING, TRIGGERED, COMPLETED, MISSED)
-- B) Actual DB: ScheduleStatus may already have correct values or may not exist

-- Step 1: Rename old ScheduleStatus if it lacks WAITING_VERIFICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduleStatus')
    AND NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'ScheduleStatus' AND e.enumlabel = 'WAITING_VERIFICATION'
    )
  THEN
    ALTER TYPE "ScheduleStatus" RENAME TO "ScheduleStatus_old";
  END IF;
END $$;

-- Step 2: Create ScheduleStatus with correct values (skipped if already correct)
DO $$ BEGIN
  CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'WAITING_VERIFICATION', 'APPROVED', 'REJECTED', 'MISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 3: Fix Schedule.status column if it uses the old type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Schedule' AND column_name = 'status'
  ) THEN
    ALTER TABLE "Schedule" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "Schedule" ALTER COLUMN "status" TYPE "ScheduleStatus" USING status::text::"ScheduleStatus";
    ALTER TABLE "Schedule" ALTER COLUMN "status" SET DEFAULT 'PENDING';
  END IF;
END $$;

-- Step 4: Drop old type if exists
DROP TYPE IF EXISTS "ScheduleStatus_old";

-- Step 5: Add deleted_at to PatientProfile
ALTER TABLE "PatientProfile" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Step 6: Create MedicationConsumption table
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
