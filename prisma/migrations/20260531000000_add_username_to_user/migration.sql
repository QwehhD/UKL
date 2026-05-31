-- Add username column with a default (email) for existing rows, then make it required
ALTER TABLE "User" ADD COLUMN "username" TEXT;
UPDATE "User" SET "username" = "email" WHERE "username" IS NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
