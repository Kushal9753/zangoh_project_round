// routes/agents.js
const express = require('express');
const router = express.Router();
const Agent = require('../models/agent');
const { simulateDelay } = require('../utils/helpers');

// Seed predefined agents
router.get('/seed', async (req, res, next) => {
  try {
    const existing = await Agent.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Agents already seeded' });
    }

    const defaultAgents = [
      {
        id: 'csr-agent-1',
        name: 'CSR AI Agent',
        model: 'gpt-4',
        description: 'Customer Service Representative Agent',
        parameters: { temperature: 0.5, max_tokens: 150, top_p: 0.7, speed: 0.5, stability: 0.5 },
        capabilities: [
          { id: 'cap-decision', name: 'Decision Making', enabled: true },
          { id: 'cap-perception', name: 'Perception', enabled: true },
          { id: 'cap-autonomy', name: 'Autonomy', enabled: false },
          { id: 'cap-learning', name: 'Learning', enabled: false }
        ],
        knowledgeBases: [
          { id: 'kb-internal', name: 'Internal Articles', enabled: true },
          { id: 'kb-public', name: 'Public Articles', enabled: true },
          { id: 'kb-permissions', name: 'Permissions', enabled: false }
        ],
        escalationThresholds: { lowConfidence: 0.3, negativeSentiment: 0.8, responseTime: 10 }
      },
      {
        id: 'sales-agent-1',
        name: 'Sales AI Agent',
        model: 'gpt-4',
        description: 'Sales and Leads Agent',
        parameters: { temperature: 0.7, max_tokens: 200, top_p: 0.8, speed: 0.8, stability: 0.4 },
        capabilities: [
          { id: 'cap-decision', name: 'Decision Making', enabled: true },
          { id: 'cap-learning', name: 'Learning', enabled: true }
        ],
        knowledgeBases: [
          { id: 'kb-internal', name: 'Internal Articles', enabled: true },
          { id: 'kb-public', name: 'Public Articles', enabled: true }
        ],
        escalationThresholds: { lowConfidence: 0.4, negativeSentiment: 0.7, responseTime: 5 }
      },
      {
        id: 'support-agent-1',
        name: 'Support AI Agent',
        model: 'gpt-4',
        description: 'Technical Support Agent',
        parameters: { temperature: 0.3, max_tokens: 300, top_p: 0.9, speed: 0.3, stability: 0.9 },
        capabilities: [
          { id: 'cap-decision', name: 'Decision Making', enabled: true },
          { id: 'cap-autonomy', name: 'Autonomy', enabled: true }
        ],
        knowledgeBases: [
          { id: 'kb-internal', name: 'Internal Articles', enabled: true },
          { id: 'kb-public', name: 'Public Articles', enabled: true },
          { id: 'kb-permissions', name: 'Permissions', enabled: true }
        ],
        escalationThresholds: { lowConfidence: 0.2, negativeSentiment: 0.9, responseTime: 15 }
      }
    ];

    await Agent.insertMany(defaultAgents);
    res.json({ message: 'Seeded default agents' });
  } catch (error) {
    next(error);
  }
});

// Get all agents
router.get('/', async (req, res, next) => {
  try {
    const agents = await Agent.find();
    
    await simulateDelay(200); // Simulate network delay
    
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

// Get a specific agent
router.get('/:id', async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ id: req.params.id });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    await simulateDelay(200); // Simulate network delay
    
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Update agent configuration
router.patch('/:id/config', async (req, res, next) => {
  try {
    const { parameters, capabilities, knowledgeBases, escalationThresholds } = req.body;
    
    const agent = await Agent.findOne({ id: req.params.id });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Update only provided fields
    if (parameters) agent.parameters = { ...agent.parameters, ...parameters };
    
    if (capabilities) {
      capabilities.forEach(cap => {
        const existing = agent.capabilities.find(c => c.id === cap.id);
        if (existing) {
          existing.enabled = cap.enabled;
        }
      });
    }
    
    if (knowledgeBases) {
      knowledgeBases.forEach(kb => {
        const existing = agent.knowledgeBases.find(k => k.id === kb.id);
        if (existing) {
          existing.enabled = kb.enabled;
        }
      });
    }
    
    if (escalationThresholds) {
      agent.escalationThresholds = { ...agent.escalationThresholds, ...escalationThresholds };
    }
    
    await agent.save();
    
    await simulateDelay(300); // Simulate network delay
    
    res.json({ message: 'Agent configuration updated', agent });
  } catch (error) {
    next(error);
  }
});

// Get agent performance metrics
router.get('/:id/metrics', async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ id: req.params.id });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // This would normally fetch metrics from analytics service
    const metrics = agent.metrics || {
      conversations: 0,
      avgResponseTime: 0,
      satisfaction: 0,
      escalationRate: 0,
      topIssues: []
    };
    
    await simulateDelay(300); // Simulate network delay
    
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

module.exports = router;