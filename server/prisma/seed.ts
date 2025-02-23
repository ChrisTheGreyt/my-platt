import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seedLawSchools() {
  try {
    // Check if law schools already exist
    const existingSchools = await prisma.law_schools.findMany();
    if (existingSchools.length > 0) {
      console.log('Law schools already exist, skipping seed');
      return;
    }

    // Read and execute the SQL file only if no schools exist
    const sqlPath = path.join(process.cwd(), 'prisma', 'seed_law_schools.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split the SQL into individual statements
    const statements = sql.split(');').filter(stmt => stmt.trim());
    
    for (let stmt of statements) {
      stmt = stmt.trim() + ');';
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (error) {
        console.error('Error executing SQL statement:', error);
        throw error;
      }
    }
    
    console.log('Successfully seeded law schools');
  } catch (error) {
    console.error('Error seeding law schools:', error);
    throw error;
  }
}

async function seedSchoolTasks() {
  try {
    // Check if school tasks already exist
    const existingTasks = await prisma.schoolTasks.findMany();
    if (existingTasks.length > 0) {
      console.log('School tasks already exist, skipping seed');
      return;
    }

    // Read and execute the SQL file only if no tasks exist
    const sqlPath = path.join(process.cwd(), 'prisma', 'seed_school_tasks.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (let stmt of statements) {
      stmt = stmt.trim() + ';';
      if (stmt === ';') continue;
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (error) {
        console.error('Error executing SQL statement:', error);
        throw error;
      }
    }
    
    console.log('Successfully seeded school tasks');
  } catch (error) {
    console.error('Error seeding school tasks:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting law schools seeding...');
  await seedLawSchools();
  console.log('Starting school tasks seeding...');
  await seedSchoolTasks();
  console.log('Seeding completed.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
