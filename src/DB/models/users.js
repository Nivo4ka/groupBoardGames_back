const mongoose = require("mongoose");
const { stringify } = require("uuid");
const { Schema } = mongoose;
const userSchema = new Schema({
  firstName: String,
  secondName: String,
  lastName: String,
  login: String,
  email: String,
  password: String,
  region: String,
  locality: String,
  avatar: String,
  role: String,
});

module.exports = User = mongoose.model("users", userSchema);
