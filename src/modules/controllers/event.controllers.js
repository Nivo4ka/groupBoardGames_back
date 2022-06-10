const Event = require("../../DB/models/events");
const Game = require("../../DB/models/games");
const User = require("../../DB/models/users");
const Review = require("../../DB/models/reviews");
const Player = require("../../DB/models/players");
const CommenT = require("../../DB/models/comments");
const jwt = require("jsonwebtoken");

const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

const mapAsync = (arr, func) => Promise.all(arr.map(func));

module.exports.postEvent = async (req, res) => {
  const {
    name,
    description,
    gameID,
    region,
    locality,
    street,
    houseNumber,
    latitude,
    longitude,
    dateTime,
    count,
  } = req.body;
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  if (_id) {
    const autorID = _id;
    if (
      !name ||
      !description ||
      !gameID ||
      !region ||
      !locality ||
      !street ||
      !houseNumber ||
      !latitude ||
      !longitude ||
      !autorID ||
      !dateTime ||
      !count
    ) {
      res.status(409).send("One of the fields is not filled in");
    } else {
      const event = new Event({
        region,
        locality,
        street,
        houseNumber,
        latitude,
        longitude,
        name,
        description,
        gameID,
        autorID,
        dateTime,
        count,
      });
      const today = Date.now();
      event.save().then(() => {
        Event.find({ $and: [{ autorID }, { dateTime: { $gte: today } }] })
          .then(async (result) => {
            const events = await mapAsync(result, async (i) => {
              const games = await Game.find({ _id: i.gameID });
              return { ...i, games };
            });
            res.send({ events });
          })
          .catch((err) => res.send(err));
      });
    }
  } else {
    res.status(401).send("Error of authorization");
  }
};

module.exports.getEvent = async (req, res) => {
  const { query } = req;
  const { _id } = query;
  Event.findOne({ _id })
    .then(async (result) => {
      const games = await Game.find({ _id: result.gameID });

      Player.find({ eventID: _id }).then(async (qwe) => {
        const players = await mapAsync(qwe, async (i) => {
          const user = await User.findOne(
            { _id: i.userID },
            "_id firstName secondName avatar"
          );
          return { ...i, user };
        });
        CommenT.find({ eventID: _id }).then(async (resCom) => {
          const comments = await mapAsync(resCom, async (i) => {
            const user = await User.findOne(
              { _id: i.userID },
              "_id firstName secondName avatar"
            );
            return { ...i, user };
          });
          let autor = await User.findOne(
            { _id: result.autorID },
            "_id firstName secondName avatar"
          );
          await Review.find({ autorID: result.autorID })
            .sort({ created_at: -1 })
            .then(async (resUsers) => {
              const rating = await mapAsync(resUsers, async (i) => {
                const user = await User.findOne(
                  { _id: i.userID },
                  "_id firstName secondName avatar"
                );
                return { ...i, user };
              });
              res.send({
                event: { result, games, players, comments, autor, rating },
              });
            });
        });
      });
    })
    .catch((err) => res.send(err));
};

module.exports.getEvents = async (req, res) => {
  const { body } = req;
  const { games, region, locality, dateBefore, dateAfter, direction } = body;
  const today = new Date();
  const after = dateAfter || "9999-12-31";
  const before = dateBefore || "1970-01-01";
  let gamesID = games.map((elem) => {
    return elem._id;
  });
  let sortObj = {};
  if (region) sortObj.region = region;
  if (locality) sortObj.locality = locality;
  if (gamesID.length != 0) sortObj.gameID = { $in: gamesID };
  Event.find({
    $and: [
      { ...sortObj },
      { dateTime: { $gte: today } },
      { dateTime: { $gte: Date.parse(before) } },
      { dateTime: { $lte: Date.parse(after) } },
    ],
  })
    .sort(direction != 0 ? { dateTime: direction } : { _id: direction })
    .then(async (result) => {
      const events = await mapAsync(result, async (i) => {
        const games = await Game.find({ _id: i.gameID });
        return { ...i, games };
      });
      res.send({ events });
    });
};

