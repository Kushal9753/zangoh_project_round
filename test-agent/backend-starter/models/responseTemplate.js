const mongoose = require('mongoose');

const responseTemplateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    default: 'Chat'
  },
  content: {
    type: String,
    required: true
  },
  audience: {
    type: Number,
    default: 0
  },
  dateString: {
    type: String,
    default: 'Feb 1'
  },
  variables: [{
    name: String,
    description: String
  }],
  createdBy: String,
  isShared: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ResponseTemplate', responseTemplateSchema);
