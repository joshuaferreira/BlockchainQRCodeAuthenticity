const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Mongoose 6+ has these options as default, so they are no longer needed.
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product-verifier');
    
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

/*
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product-verifier', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

Redundant options removed as they are now defaults in Mongoose 6+
*/