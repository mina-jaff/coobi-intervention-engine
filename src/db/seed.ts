import { PrismaClient } from '.prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'user1@example.com',
      name: 'User One',
      language: 'en',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'user2@example.com',
      name: 'User Two',
      language: 'es',
    },
  });

  console.log('Created users:', { user1, user2 });

  // daily data for user1
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const user1DailyDataToday = await prisma.dailyData.upsert({
    where: {
      userId_date: {
        userId: user1.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      date: today,
      stressLevel: 3.5,
      sleepHours: 4.5,
      activitySteps: 4000,
      activityMinutes: 15,
    },
  });

  const user1DailyDataYesterday = await prisma.dailyData.upsert({
    where: {
      userId_date: {
        userId: user1.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      date: yesterday,
      stressLevel: 1.5,
      sleepHours: 7.5,
      activitySteps: 2500,
      activityMinutes: 5,
    },
  });

  console.log('Created daily data for user1:', { user1DailyDataToday, user1DailyDataYesterday });

  // daily data for user2
  const user2DailyDataToday = await prisma.dailyData.upsert({
    where: {
      userId_date: {
        userId: user2.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      date: today,
      stressLevel: 1.2,
      sleepHours: 8.0,
      activitySteps: 8000,
      activityMinutes: 30,
    },
  });

  console.log('Created daily data for user2:', { user2DailyDataToday });

  // 1. Stress reduction intervention
  const stressReductionIntervention = await prisma.intervention.create({
    data: {
      name: 'Stress Reduction',
      description: 'A series of exercises to reduce stress and promote relaxation',
      condition: 'high_stress_low_sleep_medium_activity',
      priority: 10,
      isActive: true,
    },
  });

  // 2. Sleep improvement intervention
  const sleepImprovementIntervention = await prisma.intervention.create({
    data: {
      name: 'Sleep Improvement',
      description: 'Techniques to improve your sleep quality and duration',
      condition: 'high_stress_low_sleep_low_activity',
      priority: 8,
      isActive: true,
    },
  });

  // 3. Activity promotion intervention
  const activityPromotionIntervention = await prisma.intervention.create({
    data: {
      name: 'Activity Promotion',
      description: 'Exercises to encourage more physical activity throughout the day',
      condition: 'low_stress_high_sleep_low_activity',
      priority: 6,
      isActive: true,
    },
  });

  console.log('Created interventions:', {
    stressReductionIntervention,
    sleepImprovementIntervention,
    activityPromotionIntervention,
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'intervention',
      entityId: stressReductionIntervention.id,
      language: 'es',
      content: {
        name: 'Reducción de Estrés',
        description: 'Una serie de ejercicios para reducir el estrés y promover la relajación',
      },
      interventionId: stressReductionIntervention.id,
    },
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'intervention',
      entityId: sleepImprovementIntervention.id,
      language: 'es',
      content: {
        name: 'Mejora del Sueño',
        description: 'Técnicas para mejorar la calidad y duración del sueño',
      },
      interventionId: sleepImprovementIntervention.id,
    },
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'intervention',
      entityId: activityPromotionIntervention.id,
      language: 'es',
      content: {
        name: 'Promoción de Actividad',
        description: 'Ejercicios para fomentar más actividad física durante el día',
      },
      interventionId: activityPromotionIntervention.id,
    },
  });

  // exercises for stress reduction intervention
  const breathingExercise = await prisma.exercise.create({
    data: {
      interventionId: stressReductionIntervention.id,
      name: 'Deep Breathing',
      description: 'A breathing exercise to reduce stress and promote relaxation',
      orderIndex: 0,
      isActive: true,
    },
  });

  const reflectionExercise = await prisma.exercise.create({
    data: {
      interventionId: stressReductionIntervention.id,
      name: 'Stress Reflection',
      description: 'A reflection exercise to identify sources of stress',
      orderIndex: 1,
      isActive: true,
    },
  });

  console.log('Created exercises:', { breathingExercise, reflectionExercise });

  // translations for exercises
  await prisma.localizedContent.create({
    data: {
      entityType: 'exercise',
      entityId: breathingExercise.id,
      language: 'es',
      content: {
        name: 'Respiración Profunda',
        description: 'Un ejercicio de respiración para reducir el estrés y promover la relajación',
      },
      exerciseId: breathingExercise.id,
    },
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'exercise',
      entityId: reflectionExercise.id,
      language: 'es',
      content: {
        name: 'Reflexión sobre el Estrés',
        description: 'Un ejercicio de reflexión para identificar fuentes de estrés',
      },
      exerciseId: reflectionExercise.id,
    },
  });

  // steps for the breathing exercise
  const breathingIntroStep = await prisma.step.create({
    data: {
      exerciseId: breathingExercise.id,
      type: 'INFORMATION',
      content: {
        title: 'Introduction to Deep Breathing',
        content: 'Deep breathing is a simple but powerful relaxation technique. It\'s easy to learn, can be practiced almost anywhere, and provides a quick way to reduce stress levels.',
        acknowledgmentRequired: true,
      },
      orderIndex: 0,
      isActive: true,
    },
  });

  const stressLevelStep = await prisma.step.create({
    data: {
      exerciseId: breathingExercise.id,
      type: 'QUESTION_SINGLE_CHOICE',
      content: {
        title: 'Current Stress Level',
        question: 'How would you rate your current stress level?',
        options: [
          { id: 'opt-1', text: 'Very high', value: 5 },
          { id: 'opt-2', text: 'High', value: 4 },
          { id: 'opt-3', text: 'Moderate', value: 3 },
          { id: 'opt-4', text: 'Low', value: 2 },
          { id: 'opt-5', text: 'Very low', value: 1 },
        ],
        required: true,
      },
      orderIndex: 1,
      nextStepRules: {
        rules: [
          {
            conditions: [
              { field: 'selectedOptionId', operator: 'equals', value: 'opt-1' },
              { field: 'selectedOptionId', operator: 'equals', value: 'opt-2' },
            ],
            nextStepId: 'intense-breathing', // This would be the ID of another step
          },
        ],
        defaultNextStepId: 'regular-breathing', // Default next step
      },
      isActive: true,
    },
  });

  // translations for steps
  await prisma.localizedContent.create({
    data: {
      entityType: 'step',
      entityId: breathingIntroStep.id,
      language: 'es',
      content: {
        title: 'Introducción a la Respiración Profunda',
        content: 'La respiración profunda es una técnica de relajación simple pero poderosa. Es fácil de aprender, se puede practicar casi en cualquier lugar y proporciona una forma rápida de reducir los niveles de estrés.',
        acknowledgmentRequired: true,
      },
      stepId: breathingIntroStep.id,
    },
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'step',
      entityId: stressLevelStep.id,
      language: 'es',
      content: {
        title: 'Nivel de Estrés Actual',
        question: '¿Cómo calificarías tu nivel de estrés actual?',
        options: [
          { id: 'opt-1', text: 'Muy alto', value: 5 },
          { id: 'opt-2', text: 'Alto', value: 4 },
          { id: 'opt-3', text: 'Moderado', value: 3 },
          { id: 'opt-4', text: 'Bajo', value: 2 },
          { id: 'opt-5', text: 'Muy bajo', value: 1 },
        ],
        required: true,
      },
      stepId: stressLevelStep.id,
    },
  });

  // steps for the reflection exercise
  const reflectionIntroStep = await prisma.step.create({
    data: {
      exerciseId: reflectionExercise.id,
      type: 'INFORMATION',
      content: {
        title: 'Stress Reflection',
        content: 'Take a moment to reflect on your sources of stress and how they affect you.',
        acknowledgmentRequired: true,
      },
      orderIndex: 0,
      isActive: true,
    },
  });

  const stressReflectionStep = await prisma.step.create({
    data: {
      exerciseId: reflectionExercise.id,
      type: 'TEXT_REFLECTION',
      content: {
        title: 'Stress Reflection Questions',
        introText: 'Please take some time to reflect on the following questions:',
        prompts: [
          { id: 'prompt-1', text: 'What are your main sources of stress today?', placeholder: 'For example: work deadlines, relationship issues, etc.' },
          { id: 'prompt-2', text: 'How does stress typically affect you?', placeholder: 'For example: headaches, trouble sleeping, etc.' },
          { id: 'prompt-3', text: 'What strategies have helped you manage stress in the past?', placeholder: 'For example: exercise, meditation, talking to friends, etc.' },
        ],
        required: true,
      },
      orderIndex: 1,
      isActive: true,
    },
  });

  // translations for reflection steps
  await prisma.localizedContent.create({
    data: {
      entityType: 'step',
      entityId: reflectionIntroStep.id,
      language: 'es',
      content: {
        title: 'Reflexión sobre el Estrés',
        content: 'Tómate un momento para reflexionar sobre tus fuentes de estrés y cómo te afectan.',
        acknowledgmentRequired: true,
      },
      stepId: reflectionIntroStep.id,
    },
  });

  await prisma.localizedContent.create({
    data: {
      entityType: 'step',
      entityId: stressReflectionStep.id,
      language: 'es',
      content: {
        title: 'Preguntas de Reflexión sobre el Estrés',
        introText: 'Por favor, tómate un tiempo para reflexionar sobre las siguientes preguntas:',
        prompts: [
          { id: 'prompt-1', text: '¿Cuáles son tus principales fuentes de estrés hoy?', placeholder: 'Por ejemplo: plazos de trabajo, problemas de relación, etc.' },
          { id: 'prompt-2', text: '¿Cómo te afecta típicamente el estrés?', placeholder: 'Por ejemplo: dolores de cabeza, problemas para dormir, etc.' },
          { id: 'prompt-3', text: '¿Qué estrategias te han ayudado a manejar el estrés en el pasado?', placeholder: 'Por ejemplo: ejercicio, meditación, hablar con amigos, etc.' },
        ],
        required: true,
      },
      stepId: stressReflectionStep.id,
    },
  });

  console.log('Created steps:', {
    breathingIntroStep,
    stressLevelStep,
    reflectionIntroStep,
    stressReflectionStep,
  });

  console.log('Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
