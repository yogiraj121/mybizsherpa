import { v4 as uuidv4 } from 'uuid';
import InsightModel from '../models/insightModel.js';
import AIService from '../services/aiService.js';

class InsightController {
  static async getHealth(req, res) {
    res.json({
      status: 'healthy',
      message: 'MyBizSherpa API is running',
      timestamp: new Date().toISOString(),
    });
  }

  static async testConnection(req, res) {
    res.json({
      message: 'Frontend-Backend connection successful!',
      timestamp: new Date().toISOString(),
      frontend_url: 'http://localhost:3000',
      backend_url: `http://localhost:${process.env.PORT || 8000}`,
    });
  }

  static async processTranscript(req, res) {
    try {
      const { transcript, company_name, attendees, date } = req.body;

      if (!transcript || !company_name || !attendees || !date) {
        return res.status(400).json({
          error: 'Missing required fields: transcript, company_name, attendees, date',
        });
      }

      const insight = await AIService.processTranscript(
        transcript,
        company_name,
        attendees,
        date
      );

      const insightData = {
        id: uuidv4(),
        type: 'transcript',
        content: insight,
        metadata: { company_name, attendees, date },
        created_at: new Date().toISOString(),
      };

      const savedInsight = await InsightModel.create(insightData);
      res.json(savedInsight);
    } catch (error) {
      console.error('Transcript insight error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error',
      });
    }
  }

  static async processLinkedIn(req, res) {
    try {
      const { linkedin_bio, pitch_deck, company_name, role } = req.body;

      if (!linkedin_bio || !pitch_deck || !company_name || !role) {
        return res.status(400).json({
          error: 'Missing required fields: linkedin_bio, pitch_deck, company_name, role',
        });
      }

      const insight = await AIService.processLinkedIn(
        linkedin_bio,
        pitch_deck,
        company_name,
        role
      );

      const insightData = {
        id: uuidv4(),
        type: 'linkedin',
        content: insight,
        metadata: { company_name, role },
        created_at: new Date().toISOString(),
      };

      const savedInsight = await InsightModel.create(insightData);
      res.json(savedInsight);
    } catch (error) {
      console.error('LinkedIn insight error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error',
      });
    }
  }

  static async getAllInsights(req, res) {
    try {
      const insights = await InsightModel.findAll();
      res.json(insights);
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error',
      });
    }
  }

  static async getInsightById(req, res) {
    try {
      const { id } = req.params;
      const insight = await InsightModel.findById(id);
      
      if (!insight) {
        return res.status(404).json({ error: 'Insight not found' });
      }
      
      res.json(insight);
    } catch (error) {
      console.error('Get insight error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error',
      });
    }
  }
}

export default InsightController;
