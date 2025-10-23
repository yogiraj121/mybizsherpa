import { Router } from 'express';
import InsightController from '../controllers/insightController.js';

const router = Router();

// Health check
router.get('/health', InsightController.getHealth);

// Test endpoint for frontend-backend connection
router.get('/test', InsightController.testConnection);

// Transcript insight
router.post('/transcript-insight', InsightController.processTranscript);

// LinkedIn insight
router.post('/linkedin-insight', InsightController.processLinkedIn);

// Get all insights
router.get('/insights', InsightController.getAllInsights);

// Get single insight by ID
router.get('/insights/:id', InsightController.getInsightById);

export default router;
