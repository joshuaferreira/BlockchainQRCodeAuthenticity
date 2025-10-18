const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  scanResult: {
    type: String,
    enum: ['NOT_FOUND', 'AUTHENTIC', 'ALREADY_SOLD'],
    required: true
  },
  timestamp: { //Gemini Suggests to remove this field later as it is redundant with createdAt
    type: Date,
    default: Date.now,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  address: {
    type: String, // Human-readable address
    required: false
  },
  blockchainData: {
    manufacturer: String,
    batchNumber: String,
    category: String,
    status: String
  },
  deviceInfo: {
    userAgent: String,
    platform: String
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Geospatial index for location queries
scanLogSchema.index({ location: '2dsphere' });

// Index for fraud detection queries
scanLogSchema.index({ productId: 1, scanResult: 1, timestamp: -1 });

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

module.exports = ScanLog;