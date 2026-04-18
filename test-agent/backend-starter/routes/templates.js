const express = require('express');
const router = express.Router();
const ResponseTemplate = require('../models/responseTemplate');

// Generate seed data if empty
router.get('/seed', async (req, res, next) => {
  try {
    const count = await ResponseTemplate.countDocuments();
    if (count === 0) {
      const templates = [
        {
          id: 'tmpl_1',
          name: 'Say HI to welcome new visitors!',
          category: 'Onboarding',
          channel: 'Chat',
          content: 'Hi <user_name>! Welcome to <company_name>. How may I be of help today?',
          audience: 1234,
          createdBy: 'supervisor',
          isShared: false,
          dateString: 'Feb 7'
        },
        {
          id: 'tmpl_2',
          name: 'Ask new users if they need any help.',
          category: 'Onboarding',
          channel: 'Chat',
          content: 'Hi <user_name>! Welcome to <company_name>. Where are you stuck?',
          audience: 2345,
          createdBy: 'supervisor',
          isShared: false,
          dateString: 'Feb 9'
        },
        {
          id: 'tmpl_3',
          name: 'Take new users on a tour.',
          category: 'Onboarding',
          channel: 'Message',
          content: 'Hi <user_name>! Welcome to <company_name>. Allow me to show you around!',
          audience: 1234,
          createdBy: 'supervisor',
          isShared: false,
          dateString: 'Feb 1'
        },
        {
          id: 'tmpl_4',
          name: 'Learn about personalised experiences.',
          category: 'Personalization',
          channel: 'Website',
          content: 'Hi <user_name>! Can you take this quick survey to help us serve you better?',
          audience: 456,
          createdBy: 'supervisor',
          isShared: false,
          dateString: 'Feb 7'
        },
        {
          id: 'tmpl_5',
          name: 'Guide users through a new feature.',
          category: 'Features',
          channel: 'Chat',
          content: 'Hi <user_name>! We\'ve introduced a new feature. Let me show you!',
          audience: 1234,
          createdBy: 'supervisor',
          isShared: false,
          dateString: 'Feb 2'
        }
      ];
      await ResponseTemplate.insertMany(templates);
      return res.json({ message: 'Seeded successfully', templates });
    }
    res.json({ message: 'Already seeded' });
  } catch (error) {
    next(error);
  }
});

// GET /api/templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await ResponseTemplate.find();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// POST /api/templates
router.post('/', async (req, res, next) => {
  try {
    const { name, title, category, channel, content, isShared } = req.body;
    
    if (!name || !category || !content) {
      return res.status(400).json({ message: 'Name, category, and content are required' });
    }

    const newTemplate = new ResponseTemplate({
      id: `tmpl_${Date.now()}`,
      name,
      title,
      category,
      channel: channel || 'Chat',
      content,
      audience: 0,
      createdBy: 'supervisor',
      isShared: !!isShared,
      dateString: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });

    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    next(error);
  }
});

// PUT /api/templates/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, title, category, channel, content, isShared } = req.body;
    const template = await ResponseTemplate.findOneAndUpdate(
      { id: req.params.id },
      { name, title, category, channel: channel || 'Chat', content, isShared: !!isShared },
      { new: true }
    );
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOneAndDelete({ id: req.params.id });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
