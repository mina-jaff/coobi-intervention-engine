import express from 'express';
import {
  getUserIntervention,
  recordStepResponse,
  completeIntervention,
  getUserInteractions
} from '../controllers/interventionController';

const router = express.Router();

// Routes
router.get('/users/:userId/interventions/today', getUserIntervention);
router.post('/interactions/:interactionId/steps/:stepId/response', recordStepResponse);
router.post('/interactions/:interactionId/complete', completeIntervention);
router.get('/users/:userId/interactions', getUserInteractions);

export default router;
