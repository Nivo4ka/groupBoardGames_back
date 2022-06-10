const User = require("../../DB/models/users");
const Player = require("../../DB/models/players");
const jwt = require("jsonwebtoken");

const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

const mapAsync = (arr, func) => Promise.all(arr.map(func));

module.exports.postPlayer = async (req, res) => {
  const { eventID } = req.body;
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  if (_id) {
    if (!eventID) {
      res.status(409).send("One of the fields is not filled in");
    } else {
      const player = new Player({
        userID: _id,
        eventID,
      });
      player.save().then(() => {
        Player.find({ eventID }).then(async (qwe) => {
          const players = await mapAsync(qwe, async (i) => {
            const user = await User.findOne(
              { _id: i.userID },
              "_id firstName secondName avatar"
            );
            return { ...i, user };
          });
          res.send({ players });
        });
      });
    }
  } else {
    res.status(401).send("User is not logged in");
  }
};

module.exports.delPlayer = async (req, res) => {
  const { headers, query } = req;
  const { id } = query;
  const { _id } = parseJwt(headers.token);
  if (_id && id) {
    Player.deleteOne({
      eventID: id,
      userID: _id,
    }).then(() => {
      Player.find({ eventID: id }).then(async (qwe) => {
        const players = await mapAsync(qwe, async (i) => {
          const user = await User.findOne(
            { _id: i.userID },
            "_id firstName secondName avatar"
          );
          return { ...i, user };
        });
        res.send({ players });
      });
    });
  } else {
    res.status(409).send("User cannot unsubscribe");
  }
};
