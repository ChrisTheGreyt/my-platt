const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulate the POST /schools endpoint
async function testAddSchool() {
  const userId = 30; // Use an existing user ID
  const school = 'American University (Washington)';
  
  console.log(`🟢 Testing school creation for user:`, { userId, school });

  try {
    // Find school
    console.log('Step 1: Finding school in database');
    const schoolRecord = await prisma.law_schools.findFirst({
      where: { 
        school: school
      },
      include: {
        schoolTasks: true
      }
    });

    if (!schoolRecord || !schoolRecord.school) {
      console.log(`❌ School not found: "${school}"`);
      return;
    }

    console.log(`✅ Found school: ${schoolRecord.school} (ID: ${schoolRecord.id})`);
    console.log(`✅ School has ${schoolRecord.schoolTasks.length} tasks`);
    
    // Count non-empty fields in the school record that could be tasks
    const taskFields = [
      'personal_statement', 
      'diversity_statement', 
      'optional_statement_prompt', 
      'letters_of_recommendation', 
      'resume', 
      'extras_addenda', 
      'application_fee', 
      'interviews'
    ];
    
    const nonEmptyFieldCount = taskFields.filter(field => {
      const value = schoolRecord[field];
      return value && value !== 'N/A' && value.trim() !== '';
    }).length;
    
    console.log(`✅ School has ${nonEmptyFieldCount} non-empty fields that could be tasks`);
    
    // If the school has fewer tasks than non-empty fields, or no tasks at all, create new tasks
    let schoolTasksToUse = schoolRecord.schoolTasks;
    let createdNewTasks = false;
    
    if (schoolTasksToUse.length < nonEmptyFieldCount || schoolTasksToUse.length === 0) {
      console.log('⚠️ School has fewer tasks than expected. Creating tasks based on school data...');
      createdNewTasks = true;
      
      // Create tasks based on the fields in the law_schools table
      const taskFieldsMapping = [
        { field: 'personal_statement', taskType: 'personal_statement' },
        { field: 'diversity_statement', taskType: 'diversity_statement' },
        { field: 'optional_statement_prompt', taskType: 'optional_statement' },
        { field: 'letters_of_recommendation', taskType: 'letters_of_recommendation' },
        { field: 'resume', taskType: 'resume' },
        { field: 'extras_addenda', taskType: 'extras_addenda' },
        { field: 'application_fee', taskType: 'application_fee' },
        { field: 'interviews', taskType: 'interviews' }
      ];
      
      const tasksToCreate = taskFieldsMapping
        .filter(({ field }) => {
          const value = schoolRecord[field];
          return value && value !== 'N/A' && value.trim() !== '';
        })
        .map(({ taskType }) => ({
          schoolId: schoolRecord.id,
          taskType,
          isRequired: ['personal_statement', 'letters_of_recommendation', 'resume', 'application_fee'].includes(taskType),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      
      console.log('Tasks to create:', tasksToCreate.length);
      console.log(tasksToCreate);
      
      // Don't actually create the tasks in this test
      console.log(`Would create ${tasksToCreate.length} new school tasks`);
      
      // Simulate the created tasks
      const simulatedTasks = tasksToCreate.map((task, index) => ({
        id: 1000 + index,
        ...task
      }));
      
      schoolTasksToUse = [...schoolTasksToUse, ...simulatedTasks];
    }
    
    console.log(`Total tasks that would be created for user: ${schoolTasksToUse.length}`);
    
    // Add a warning if we created new tasks
    const responseData = {
      message: 'School tasks created successfully',
      school: schoolRecord.school,
      tasksCreated: schoolTasksToUse.length
    };
    
    if (createdNewTasks) {
      Object.assign(responseData, {
        warning: `Some tasks were missing for this school and were automatically created. You now have ${schoolTasksToUse.length} tasks.`
      });
    }
    
    console.log('Response data:', responseData);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAddSchool(); 