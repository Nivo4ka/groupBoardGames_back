const mongoose = require("mongoose");
const { stringify } = require("uuid");
const { Schema } = mongoose;
const eventSchema = new Schema({
  name: String,
  description: String,
  gameID: Array,
  region: String,
  locality: String,
  street: String,
  houseNumber: String,
  latitude: String,
  longitude: String,
  autorID: String,
  dateTime: { type: Date, index: { expires: "3d" } },
  count: Intl,
});

module.exports = EvenT = mongoose.model("events", eventSchema);
