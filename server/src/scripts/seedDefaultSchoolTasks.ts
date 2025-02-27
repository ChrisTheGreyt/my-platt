import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDefaultSchoolTasks() {
  try {
    // Get all law schools that don't have tasks
    const schoolsWithoutTasks = await prisma.law_schools.findMany({
      where: {
        schoolTasks: {
          none: {}
        }
      }
    });

    console.log(`Found ${schoolsWithoutTasks.length} schools without tasks`);

    // Task fields mapping
    const taskFields = [
      { field: 'personal_statement', taskType: 'personal_statement' },
      { field: 'diversity_statement', taskType: 'diversity_statement' },
      { field: 'optional_statement_prompt', taskType: 'optional_statement' },
      { field: 'letters_of_recommendation', taskType: 'letters_of_recommendation' },
      { field: 'resume', taskType: 'resume' },
      { field: 'extras_addenda', taskType: 'extras_addenda' },
      { field: 'application_fee', taskType: 'application_fee' },
      { field: 'interviews', taskType: 'interviews' }
    ];

    // Create tasks for each school
    let totalTasksCreated = 0;
    for (const school of schoolsWithoutTasks) {
      console.log(`Creating tasks for: ${school.school || 'Unnamed'} (ID: ${school.id})`);
      
      // Filter tasks based on school data
      const tasksToCreate = taskFields
        .filter(({ field }) => {
          const value = school[field as keyof typeof school] as string | null;
          return value && value !== 'N/A' && value.trim() !== '';
        })
        .map(({ taskType }) => ({
          schoolId: school.id,
          taskType,
          isRequired: ['personal_statement', 'letters_of_recommendation', 'resume', 'application_fee'].includes(taskType),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      
      // If no tasks were found in the school data, add default ones
      if (tasksToCreate.length === 0) {
        console.log(`⚠️ No task data found in school fields for school ID ${school.id}. Adding default tasks...`);
        tasksToCreate.push(
          {
            schoolId: school.id,
            taskType: 'personal_statement',
            isRequired: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            schoolId: school.id,
            taskType: 'letters_of_recommendation',
            isRequired: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            schoolId: school.id,
            taskType: 'resume',
            isRequired: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            schoolId: school.id,
            taskType: 'application_fee',
            isRequired: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
      }
      
      const createdTasks = await Promise.all(
        tasksToCreate.map(taskData => prisma.schoolTasks.create({ data: taskData }))
      );
      
      console.log(`✅ Created ${createdTasks.length} tasks for school ID ${school.id}`);
      totalTasksCreated += createdTasks.length;
    }

    console.log(`✅ Total tasks created: ${totalTasksCreated}`);
    console.log(`✅ All done! ${schoolsWithoutTasks.length} schools now have tasks based on their data.`);

  } catch (error) {
    console.error('Error seeding default school tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDefaultSchoolTasks()
  .then(() => console.log('Seeding completed!'))
  .catch(console.error); 