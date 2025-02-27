const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all law schools
    const schools = await prisma.law_schools.findMany({
      include: {
        schoolTasks: true
      }
    });
    
    console.log('Total schools:', schools.length);
    
    // Print each school and its tasks
    schools.forEach(school => {
      console.log(`School: ${school.id} - ${school.school}`);
      console.log(`  Tasks: ${school.schoolTasks.length}`);
      
      if (school.schoolTasks.length === 0) {
        console.log('  WARNING: No tasks for this school!');
      }
    });
    
    // Check for a specific school
    const harvard = await prisma.law_schools.findFirst({
      where: { 
        school: 'Harvard Law School'
      },
      include: {
        schoolTasks: true
      }
    });
    
    console.log('\nHarvard Law School search:');
    console.log(harvard ? `Found: ${harvard.school} with ${harvard.schoolTasks.length} tasks` : 'Not found');
    
    // Check for case-insensitive match
    const harvardInsensitive = await prisma.law_schools.findFirst({
      where: { 
        school: {
          equals: 'Harvard Law School',
          mode: 'insensitive'
        }
      }
    });
    
    console.log('\nCase-insensitive search:');
    console.log(harvardInsensitive ? `Found: ${harvardInsensitive.school}` : 'Not found');
    
    // Check for partial match
    const harvardPartial = await prisma.law_schools.findMany({
      where: { 
        school: {
          contains: 'Harvard',
          mode: 'insensitive'
        }
      }
    });
    
    console.log('\nPartial match search for "Harvard":');
    if (harvardPartial.length > 0) {
      harvardPartial.forEach(school => {
        console.log(`Found: ${school.id} - ${school.school}`);
      });
    } else {
      console.log('Not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 