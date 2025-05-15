import express from 'express';
import interventionRoutes from './interventionRoutes';

const router = express.Router();

// API routes
router.use('/api', interventionRoutes);

export default router;
