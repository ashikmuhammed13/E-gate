const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI;

mongoose.set('strictQuery', true);

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('open', () => {
  console.log(`Connected to database: ${mongoose.connection.name}`);
});

db.on('disconnected', () => {
  console.log('Mongoose Disconnected');
});

module.exports = db;