module.exports.getMyEvents = async (req, res) => {
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  const today = Date.now();
  if (_id)
    Event.find({
      $and: [{ autorID: _id }, { dateTime: { $gte: today } }],
    })
      .then(async (result) => {
        const events = await mapAsync(result, async (i) => {
          const games = await Game.find({ _id: i.gameID });
          return { ...i, games };
        });
        res.send({ events });
      })
      .catch((err) => res.send(err));
  else res.status(401).send("Error of authorization");
};

module.exports.getPlayersEvents = async (req, res) => {
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  const today = Date.now();
  if (_id)
    Player.find({ userID: _id }).then((resul) => {
      let arrEvents = resul.map((elem) => {
        return elem.eventID;
      });
      Event.find({
        $and: [{ _id: { $in: arrEvents } }, { dateTime: { $gte: today } }],
      })
        .then(async (result) => {
          const events = await mapAsync(result, async (i) => {
            const games = await Game.find({ _id: i.gameID });
            return { ...i, games };
          });
          res.send({ events });
        })
        .catch((err) => res.send(err));
    });
  else res.status(401).send("Error of authorization");
};

module.exports.getEventsForReviews = async (req, res) => {
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  const today = Date.now();
  if (_id)
    Player.find({ userID: _id }).then((resul) => {
      let arrEvents = resul.map((elem) => {
        return elem.eventID;
      });
      Event.find({
        $and: [{ _id: { $in: arrEvents } }, { dateTime: { $lte: today } }],
      })
        .then(async (result) => {
          let events = await mapAsync(result, async (i) => {
            const games = await Game.find({ _id: i.gameID });
            const review = await Review.findOne({
              $and: [{ eventID: i._id }, { userID: _id }],
            });
            return { ...i, games, review };
          });

          res.send({ events });
        })
        .catch((err) => res.send(err));
    });
  else res.status(401).send("Error of authorization");
};

module.exports.patchEvent = async (req, res) => {
  const { headers, body } = req;
  const {
    id,
    name,
    description,
    gameID,
    region,
    locality,
    street,
    houseNumber,
    latitude,
    longitude,
    dateTime,
    autorID,
    count,
  } = body;
  const { _id } = parseJwt(headers.token);
  const today = Date.now();
  if (autorID == _id) {
    if (
      id &&
      name &&
      description &&
      gameID &&
      region &&
      locality &&
      street &&
      houseNumber &&
      latitude &&
      longitude &&
      dateTime &&
      count
    ) {
      Event.updateOne({ _id: id }, body).then(() => {
        Event.find({ $and: [{ autorID: _id }, { dateTime: { $gte: today } }] })
          .then(async (result) => {
            const events = await mapAsync(result, async (i) => {
              const games = await Game.find({ _id: i.gameID });
              return { ...i, games };
            });
            res.send({ events });
          })
          .catch((err) => res.send(err));
      });
    } else {
      res.status(409).send("One of the fields is not filled in");
    }
  } else {
    res.status(401).send("Error of authorization");
  }
};

module.exports.delEvent = async (req, res) => {
  const { headers, query } = req;
  const { id } = query;
  const { _id } = parseJwt(headers.token);
  const checkEvent = await Event.findOne({ _id: id });
  if (_id) {
    if (checkEvent.autorID === _id) {
      Player.deleteMany({ eventID: id }).then(() => {
        CommenT.deleteMany({ eventID: id }).then(() => {
          Event.deleteOne({ _id: id }).then(() => {
            Event.find({ autorID: _id })
              .then(async (result) => {
                const events = await mapAsync(result, async (i) => {
                  const games = await Game.find({ _id: i.gameID });
                  return { ...i, games };
                });
                res.send({ events });
              })
              .catch((err) => res.send(err));
          });
        });
      });
    } else {
      res
        .status(409)
        .send("Delete error, it is not known which record to delete");
    }
  } else {
    res.status(401).send("Error of authorization");
  }
};
