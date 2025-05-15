CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stressLevel" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION,
    "activitySteps" INTEGER,
    "activityMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_data_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "nextStepRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "localized_content" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interventionId" TEXT,
    "exerciseId" TEXT,
    "stepId" TEXT,

    CONSTRAINT "localized_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "step_responses" (
    "id" TEXT NOT NULL,
    "userInteractionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "step_responses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "daily_data_userId_date_key" ON "daily_data"("userId", "date");

CREATE UNIQUE INDEX "localized_content_entityType_entityId_language_key" ON "localized_content"("entityType", "entityId", "language");

ALTER TABLE "daily_data" ADD CONSTRAINT "daily_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exercises" ADD CONSTRAINT "exercises_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "steps" ADD CONSTRAINT "steps_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "localized_content" ADD CONSTRAINT "localized_content_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "localized_content" ADD CONSTRAINT "localized_content_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "localized_content" ADD CONSTRAINT "localized_content_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "step_responses" ADD CONSTRAINT "step_responses_userInteractionId_fkey" FOREIGN KEY ("userInteractionId") REFERENCES "user_interactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "step_responses" ADD CONSTRAINT "step_responses_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
