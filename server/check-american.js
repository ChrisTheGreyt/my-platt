const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Find American University
    const school = await prisma.law_schools.findFirst({
      where: { 
        school: {
          contains: 'American',
          mode: 'insensitive'
        }
      },
      include: {
        schoolTasks: true
      }
    });
    
    if (!school) {
      console.log('American University not found in database');
      return;
    }
    
    console.log('School:', school.school, '(ID:', school.id, ')');
    console.log('Tasks:', school.schoolTasks.length);
    
    // Print task details
    if (school.schoolTasks.length > 0) {
      console.log('Task details:');
      school.schoolTasks.forEach(task => {
        console.log(`  - ID: ${task.id}, Type: ${task.taskType}, Required: ${task.isRequired}`);
      });
    } else {
      console.log('No tasks found for this school');
    }
    
    // Check user tasks for this school
    const userTasks = await prisma.userSchoolTasks.findMany({
      where: {
        schoolTask: {
          schoolId: school.id
        }
      },
      include: {
        schoolTask: true
      }
    });
    
    console.log('\nUser tasks for this school:', userTasks.length);
    if (userTasks.length > 0) {
      userTasks.forEach(task => {
        console.log(`  - User: ${task.userId}, Task: ${task.schoolTask.taskType}, Status: ${task.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 