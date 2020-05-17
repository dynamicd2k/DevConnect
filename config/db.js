const mongoose = require('mongoose');

const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    console.log('Mongo db connected, yes!');
  } catch (err) {
    console.error(error.message);
    //Exit process with failure
    process.exit(1);
  }
};
module.exports = connectDB;
