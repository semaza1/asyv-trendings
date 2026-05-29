// debugUsers.js - Run this to check what's in your database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const debugUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for debugging...');

    // Check all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== Available Collections ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Try to find documents in the 'users' collection
    console.log('\n=== Checking users collection directly ===');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const usersCount = await usersCollection.countDocuments();
    console.log(`Documents in 'users' collection: ${usersCount}`);
    
    if (usersCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('Users found:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${JSON.stringify(user, null, 2)}`);
      });
    }

    // Try with User model
    console.log('\n=== Checking with User model ===');
    const User = require('./models/User.js');
    const modelUsers = await User.find({});
    console.log(`Users found with model: ${modelUsers.length}`);
    
    if (modelUsers.length > 0) {
      modelUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
    }

    // Check database name
    console.log(`\n=== Database Info ===`);
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    console.log(`Connection URI: ${process.env.MONGO_URI}`);

    process.exit();
  } catch (error) {
    console.error('Error debugging users:', error);
    process.exit(1);
  }
};

debugUsers();