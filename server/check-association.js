const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssociation() {
  try {
    console.log('Checking for existing association for University of Kansas...');
    
    // Check for existing association with exact match
    const existingAssociation = await prisma.userSchool.findFirst({
      where: {
        userId: 30,
        school: 'University of Kansas'
      }
    });
    
    console.log('Existing association (exact match):', existingAssociation);
    
    // Check for all user schools
    console.log('\nChecking for all user schools...');
    const userSchools = await prisma.userSchool.findMany({
      where: {
        userId: 30
      }
    });
    
    console.log('User schools:', userSchools);
    
    // Check if "University of Kansas" exists in the law_schools table
    console.log('\nChecking if "University of Kansas" exists in the law_schools table...');
    const kansasSchool = await prisma.law_schools.findFirst({
      where: {
        school: 'University of Kansas'
      }
    });
    
    console.log('Kansas school:', kansasSchool);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssociation(); 