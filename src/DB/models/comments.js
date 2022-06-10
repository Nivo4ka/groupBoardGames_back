const mongoose = require("mongoose");
const { Schema } = mongoose;
const commentSchema = new Schema({
  userID: String,
  eventID: String,
  description: String,
});

module.exports = CommenT = mongoose.model("comments", commentSchema);
