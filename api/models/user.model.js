// importing dependencies
const mongoose = require("mongoose");

// creating product schema to be stored in db
const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  fullName: String,
  isAccess: Boolean
});

// exporting schema
module.exports = mongoose.model("User", userSchema);
