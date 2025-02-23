-- Create a default user for system tasks
INSERT INTO "User" ("userId", username, email, "firstName", "lastName")
VALUES (1, 'system', 'system@myplatt.com', 'System', 'User')
ON CONFLICT ("userId") DO NOTHING;

-- Create a default project for school tasks
INSERT INTO "Project" (id, name, description)
VALUES (1, 'School Tasks', 'Default project for school tasks')
ON CONFLICT (id) DO NOTHING;

-- Create a default task for school tasks
INSERT INTO "Task" (id, title, "projectId", "authorUserId")
VALUES (1, 'School Task', 1, 1)
ON CONFLICT (id) DO NOTHING;