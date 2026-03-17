const mongoose = require('mongoose');
const env = require('./env');

const connectDb = async () => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  return mongoose.connection;
};

module.exports = { connectDb };
