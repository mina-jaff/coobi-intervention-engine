import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Please provide a user ID as an argument.');
    process.exit(1);
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.log('User not found.');
    return;
  }

  console.log('Setting up test intervention for user:', user.email);

  // Create or update daily data for today with intervention triggers such as high stress, low sleep, low activity
  const today = new Date();
  
  const dailyData = await prisma.dailyData.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today
      }
    },
    update: {
      stressLevel: 3.0,
      sleepHours: 4.0,
      activitySteps: 2000,
      activityMinutes: 5
    },
    create: {
      userId: user.id,
      date: today,
      stressLevel: 3.0,
      sleepHours: 4.0,
      activitySteps: 2000,
      activityMinutes: 5
    }
  });

  console.log('Created/updated daily data:', dailyData);

  // Create a matching intervention if none exists
  const conditionType = 'high_stress_low_sleep_low_activity';
  
  const existingIntervention = await prisma.intervention.findFirst({
    where: {
      condition: conditionType,
      isActive: true
    }
  });

  if (existingIntervention) {
    console.log('Matching intervention already exists:', existingIntervention.name);
  } else {
    const newIntervention = await prisma.intervention.create({
      data: {
        name: 'Test Intervention',
        description: 'An intervention created for testing',
        condition: conditionType,
        priority: 10,
        isActive: true,
        exercises: {
          create: [
            {
              name: 'Test Exercise',
              description: 'A simple exercise for testing',
              orderIndex: 0,
              isActive: true,
              steps: {
                create: [
                  {
                    type: 'INFORMATION',
                    content: {
                      title: 'Test Step',
                      content: 'This is a test step in a test exercise.',
                      acknowledgmentRequired: true
                    },
                    orderIndex: 0,
                    isActive: true
                  }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('Created new intervention:', newIntervention.name);
  }

  console.log('Setup complete! Try fetching an intervention for this user now.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
