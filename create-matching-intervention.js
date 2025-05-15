const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create intervention
  const intervention = await prisma.intervention.create({
    data: {
      name: "Test Intervention",
      description: "A test intervention for high stress, high sleep, low activity",
      condition: "high_stress_high_sleep_low_activity",
      priority: 10,
      isActive: true,
      // Create exercise and steps in one go
      exercises: {
        create: [
          {
            name: "Test Exercise",
            description: "A test exercise",
            orderIndex: 0,
            isActive: true,
            steps: {
              create: [
                {
                  type: "INFORMATION",
                  content: {
                    title: "Test Step",
                    content: "This is a test step",
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
  
  console.log('Created intervention with exercise and step:', intervention);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
