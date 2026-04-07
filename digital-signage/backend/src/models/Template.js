const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    enum: ['news', 'weather', 'social', 'promotional', 'information', 'custom'],
    default: 'custom'
  },
  layout: {
    type: String,
    enum: ['single', 'split-horizontal', 'split-vertical', 'grid-2x2', 'grid-3x3', 'custom'],
    default: 'single'
  },
  zones: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'text', 'html', 'webpage', 'clock', 'weather', 'rss'],
      required: true
    },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    duration: {
      type: Number,
      default: 10
    },
    transition: {
      type: String,
      enum: ['none', 'fade', 'slide', 'zoom'],
      default: 'fade'
    },
    backgroundColor: {
      type: String
    },
    content: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  settings: {
    backgroundColor: {
      type: String,
      default: '#000000'
    },
    orientation: {
      type: String,
      enum: ['landscape', 'portrait'],
      default: 'landscape'
    },
    resolution: {
      width: {
        type: Number,
        default: 1920
      },
      height: {
        type: Number,
        default: 1080
      }
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', templateSchema);
