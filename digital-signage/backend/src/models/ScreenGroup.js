const mongoose = require('mongoose');

const screenGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  screens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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

screenGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScreenGroup', screenGroupSchema);
