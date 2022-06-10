const mongoose = require("mongoose");
const { Schema } = mongoose;
const gameSchema = new Schema({
  name: String,
  image: String,
  link: String,
  minPersons: String,
  maxPersons: String,
});

module.exports = Game = mongoose.model("games", gameSchema);
