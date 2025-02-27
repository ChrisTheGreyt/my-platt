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
      }
    });
    
    if (!school) {
      console.log('American University not found in database');
      return;
    }
    
    console.log('School:', school.school, '(ID:', school.id, ')');
    console.log('\nSchool Fields:');
    console.log('personal_statement:', school.personal_statement);
    console.log('diversity_statement:', school.diversity_statement);
    console.log('optional_statement_prompt:', school.optional_statement_prompt);
    console.log('letters_of_recommendation:', school.letters_of_recommendation);
    console.log('resume:', school.resume);
    console.log('extras_addenda:', school.extras_addenda);
    console.log('application_fee:', school.application_fee);
    console.log('interviews:', school.interviews);
    console.log('note:', school.note);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 