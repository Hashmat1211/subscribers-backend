// importing dependencies
const mongoose = require("mongoose");

// creating product schema to be stored in db
const FileSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    accessToken: {
      type: String
      // unique: true,
    },
    fileName: {
      type: String,
      unique: false
    },
    filePath: {
      type: String,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: false
    }
  },
  { timestamps: true }
);

/* 
    compound index used for unique of filename against each user
*/
FileSchema.index({ fileName: 1, user: 1 }, { unique: true });
// exporting schema
module.exports = mongoose.model("File", FileSchema);
