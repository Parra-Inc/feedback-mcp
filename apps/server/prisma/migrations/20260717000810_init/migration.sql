-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "formSlug" TEXT NOT NULL,
    "platform" TEXT,
    "data" TEXT NOT NULL,
    "metadata" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_projectSlug_formSlug_createdAt_idx" ON "Feedback"("projectSlug", "formSlug", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_projectSlug_platform_idx" ON "Feedback"("projectSlug", "platform");
