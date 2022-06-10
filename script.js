const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const apiRoutes = require("./src/modules/routes/routes.js");
const fileUpload = require("express-fileupload");
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static(__dirname + "/src/source/images"));
app.use("/", apiRoutes);

const url =
  "mongodb+srv://user:user@cluster0.zqpi2.mongodb.net/GroupBoardGames?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(8080, () => {
  console.log("Example app listening on port 8080!");
});
