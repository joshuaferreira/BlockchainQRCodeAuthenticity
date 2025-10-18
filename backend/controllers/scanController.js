const ScanLog = require('../models/ScanLog');

// Log a scan
exports.logScan = async (req, res) => {
  try {
    const {
      productId,
      scanResult,
      latitude,
      longitude,
      address,
      blockchainData,
      deviceInfo
    } = req.body;

    const scanLog = new ScanLog({
      productId,
      scanResult,
      location: latitude && longitude ? {
        type: 'Point',
        coordinates: [longitude, latitude]
      } : undefined,
      address,
      blockchainData,
      deviceInfo
    });

    await scanLog.save();

    res.status(201).json({
      success: true,
      message: 'Scan logged successfully',
      data: scanLog
    });
  } catch (error) {
    console.error('Error logging scan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log scan',
      error: error.message
    });
  }
};

// Get all scans (for admin dashboard)
exports.getAllScans = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      scanResult, 
      productId,
      limit = 100 
    } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (scanResult) query.scanResult = scanResult;
    if (productId) query.productId = productId;

    const scans = await ScanLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Math.min(parseInt(limit) || 100, 1000));

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scans',
      error: error.message
    });
  }
};

// Get fraud analytics
exports.getFraudAnalytics = async (req, res) => {
  try {
    // Pattern 1: High "NOT_FOUND" scans by location
    const notFoundByLocation = await ScanLog.aggregate([
      { $match: { scanResult: 'NOT_FOUND' } },
      {
        $group: {
          _id: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] }
          },
          count: { $sum: 1 },
          products: { $addToSet: '$productId' }
        }
      },
      { $match: { count: { $gte: 5 } } }, // 5+ suspicious scans
      { $sort: { count: -1 } }
    ]);

    // Pattern 2: Multiple "ALREADY_SOLD" scans for same product
    const duplicateScans = await ScanLog.aggregate([
      { $match: { scanResult: 'ALREADY_SOLD' } },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
          locations: {
            $push: {
              coordinates: '$location.coordinates',
              address: '$address',
              timestamp: '$timestamp'
            }
          }
        }
      },
      { $match: { count: { $gte: 3 } } }, // Same product scanned 3+ times as "sold"
      { $sort: { count: -1 } }
    ]);

    // General statistics
    const stats = await ScanLog.aggregate([
      {
        $group: {
          _id: '$scanResult',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        suspiciousLocations: notFoundByLocation,
        duplicateProducts: duplicateScans,
        statistics: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get scans near a location (for map visualization)
exports.getScansNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    const scans = await ScanLog.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).limit(100);

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby scans',
      error: error.message
    });
  }
};

// Get suspicious products (flagged)
exports.getSuspiciousProducts = async (req, res) => {
  try {
    // Products with high duplicate scan rates
    const suspicious = await ScanLog.aggregate([
      { $match: { scanResult: { $in: ['ALREADY_SOLD', 'NOT_FOUND'] } } },
      {
        $group: {
          _id: '$productId',
          totalScans: { $sum: 1 },
          notFoundScans: {
            $sum: { $cond: [{ $eq: ['$scanResult', 'NOT_FOUND'] }, 1, 0] }
          },
          alreadySoldScans: {
            $sum: { $cond: [{ $eq: ['$scanResult', 'ALREADY_SOLD'] }, 1, 0] }
          },
          uniqueLocations: { $addToSet: '$location.coordinates' },
          firstScan: { $min: '$timestamp' },
          lastScan: { $max: '$timestamp' }
        }
      },
      {
        $match: {
          $or: [
            { alreadySoldScans: { $gte: 3 } },
            { notFoundScans: { $gte: 5 } }
          ]
        }
      },
      { $sort: { totalScans: -1 } }
    ]);

    res.json({
      success: true,
      count: suspicious.length,
      data: suspicious
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suspicious products',
      error: error.message
    });
  }
};