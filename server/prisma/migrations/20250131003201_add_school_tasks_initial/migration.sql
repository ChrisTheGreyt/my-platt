-- CreateTable
CREATE TABLE "law_schools" (
    "id" SERIAL NOT NULL,
    "school" TEXT,
    "personal_statement" TEXT,
    "diversity_statement" TEXT,
    "optional_statement_prompt" TEXT,
    "letters_of_recommendation" TEXT,
    "resume" TEXT,
    "extras_addenda" TEXT,
    "application_fee" TEXT,
    "interviews" TEXT,
    "note" TEXT,

    CONSTRAINT "law_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolTasks" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "taskType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "law_schools_school_key" ON "law_schools"("school");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTasks_schoolId_taskType_key" ON "SchoolTasks"("schoolId", "taskType");
