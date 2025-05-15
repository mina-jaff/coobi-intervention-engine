import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { InterventionProcessor } from '../services/intervention';
import { StepResponse } from '../types/steps';

const prisma = new PrismaClient();
const interventionProcessor = new InterventionProcessor();

/**
 * @swagger
 * /api/users/{userId}/interventions/today:
 *   get:
 *     summary: Get today's intervention for a user
 *     description: Returns the appropriate intervention for a user based on their health data
 *     tags: [Interventions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Intervention found or no intervention needed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     intervention:
 *                       $ref: '#/components/schemas/Intervention'
 *                     interactionId:
 *                       type: string
 *                       format: uuid
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     intervention:
 *                       type: null
 *       400:
 *         description: Missing user ID
 *       500:
 *         description: Server error
 */
export const getUserIntervention = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
    
    // Use the intervention processor to get appropriate intervention
    const result = await interventionProcessor.getInterventionForUser(userId);
    
    if (!result.intervention) {
      return res.status(200).json({ 
        message: result.message || 'No intervention available',
        intervention: null
      });
    }
    
    // Return the intervention with its exercises and steps
    return res.status(200).json({
      intervention: result.intervention,
      interactionId: result.interactionId
    });
  } catch (error) {
    console.error('Error getting user intervention:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
};

/**
 * @swagger
 * /api/interactions/{interactionId}/steps/{stepId}/response:
 *   post:
 *     summary: Record a user's response to a step
 *     description: Saves the user's response to a specific step in an intervention
 *     tags: [Interventions]
 *     parameters:
 *       - in: path
 *         name: interactionId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Interaction ID
 *       - in: path
 *         name: stepId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StepResponse'
 *     responses:
 *       200:
 *         description: Response recorded successfully
 *       400:
 *         description: Missing parameters or response data
 *       404:
 *         description: Interaction or step not found
 *       500:
 *         description: Server error
 */
export const recordStepResponse = async (req: Request, res: Response) => {
  try {
    const { interactionId, stepId } = req.params;
    const { response } = req.body as { response: StepResponse };
    
    if (!interactionId || !stepId) {
      return res.status(400).json({ error: 'Missing interaction ID or step ID' });
    }
    
    if (!response) {
      return res.status(400).json({ error: 'Missing response data' });
    }
    
    // Check if the interaction and step exist
    const interaction = await prisma.userInteraction.findUnique({
      where: { id: interactionId }
    });
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    
    const step = await prisma.step.findUnique({
      where: { id: stepId }
    });
    
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }
    
    // Check if there's an existing response for this step in this interaction
    const existingResponse = await prisma.stepResponse.findFirst({
      where: {
        userInteractionId: interactionId,
        stepId
      }
    });
    
    // Convert StepResponse to Prisma.JsonValue
    const responseObject = JSON.parse(JSON.stringify(response));
    
    // If there's an existing response, update it, otherwise create a new one
    let stepResponse;
    if (existingResponse) {
      stepResponse = await prisma.stepResponse.update({
        where: { id: existingResponse.id },
        data: {
          response: responseObject as Prisma.InputJsonValue
        }
      });
    } else {
      stepResponse = await prisma.stepResponse.create({
        data: {
          userInteractionId: interactionId,
          stepId,
          response: responseObject as Prisma.InputJsonValue
        }
      });
    }
    
    return res.status(200).json(stepResponse);
  } catch (error) {
    console.error('Error recording step response:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message 
    });
  }
};

/**
 * @swagger
 * /api/interactions/{interactionId}/complete:
 *   post:
 *     summary: Mark an intervention as completed
 *     description: Updates an interaction to mark it as completed by the user
 *     tags: [Interventions]
 *     parameters:
 *       - in: path
 *         name: interactionId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Interaction ID
 *     responses:
 *       200:
 *         description: Intervention marked as completed
 *       400:
 *         description: Missing interaction ID
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
export const completeIntervention = async (req: Request, res: Response) => {
  try {
    const { interactionId } = req.params;
    
    if (!interactionId) {
      return res.status(400).json({ error: 'Missing interaction ID' });
    }
    
    // Check if the interaction exists
    const interaction = await prisma.userInteraction.findUnique({
      where: { id: interactionId }
    });
    
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    
    // Update the interaction to mark it as completed
    const updatedInteraction = await prisma.userInteraction.update({
      where: { id: interactionId },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });
    
    return res.status(200).json(updatedInteraction);
  } catch (error) {
    console.error('Error completing intervention:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message 
    });
  }
};

/**
 * @swagger
 * /api/users/{userId}/interactions:
 *   get:
 *     summary: Get a user's past interactions
 *     description: Retrieves a list of past interactions for a user
 *     tags: [Interventions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of interactions to return
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: List of interactions
 *       400:
 *         description: Missing user ID
 *       500:
 *         description: Server error
 */
export const getUserInteractions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '10', completed } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
    
    // Build the query
    const whereClause: any = { userId };
    
    // Filter by completion status if specified
    if (completed === 'true') {
      whereClause.completed = true;
    } else if (completed === 'false') {
      whereClause.completed = false;
    }
    
    // Get the user's interactions
    const interactions = await prisma.userInteraction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit as string, 10),
      include: {
        intervention: true,
        responses: true
      }
    });
    
    return res.status(200).json(interactions);
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message 
    });
  }
};
