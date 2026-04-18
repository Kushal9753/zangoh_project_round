const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');

// SSE Endpoint for live metrics updating every 2 seconds
router.get('/stream', (req, res) => {
  // Required headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendMetrics = async () => {
    try {
      const active = await Conversation.countDocuments({ status: 'active' });
      const escalated = await Conversation.countDocuments({ status: 'escalated' });
      const total = await Conversation.countDocuments();
      
      const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0;
      
      const convs = await Conversation.find({}, 'metrics');
      let totalRespTime = 0;
      let totalSentiment = 0;
      let countWithMetrics = 0;
      
      convs.forEach(c => {
         if (c.metrics && (c.metrics.responseTime !== undefined || c.metrics.sentiment !== undefined)) {
            totalRespTime += (c.metrics.responseTime || 0);
            totalSentiment += (c.metrics.sentiment || 0);
            countWithMetrics++;
         }
      });
      
      // Calculate Average Response Time format MM:SS
      const avgResponseTimeSecs = countWithMetrics > 0 ? Math.round(totalRespTime / countWithMetrics) : 84; 
      const mins = Math.floor(avgResponseTimeSecs / 60);
      const secs = avgResponseTimeSecs % 60;
      const formattedResponseTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      // Calculate CSAT out of 10 based on sentiment 0-1
      const avgSentiment = countWithMetrics > 0 ? totalSentiment / countWithMetrics : 0.79;
      const csat = (avgSentiment * 10).toFixed(1);

      const metrics = {
        activeConversations: active,
        escalationRate: escalationRate,
        avgResponseTime: formattedResponseTime,
        csat: csat,
      };
      
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (err) {
      console.error('Error fetching metrics for SSE:', err);
    }
  };

  // Send initial data immediately
  sendMetrics();

  // Send updates every 2 seconds
  const intervalId = setInterval(sendMetrics, 2000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

module.exports = router;
