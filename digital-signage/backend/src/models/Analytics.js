const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  eventType: {
    type: String,
    enum: ['play', 'impression', 'click', 'error', 'heartbeat'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number
  },
  metadata: {
    playedDuration: Number,
    completionRate: Number,
    errors: [{
      code: String,
      message: String,
      timestamp: Date
    }],
    interactions: [{
      type: String,
      x: Number,
      y: Number,
      timestamp: Date
    }]
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  audience: {
    estimatedViewers: Number,
    demographics: {
      ageGroup: String,
      gender: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

analyticsSchema.index({ screen: 1, timestamp: -1 });
analyticsSchema.index({ content: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
