const mongoose = require("mongoose");
const { stringify } = require("uuid");
const { Schema } = mongoose;
const playerSchema = new Schema({
  eventID: String,
  userID: String,
});

module.exports = Player = mongoose.model("players", playerSchema);
