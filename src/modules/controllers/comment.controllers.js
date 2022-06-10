const CommenT = require("../../DB/models/comments");
const User = require("../../DB/models/users");
const jwt = require("jsonwebtoken");

const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

const mapAsync = (arr, func) => Promise.all(arr.map(func));

module.exports.postComment = async (req, res) => {
  const { eventID, description } = req.body;
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  if (_id) {
    if (!eventID || !description) {
      res.status(409).send("One of the fields is not filled in");
    } else {
      const comment = new CommenT({
        userID: _id,
        eventID,
        description,
      });
      comment.save().then(() => {
        CommenT.find({ eventID }).then(async (result) => {
          const comments = await mapAsync(result, async (i) => {
            const user = await User.findOne(
              { _id: i.userID },
              "_id firstName secondName avatar"
            );
            return { ...i, user };
          });
          res.send({ comments });
        });
      });
    }
  } else {
    res.status(401).send("User is not logged in");
  }
};

module.exports.delComment = async (req, res) => {
  const { headers, body, query } = req;
  const { eventID } = body;
  const { id } = query;
  const { _id, role } = parseJwt(headers.token);
  if (_id && id && role !== "admin") {
    Game.deleteOne({
      _id: id,
      userID: _id,
    }).then(() => {
      Comment.find({ eventID }).then((result) => {
        res.send({ comments: result });
      });
    });
  } else {
    if (_id && id && role === "admin") {
      Game.deleteOne({
        _id: id,
      }).then(() => {
        Comment.find({ eventID }).then((result) => {
          res.send({ comments: result });
        });
      });
    } else {
      res.status(409).send("User can`t delete this comment");
    }
  }
};
