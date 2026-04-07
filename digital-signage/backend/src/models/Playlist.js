const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  items: [{
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    duration: {
      type: Number,
      default: 10
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  schedule: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    startTime: {
      type: String
    },
    endTime: {
      type: String
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

playlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Playlist', playlistSchema);
