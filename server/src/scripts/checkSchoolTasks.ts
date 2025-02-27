import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchoolTasks() {
  try {
    // Get all law schools
    const schools = await prisma.law_schools.findMany({
      include: {
        schoolTasks: true
      }
    });

    console.log(`Found ${schools.length} schools`);

    // Check each school for tasks
    for (const school of schools) {
      console.log(`School: ${school.school || 'Unnamed'} (ID: ${school.id})`);
      console.log(`  Tasks: ${school.schoolTasks.length}`);
      
      if (school.schoolTasks.length === 0) {
        console.log('  ⚠️ WARNING: This school has no tasks!');
      } else {
        // Log the first few tasks
        console.log('  Sample tasks:');
        for (let i = 0; i < Math.min(3, school.schoolTasks.length); i++) {
          const task = school.schoolTasks[i];
          console.log(`    - Task ID: ${task.id}, Type: ${task.taskType}`);
        }
      }
      console.log('---');
    }

    // Check for orphaned school tasks
    const orphanedTasks = await prisma.schoolTasks.findMany({
      where: {
        schoolId: {
          notIn: schools.map(school => school.id)
        }
      }
    });

    if (orphanedTasks.length > 0) {
      console.log(`⚠️ Found ${orphanedTasks.length} orphaned school tasks!`);
    } else {
      console.log('✅ No orphaned school tasks found.');
    }

  } catch (error) {
    console.error('Error checking school tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchoolTasks()
  .then(() => console.log('Done!'))
  .catch(console.error); 