const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen'
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'linux', 'windows'],
    default: 'web'
  },
  version: {
    type: String
  },
  ipAddress: {
    type: String
  },
  resolution: {
    width: Number,
    height: Number
  },
  orientation: {
    type: String,
    enum: ['landscape', 'portrait'],
    default: 'landscape'
  },
  brightness: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  volume: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastHeartbeat: {
    type: Date
  },
  config: {
    autoStart: {
      type: Boolean,
      default: true
    },
    updateInterval: {
      type: Number,
      default: 30
    }
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

deviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Device', deviceSchema);
