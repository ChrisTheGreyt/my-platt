-- Check for existing user-school associations for University of Kansas
SELECT * FROM "UserSchool" 
WHERE "userId" = 30 
AND "school" ILIKE '%University of Kansas%'; 