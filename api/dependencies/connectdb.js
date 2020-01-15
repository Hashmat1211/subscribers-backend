//db connection
const mongoose = require("mongoose");
const config = require("./config");

const connection = () => {
  mongoose
    .connect(
      // `mongodb+srv://admin:${config.MONGO_ATLAS_PW}@manychatsubscribers-fpfhg.mongodb.net/test?retryWrites=true&w=majority`,
      `mongodb+srv://hashmat2526:superior.com@mflix-kkh9f.mongodb.net/subscribers?retryWrites=true&w=majority`,
      {
        useCreateIndex: true,
        useNewUrlParser: true
      }
    )
    .catch(err => {
      res.status(500).json({
        err: err
      });
    });

  // using mongoose promise
  mongoose.Promise = global.Promise;
};
module.exports = connection;
