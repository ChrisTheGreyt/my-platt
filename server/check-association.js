const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssociation() {
  try {
    // Check for existing association
    const existingAssociation = await prisma.userSchool.findFirst({
      where: {
        userId: 30,
        school: 'University of Kansas'
      }
    });
    
    console.log('Existing association:', existingAssociation);
    
    // Check for similar schools in user's schools
    const userSchools = await prisma.userSchool.findMany({
      where: {
        userId: 30
      }
    });
    
    console.log('User schools:', userSchools);
    
    // Check for similar schools in the database
    const similarSchools = await prisma.law_schools.findMany({
      where: {
        OR: [
          { school: { contains: 'Kansas', mode: 'insensitive' } },
          { school: { contains: 'University of', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log('Similar schools:', similarSchools);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssociation(); 