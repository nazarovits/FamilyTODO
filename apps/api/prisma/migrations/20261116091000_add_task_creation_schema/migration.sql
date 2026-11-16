-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,

    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskPriority" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,

    CONSTRAINT "TaskPriority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "statusId" UUID NOT NULL,
    "priorityId" UUID NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "estimateMinutes" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "dueAt" TIMESTAMPTZ(3),
    "reminderAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- Seed lookup codes with stable IDs for task defaults and references.
INSERT INTO "TaskStatus" ("id", "code")
VALUES
    ('00000000-0000-4000-8000-000000000101', 'OPEN'),
    ('00000000-0000-4000-8000-000000000102', 'IN_PROGRESS'),
    ('00000000-0000-4000-8000-000000000103', 'PENDING_APPROVAL'),
    ('00000000-0000-4000-8000-000000000104', 'DONE'),
    ('00000000-0000-4000-8000-000000000105', 'REJECTED');

INSERT INTO "TaskPriority" ("id", "code")
VALUES
    ('00000000-0000-4000-8000-000000000201', 'LOW'),
    ('00000000-0000-4000-8000-000000000202', 'NORMAL'),
    ('00000000-0000-4000-8000-000000000203', 'HIGH');

-- Prisma does not model CHECK constraints yet; keep these constraints in the migration.
ALTER TABLE "Task"
ADD CONSTRAINT "Task_title_nonblank_check"
    CHECK (length(btrim("title")) > 0),
ADD CONSTRAINT "Task_rewardPoints_nonnegative_check"
    CHECK ("rewardPoints" >= 0),
ADD CONSTRAINT "Task_estimateMinutes_positive_check"
    CHECK ("estimateMinutes" IS NULL OR "estimateMinutes" > 0);

-- CreateIndex
CREATE UNIQUE INDEX "TaskStatus_code_key" ON "TaskStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TaskPriority_code_key" ON "TaskPriority"("code");

-- CreateIndex
CREATE INDEX "Task_assigneeId_statusId_dueAt_idx" ON "Task"("assigneeId", "statusId", "dueAt");

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TaskStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "TaskPriority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
