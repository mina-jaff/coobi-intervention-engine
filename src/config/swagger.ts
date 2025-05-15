import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coobi Intervention Engine API',
      version: '1.0.0',
      description: 'API for delivering personalized interventions for addiction recovery',
      contact: {
        name: 'API Support',
        email: 'support@coobi.health',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            language: { type: 'string', default: 'en' },
          },
        },
        Intervention: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            condition: { type: 'string' },
            priority: { type: 'number' },
            isActive: { type: 'boolean' },
            exercises: {
              type: 'array',
              items: { $ref: '#/components/schemas/Exercise' },
            },
          },
        },
        Exercise: {
          type: 'object',
          required: ['id', 'name', 'interventionId'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            interventionId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            orderIndex: { type: 'number' },
            isActive: { type: 'boolean' },
            steps: {
              type: 'array',
              items: { $ref: '#/components/schemas/Step' },
            },
          },
        },
        Step: {
          type: 'object',
          required: ['id', 'type', 'exerciseId', 'content'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            exerciseId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['INFORMATION', 'QUESTION_SINGLE_CHOICE', 'QUESTION_MULTIPLE_CHOICE', 'TEXT_INPUT', 'TEXT_REFLECTION', 'MEDIA'] },
            content: { type: 'object' },
            orderIndex: { type: 'number' },
            nextStepRules: { type: 'object' },
            isActive: { type: 'boolean' },
          },
        },
        StepResponse: {
          type: 'object',
          required: ['response'],
          properties: {
            response: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
