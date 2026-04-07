const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  deviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  lastSeen: {
    type: Date
  },
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],
  currentContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
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

screenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Screen', screenSchema);
