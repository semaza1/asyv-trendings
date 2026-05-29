const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    // Extract the base URI without database
    const baseUri = process.env.MONGO_URI;
    
    // Connect with explicit database name
    await mongoose.connect(baseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'asyvtrendings' // Specify your database name here
    });
    
    console.log('MongoDB connected to database: asyvtrendings');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};