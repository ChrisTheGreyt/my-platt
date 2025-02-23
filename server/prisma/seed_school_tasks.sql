-- Insert tasks for Harvard Law School
INSERT INTO "SchoolTasks" ("schoolId", "taskType", "isRequired", "createdAt", "updatedAt")
VALUES 
(1, 'personal_statement', true, NOW(), NOW()),
(1, 'diversity_statement', false, NOW(), NOW()),
(1, 'optional_statement', false, NOW(), NOW()),
(1, 'letters_of_recommendation', true, NOW(), NOW()),
(1, 'resume', true, NOW(), NOW()),
(1, 'extras_addenda', false, NOW(), NOW()),
(1, 'application_fee', true, NOW(), NOW()),
(1, 'interviews', false, NOW(), NOW());

-- Insert tasks for Yale Law School
INSERT INTO "SchoolTasks" ("schoolId", "taskType", "isRequired", "createdAt", "updatedAt")
VALUES 
(2, 'personal_statement', true, NOW(), NOW()),
(2, 'diversity_statement', false, NOW(), NOW()),
(2, 'optional_statement', false, NOW(), NOW()),
(2, 'letters_of_recommendation', true, NOW(), NOW()),
(2, 'resume', true, NOW(), NOW()),
(2, 'extras_addenda', false, NOW(), NOW()),
(2, 'application_fee', true, NOW(), NOW()),
(2, 'interviews', false, NOW(), NOW());

-- Insert tasks for Stanford Law School
INSERT INTO "SchoolTasks" ("schoolId", "taskType", "isRequired", "createdAt", "updatedAt")
VALUES 
(3, 'personal_statement', true, NOW(), NOW()),
(3, 'diversity_statement', false, NOW(), NOW()),
(3, 'optional_statement', false, NOW(), NOW()),
(3, 'letters_of_recommendation', true, NOW(), NOW()),
(3, 'resume', true, NOW(), NOW()),
(3, 'extras_addenda', false, NOW(), NOW()),
(3, 'application_fee', true, NOW(), NOW()),
(3, 'interviews', false, NOW(), NOW());