import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const interventionId = process.argv[2];
  if (!interventionId) {
    console.error('Please provide an intervention ID as an argument.');
    process.exit(1);
  }

  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId }
  });

  if (!intervention) {
    console.log('Intervention not found.');
    return;
  }

  console.log(`Adding exercises to intervention: ${intervention.name}`);

  const breathingExercise = await prisma.exercise.create({
    data: {
      interventionId: intervention.id,
      name: 'Deep Breathing Exercise',
      description: 'A simple breathing exercise to help you relax',
      orderIndex: 0,
      isActive: true,
      steps: {
        create: [
          {
            type: 'INFORMATION',
            content: {
              title: 'Introduction to Deep Breathing',
              content: 'Deep breathing is a simple but powerful relaxation technique. It\'s easy to learn, can be practiced almost anywhere, and provides a quick way to reduce stress levels.',
              acknowledgmentRequired: true
            },
            orderIndex: 0,
            isActive: true
          },
          {
            type: 'QUESTION_SINGLE_CHOICE',
            content: {
              title: 'Current Stress Level',
              question: 'How would you rate your current stress level?',
              options: [
                { id: 'opt-1', text: 'Very high', value: 5 },
                { id: 'opt-2', text: 'High', value: 4 },
                { id: 'opt-3', text: 'Moderate', value: 3 },
                { id: 'opt-4', text: 'Low', value: 2 },
                { id: 'opt-5', text: 'Very low', value: 1 }
              ],
              required: true
            },
            orderIndex: 1,
            isActive: true
          }
        ]
      }
    }
  });
  
  const reflectionExercise = await prisma.exercise.create({
    data: {
      interventionId: intervention.id,
      name: 'Sleep Reflection',
      description: 'A reflection exercise to identify sleep habits',
      orderIndex: 1,
      isActive: true,
      steps: {
        create: [
          {
            type: 'INFORMATION',
            content: {
              title: 'Sleep Reflection',
              content: 'Take a moment to reflect on your sleep habits and how they affect you.',
              acknowledgmentRequired: true
            },
            orderIndex: 0,
            isActive: true
          },
          {
            type: 'TEXT_REFLECTION',
            content: {
              title: 'Sleep Reflection Questions',
              introText: 'Please take some time to reflect on the following questions:',
              prompts: [
                { id: 'prompt-1', text: 'What time do you typically go to bed?', placeholder: 'For example: 10 PM, midnight, etc.' },
                { id: 'prompt-2', text: 'What activities do you do before bed?', placeholder: 'For example: read, watch TV, use phone, etc.' },
                { id: 'prompt-3', text: 'What helps you sleep better?', placeholder: 'For example: quiet room, cool temperature, etc.' }
              ],
              required: true
            },
            orderIndex: 1,
            isActive: true
          }
        ]
      }
    }
  });

  console.log('Created exercises:', {
    breathingExercise: breathingExercise.name,
    reflectionExercise: reflectionExercise.name
  });

  console.log('Exercises added successfully! Try fetching the intervention again.');
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
