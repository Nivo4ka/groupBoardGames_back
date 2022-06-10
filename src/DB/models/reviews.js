const mongoose = require("mongoose");
const { Schema } = mongoose;
const reviewSchema = new Schema({
  userID: String,
  autorID: String,
  description: String,
  rating: Intl,
  eventID: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = Review = mongoose.model("reviews", reviewSchema);
